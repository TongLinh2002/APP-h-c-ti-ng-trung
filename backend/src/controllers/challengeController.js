const { Vocabulary, UserChallengeScore } = require('../models')
const sequelize = require('../config/database')

async function startChallenge(req, res) {
  const { hsk_level } = req.query
  if (!hsk_level) return res.status(400).json({ message: 'hsk_level là bắt buộc' })

  const level = parseInt(hsk_level)

  const allWords = await Vocabulary.findAll({ where: { hsk_level: level } })
  if (allWords.length < 4) return res.status(400).json({ message: 'Không đủ từ vựng để tạo game' })

  // Pick 10 random words (or all if less than 10)
  const shuffledAll = allWords.sort(() => Math.random() - 0.5)
  const words = shuffledAll.slice(0, Math.min(10, shuffledAll.length))

  const questions = words.map((word) => {
    const wrongPool = allWords.filter((w) => w.id !== word.id)
    const shuffledWrong = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [...shuffledWrong.map((w) => w.meaning_vi), word.meaning_vi].sort(() => Math.random() - 0.5)
    const correctIndex = options.indexOf(word.meaning_vi)
    return {
      id: word.id,
      hanzi: word.hanzi,
      pinyin: word.pinyin,
      options,
      correct_index: correctIndex,
    }
  })

  res.json({ questions, hsk_level: level })
}

async function submitChallenge(req, res) {
  const userId = req.userId
  const { hsk_level, answers } = req.body

  if (!hsk_level || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'hsk_level và answers là bắt buộc' })
  }

  let score = 0
  const results = answers.map((a) => {
    const isCorrect = a.selected_index !== undefined && a.selected_index === a.correct_index
    let questionScore = 0
    if (isCorrect) {
      questionScore = 10
      if (a.time_ms && a.time_ms < 5000) questionScore += 5
    }
    score += questionScore
    return { question_id: a.question_id, correct: isCorrect, score: questionScore }
  })

  let record = await UserChallengeScore.findOne({ where: { user_id: userId, hsk_level } })
  if (!record) {
    record = await UserChallengeScore.create({ user_id: userId, hsk_level, best_score: score, total_games: 1 })
  } else {
    await record.update({
      best_score: Math.max(record.best_score, score),
      total_games: record.total_games + 1,
      last_played_at: new Date(),
    })
  }

  res.json({ score, best_score: Math.max(record.best_score, score), results })
}

module.exports = { startChallenge, submitChallenge }
