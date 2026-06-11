const { Lesson, LessonQuestion, UserLessonHistory } = require('../models')

async function getLessons(req, res) {
  const { hsk_level, type } = req.query
  const where = {}
  if (hsk_level) where.hsk_level = parseInt(hsk_level)
  if (type) where.type = type

  const lessons = await Lesson.findAll({ where, attributes: ['id', 'title', 'type', 'hsk_level'] })
  res.json(lessons)
}

async function getLessonById(req, res) {
  const lesson = await Lesson.findByPk(req.params.id, {
    include: [{ model: LessonQuestion, as: 'questions' }],
  })
  if (!lesson) return res.status(404).json({ message: 'Bài học không tồn tại' })
  res.json(lesson)
}

async function submitLesson(req, res) {
  const userId = req.userId
  const lessonId = parseInt(req.params.id)
  const { answers } = req.body

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'answers phải là mảng' })
  }

  const lesson = await Lesson.findByPk(lessonId, {
    include: [{ model: LessonQuestion, as: 'questions' }],
  })
  if (!lesson) return res.status(404).json({ message: 'Bài học không tồn tại' })

  let correct = 0
  const results = lesson.questions.map((q) => {
    const userAnswer = answers.find((a) => a.question_id === q.id)
    const isCorrect = userAnswer && userAnswer.selected_answer === q.correct_answer
    if (isCorrect) correct++
    return { question_id: q.id, correct: !!isCorrect, correct_answer: q.correct_answer }
  })

  const score = lesson.questions.length > 0 ? Math.round((correct / lesson.questions.length) * 100) : 0

  await UserLessonHistory.create({ user_id: userId, lesson_id: lessonId, score })

  res.json({ score, results })
}

module.exports = { getLessons, getLessonById, submitLesson }
