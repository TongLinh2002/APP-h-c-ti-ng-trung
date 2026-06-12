const { Exam, ExamSection, ExamQuestion, UserExamResult } = require('../models')

async function listExams(req, res) {
  const { type, hsk_level } = req.query
  const where = {}
  if (type) where.exam_type = type
  if (hsk_level) where.hsk_level = parseInt(hsk_level)
  const exams = await Exam.findAll({
    where,
    attributes: ['id', 'title', 'exam_type', 'hsk_level', 'time_limit_minutes', 'description'],
    order: [['hsk_level', 'ASC'], ['createdAt', 'DESC']],
  })
  res.json(exams)
}

async function getExam(req, res) {
  const exam = await Exam.findByPk(req.params.id, {
    include: [{
      model: ExamSection,
      as: 'sections',
      include: [{
        model: ExamQuestion,
        as: 'questions',
        attributes: ['id', 'order_index', 'question_text', 'options', 'points'],
        // correct_answer intentionally excluded — sent only after submit
      }],
    }],
    order: [
      [{ model: ExamSection, as: 'sections' }, 'order_index', 'ASC'],
      [{ model: ExamSection, as: 'sections' }, { model: ExamQuestion, as: 'questions' }, 'order_index', 'ASC'],
    ],
  })
  if (!exam) return res.status(404).json({ message: 'Không tìm thấy đề thi' })
  res.json(exam)
}

async function submitExam(req, res) {
  const { answers, time_taken_seconds } = req.body
  const examId = parseInt(req.params.id)
  const userId = req.userId

  if (!Array.isArray(answers)) return res.status(400).json({ message: 'answers là bắt buộc' })

  const sections = await ExamSection.findAll({
    where: { exam_id: examId },
    include: [{ model: ExamQuestion, as: 'questions' }],
  })

  const questionMap = {}
  sections.forEach(s => s.questions.forEach(q => { questionMap[q.id] = q }))

  const maxScore = Object.values(questionMap).reduce((sum, q) => sum + q.points, 0)
  let score = 0

  const results = answers.map(({ question_id, answer }) => {
    const q = questionMap[question_id]
    if (!q) return { question_id, correct: false, correct_answer: null, user_answer: answer, points: 0 }
    const correct = q.correct_answer.trim().toLowerCase() === String(answer || '').trim().toLowerCase()
    if (correct) score += q.points
    return { question_id, correct, correct_answer: q.correct_answer, user_answer: answer, points: correct ? q.points : 0 }
  })

  await UserExamResult.create({
    user_id: userId,
    exam_id: examId,
    score,
    max_score: maxScore,
    answers,
    time_taken_seconds: time_taken_seconds || null,
    submitted_at: new Date(),
  })

  res.json({ score, max_score: maxScore, results })
}

module.exports = { listExams, getExam, submitExam }
