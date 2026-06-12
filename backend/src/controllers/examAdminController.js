const { Exam, ExamSection, ExamQuestion } = require('../models')
// Use lib path directly — avoids the test-file read that main index.js triggers
const pdfParse = require('pdf-parse/lib/pdf-parse.js')

// ── PDF parsing helpers ──────────────────────────────────────────────────────

function detectSectionType(line) {
  if (/听力|nghe|listen/i.test(line)) return 'listening'
  if (/书写|填空|填写|điền|viết|fill|writ/i.test(line)) return 'fill'
  return 'reading'
}

const SECTION_RES = [
  /第[一二三四五六七八九十百]+部分/,
  /phần\s*\d*\s*[:：]?\s*(nghe|đọc|điền|viết)/i,
  /^\s*(nghe hiểu|đọc hiểu|điền từ|listening|reading|writing)\s*$/i,
  /听力[理解]?/,
  /阅读[理解]?/,
  /书写|填空/,
]

function parsePdfText(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 1)
  const Q_RE = /^(?:câu\s+)?(\d{1,3})[.、．。）\)\s]\s*(.{2,})/i
  const OPT_RE = /^([A-D])[.、．。）\)\s]\s*(.{1,})/

  const sections = []
  let cur = null     // current section
  let cq = null      // current question

  const saveQ = () => { if (cq && cur) { if (cq.options.length < 2) cq.options = null; cur.questions.push(cq); cq = null } }
  const saveS = () => { saveQ(); if (cur) sections.push(cur); cur = null }

  for (const line of lines) {
    if (/^\d+$/.test(line) || line.length < 2) continue

    const isSec = SECTION_RES.some(r => r.test(line)) && line.length < 80
    if (isSec) {
      saveS()
      cur = { title: line, type: detectSectionType(line), order_index: sections.length, questions: [] }
      continue
    }

    const qm = line.match(Q_RE)
    if (qm && parseInt(qm[1]) <= 200) {
      saveQ()
      if (!cur) cur = { title: 'Phần 1', type: 'reading', order_index: 0, questions: [] }
      cq = { order_index: parseInt(qm[1]) - 1, question_text: qm[2].trim(), options: [], correct_answer: '' }
      continue
    }

    const om = line.match(OPT_RE)
    if (om && cq) { cq.options.push(om[2].trim()); continue }

    if (cq && line.length < 300 && !SECTION_RES.some(r => r.test(line)) && !Q_RE.test(line)) {
      cq.question_text += ' ' + line
    }
  }
  saveS()

  return sections.length > 0
    ? sections
    : [{ title: 'Nội dung đề thi', type: 'reading', order_index: 0, questions: [] }]
}

async function parsePdf(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Không có file PDF' })
  try {
    const data = await pdfParse(req.file.buffer)
    const sections = parsePdfText(data.text)
    res.json({ sections, pageCount: data.numpages })
  } catch (e) {
    res.status(422).json({ message: 'Không thể đọc PDF: ' + e.message })
  }
}

async function bulkImport(req, res) {
  const { title, exam_type, hsk_level, time_limit_minutes, description, sections } = req.body
  if (!title || !exam_type || !hsk_level || !time_limit_minutes)
    return res.status(400).json({ message: 'Thiếu: title, exam_type, hsk_level, time_limit_minutes' })

  const exam = await Exam.create({
    title, exam_type,
    hsk_level: parseInt(hsk_level),
    time_limit_minutes: parseInt(time_limit_minutes),
    description: description || null,
  })

  const createdSections = []
  for (let si = 0; si < (sections || []).length; si++) {
    const s = sections[si]
    const section = await ExamSection.create({
      exam_id: exam.id,
      title: s.title,
      type: s.type,
      order_index: si,
      passage: s.passage || null,
      audio_url: null,
    })
    createdSections.push({ id: section.id, title: section.title, type: section.type, order_index: si })
    for (let qi = 0; qi < (s.questions || []).length; qi++) {
      const q = s.questions[qi]
      if (!q.question_text || q.correct_answer === '' || q.correct_answer == null) continue
      await ExamQuestion.create({
        section_id: section.id,
        question_text: q.question_text,
        options: q.options && q.options.length >= 2 ? q.options : null,
        correct_answer: String(q.correct_answer),
        points: 1,
        order_index: qi,
      })
    }
  }

  res.status(201).json({ message: 'Đã nhập đề thi thành công', exam_id: exam.id, sections: createdSections })
}

