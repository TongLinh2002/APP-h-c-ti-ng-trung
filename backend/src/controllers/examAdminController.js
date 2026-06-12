const { Exam, ExamSection, ExamQuestion } = require('../models')
const pdfParse = require('pdf-parse')

// ── PDF parsing helpers ──────────────────────────────────────────────────────

// Parse answer key block: "1．B 2．B 3．A ..."  or table rows "1.B 2.B ..."
function extractAnswerKey(text) {
  const key = {}
  // Match patterns like "1．B", "2. A", "10.C", "45．D"
  const re = /(\d{1,3})[．.]\s*([A-D])/g
  // Only look in the last quarter of the text (answer section is at end)
  const tail = text.slice(Math.floor(text.length * 0.7))
  let m
  while ((m = re.exec(tail)) !== null) {
    const num = parseInt(m[1])
    const letter = m[2]
    if (num >= 1 && num <= 200) {
      key[num] = String('ABCD'.indexOf(letter)) // "0","1","2","3"
    }
  }
  return key
}

// Hanban HSK exam format:
// - Main sections: 一、听 力 / 二、阅 读 / 三、书 写  (spaces inserted by pdf.js between chars)
// - Sub-sections: 第一部分, 第二部分 … (group headers — NOT separate DB sections)
// - Listening/reading MCQ: "1．A text\nB text\nC text\nD text"
// - Reading passage MCQ: "61．full question text\n  A opt\n  B opt …"
// - Writing (91-98): "91．word1  word2  word3 …" (scrambled words, no options)
// - Writing (99-100): essay prompt, no options
function parsePdfText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return [{ title: 'Nội dung đề thi', type: 'reading', order_index: 0, questions: [] }]
  }

  // Normalise: pdf.js often inserts spaces inside CJK section headers
  const text = rawText
    .replace(/一、\s*听\s*力/g, '一、听力')
    .replace(/二、\s*阅\s*读/g, '二、阅读')
    .replace(/三、\s*书\s*写/g, '三、书写')
    .replace(/听\s*力\s*材\s*料/g, '听力材料')

  const answerKey = extractAnswerKey(text)

  // Regex patterns
  // Question line: "1．A ..." or "1. A ..." or "46. text..."
  const Q_RE    = /^(\d{1,3})[．.、。）)]\s*(.{1,})/
  // Option line:  "A text" or "A. text" or "A．text"
  const OPT_RE  = /^([A-D])[．.\s、。）)]\s*(.{0,})/
  // Main section headers
  const SEC_RE  = /^[一二三四]、(听力|阅读|书写|填空)/
  // Sub-section / instruction lines to SKIP (don't start new DB section)
  const SKIP_RE = /^(第[一二三四五六七八九十]+部分|第\d+-\d+题|H\d{5}|HSK|请选出|请大家|听力考试|全部考试|注\s*意|中国\s*北京|国家汉办|Hanban|答案)/i

  const sections = []  // final DB sections (max 3 for Hanban)
  let cur = null        // current DB section being built
  let cq  = null        // current question being built
  let inScript = false  // inside 听力材料 (script) — skip
  let passageLines = [] // collect passage text for reading sections

  const pushQ = () => {
    if (!cq || !cur) return
    if (cq.options.length < 2) cq.options = null
    if (!cq.correct_answer && answerKey[cq.order_index + 1] !== undefined) {
      cq.correct_answer = answerKey[cq.order_index + 1]
    }
    cur.questions.push(cq)
    cq = null
  }

  const pushS = () => {
    pushQ()
    if (cur) {
      if (passageLines.length > 0) cur.passage = passageLines.join('\n')
      sections.push(cur)
    }
    cur = null
    passageLines = []
  }

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (line.length < 2) continue

    // Detect listening script / answer-key block → stop adding questions
    if (/听力材料|卷听力|卷答案|H\d{5}\s*卷/.test(line)) {
      inScript = true
      pushQ()
      continue
    }
    if (inScript) continue

    // Skip sub-headers and page numbers
    if (SKIP_RE.test(line) || /^\d+$/.test(line)) continue

    // ── Main section header ──
    const sm = line.match(SEC_RE)
    if (sm) {
      pushS()
      const type = /听力/.test(sm[1]) ? 'listening' : /书写|填空/.test(sm[1]) ? 'fill' : 'reading'
      cur = { title: line, type, order_index: sections.length, questions: [], passage: '' }
      passageLines = []
      continue
    }

    // ── Sub-group header e.g. "46-48．" — skip but don't collect as passage ──
    if (/^\d{1,3}-\d{1,3}[．.]/.test(line)) continue

    // ── Question line ──
    const qm = line.match(Q_RE)
    if (qm) {
      const num = parseInt(qm[1])
      if (num < 1 || num > 200) continue

      const rest = qm[2].trim()

      // Check if first option A is on same line: "1．A some text"
      const inlineA = rest.match(/^([A-D])[．.\s]\s*(.{1,})/)

      pushQ()
      if (!cur) continue  // skip questions before any main section header

      cq = {
        order_index: num - 1,
        question_text: '',
        options: [],
        correct_answer: answerKey[num] !== undefined ? answerKey[num] : '',
      }

      if (inlineA && /^[A-D]$/.test(inlineA[1])) {
        // Check if ALL options are on same line: "46．A 穿       B 带       C 挂       D 戴"
        if (/\s{2,}[B-D]\s/.test(inlineA[2])) {
          const parts = rest.split(/\s{2,}(?=[A-D]\s)/)
          cq.options = parts.map(p => p.replace(/^[A-D]\s+/, '').trim()).filter(Boolean)
        } else {
          // Listening MCQ: only A on same line, B/C/D on subsequent lines
          cq.options.push(inlineA[2].trim())
        }
      } else {
        // Full-text question
        cq.question_text = rest
      }
      continue
    }

    // ── Option line (B / C / D, or A if not caught above) ──
    const om = line.match(OPT_RE)
    if (om && cq) {
      const optText = om[2].trim()
      // Check if 2 options share one line: "C text       D text"
      if (/\s{2,}[B-D]\s/.test(optText)) {
        const parts = line.split(/\s{2,}(?=[A-D]\s)/)
        for (const part of parts) {
          const pm = part.match(/^([A-D])[．.\s]\s*(.+)/)
          if (pm) cq.options.push(pm[2].trim())
        }
      } else {
        cq.options.push(optText)
      }
      continue
    }

    // ── Continuation / passage text ──
    if (cq && cq.options.length === 0 && line.length < 400) {
      // Still building a question that has no options yet
      cq.question_text += (cq.question_text ? ' ' : '') + line
    } else if (cur && cur.type !== 'listening' && !cq && line.length >= 4) {
      // Passage / context text between questions (reading sections)
      passageLines.push(line)
    }
  }
  pushS()

  // Remove sections with zero questions and no meaningful content
  const valid = sections.filter(s => s.questions.length > 0)

  if (valid.length === 0) {
    return [{ title: 'Nội dung đề thi', type: 'reading', order_index: 0, questions: [] }]
  }

  // Sort questions by order_index (PDF 2-column layout mixes them)
  valid.forEach(s => s.questions.sort((a, b) => a.order_index - b.order_index))

  // Re-index section order_index
  return valid.map((s, i) => ({ ...s, order_index: i }))
}

async function parsePdf(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Không có file PDF' })
  try {
    const buf = Buffer.isBuffer(req.file.buffer)
      ? req.file.buffer
      : Buffer.from(req.file.buffer)

    const data = await pdfParse(buf)
    const sections = parsePdfText(data.text || '')
    res.json({ sections, pageCount: data.numpages || 1 })
  } catch (e) {
    console.error('[parsePdf] error:', e)
    res.status(422).json({ message: 'Không thể đọc PDF: ' + (e.message || String(e)) })
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
      const hasOptions = Array.isArray(q.options) && q.options.length >= 2
      const hasText    = q.question_text && q.question_text.trim().length > 0
      if (!hasOptions && !hasText) continue  // truly empty — skip
      // Writing questions with no correct answer: 0 pts (manual / essay)
      const pts = (s.type === 'fill' && !q.correct_answer && q.correct_answer !== 0) ? 0 : 1
      await ExamQuestion.create({
        section_id: section.id,
        question_text: q.question_text || '',
        options: hasOptions ? q.options : null,
        correct_answer: (q.correct_answer != null && q.correct_answer !== '') ? String(q.correct_answer) : '',
        points: pts,
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
