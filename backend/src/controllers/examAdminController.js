const { Exam, ExamSection, ExamQuestion } = require('../models')

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
}