async function adminListExams(req, res) {
  const exams = await Exam.findAll({
    include: [{
      model: ExamSection,
      as: 'sections',
      include: [{ model: ExamQuestion, as: 'questions' }],
    }],
    order: [
      ['hsk_level', 'ASC'],
      [{ model: ExamSection, as: 'sections' }, 'order_index', 'ASC'],
      [{ model: ExamSection, as: 'sections' }, { model: ExamQuestion, as: 'questions' }, 'order_index', 'ASC'],
    ],
  })
  res.json(exams)
}

async function createExam(req, res) {
  const { title, exam_type, hsk_level, time_limit_minutes, description } = req.body
  if (!title || !exam_type || !hsk_level || !time_limit_minutes)
    return res.status(400).json({ message: 'Thiếu: title, exam_type, hsk_level, time_limit_minutes' })
  const exam = await Exam.create({
    title, exam_type,
    hsk_level: parseInt(hsk_level),
    time_limit_minutes: parseInt(time_limit_minutes),
    description: description || null,
  })
  res.status(201).json(exam)
}

async function updateExam(req, res) {
  const exam = await Exam.findByPk(req.params.id)
  if (!exam) return res.status(404).json({ message: 'Không tìm thấy đề thi' })
  const { title, exam_type, hsk_level, time_limit_minutes, description } = req.body
  await exam.update({
    title, exam_type,
    hsk_level: parseInt(hsk_level),
    time_limit_minutes: parseInt(time_limit_minutes),
    description: description || null,
  })
  res.json(exam)
}

async function deleteExam(req, res) {
  const exam = await Exam.findByPk(req.params.id)
  if (!exam) return res.status(404).json({ message: 'Không tìm thấy đề thi' })
  await exam.destroy()
  res.json({ message: 'Đã xóa đề thi' })
}

async function createSection(req, res) {
  const { title, type, order_index, passage } = req.body
  if (!title || !type) return res.status(400).json({ message: 'Thiếu: title, type' })
  const audio_url = req.file ? `/uploads/${req.file.filename}` : (req.body.audio_url || null)
  const section = await ExamSection.create({
    exam_id: parseInt(req.params.id),
    title, type,
    order_index: parseInt(order_index) || 0,
    audio_url,
    passage: passage || null,
  })
  res.status(201).json(section)
}

async function updateSection(req, res) {
  const section = await ExamSection.findByPk(req.params.sid)
  if (!section) return res.status(404).json({ message: 'Không tìm thấy phần thi' })
  const { title, type, order_index, passage } = req.body
  const audio_url = req.file ? `/uploads/${req.file.filename}` : (req.body.audio_url || section.audio_url)
  await section.update({ title, type, order_index: parseInt(order_index) || 0, audio_url, passage: passage || null })
  res.json(section)
}

async function deleteSection(req, res) {
  const section = await ExamSection.findByPk(req.params.sid)
  if (!section) return res.status(404).json({ message: 'Không tìm thấy phần thi' })
  await section.destroy()
  res.json({ message: 'Đã xóa phần thi' })
}

async function createQuestion(req, res) {
  const { question_text, options, correct_answer, points, order_index } = req.body
  if (!question_text || correct_answer === undefined || correct_answer === '')
    return res.status(400).json({ message: 'Thiếu: question_text, correct_answer' })
  const question = await ExamQuestion.create({
    section_id: parseInt(req.params.sid),
    question_text,
    options: options || null,
    correct_answer: String(correct_answer),
    points: parseInt(points) || 1,
    order_index: parseInt(order_index) || 0,
  })
  res.status(201).json(question)
}

async function updateQuestion(req, res) {
  const question = await ExamQuestion.findByPk(req.params.qid)
  if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi' })
  const { question_text, options, correct_answer, points, order_index } = req.body
  await question.update({
    question_text,
    options: options || null,
    correct_answer: String(correct_answer),
    points: parseInt(points) || 1,
    order_index: parseInt(order_index) || 0,
  })
  res.json(question)
}

async function deleteQuestion(req, res) {
  const question = await ExamQuestion.findByPk(req.params.qid)
  if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi' })
  await question.destroy()
  res.json({ message: 'Đã xóa câu hỏi' })
}

module.exports = {
  adminListExams, createExam, updateExam, deleteExam,
  createSection, updateSection, deleteSection,
  createQuestion, updateQuestion, deleteQuestion,
  parsePdf, bulkImport,
}
