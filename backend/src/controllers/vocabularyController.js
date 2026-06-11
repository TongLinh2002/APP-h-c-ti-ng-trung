const { Op } = require('sequelize')
const { Vocabulary, UserVocabularyProgress } = require('../models')
const { calculateNextReview } = require('../utils/srs')

async function getVocabulary(req, res) {
  const { hsk_level } = req.query
  const where = hsk_level ? { hsk_level: parseInt(hsk_level) } : {}
  const vocabulary = await Vocabulary.findAll({ where })
  res.json(vocabulary)
}

async function getReviewCards(req, res) {
  const userId = req.userId
  const now = new Date()

  const dueCards = await UserVocabularyProgress.findAll({
    where: { user_id: userId, next_review_at: { [Op.lte]: now } },
    include: [{ model: Vocabulary }],
    limit: 20,
  })

  res.json(dueCards)
}

async function submitReview(req, res) {
  const userId = req.userId
  const vocabularyId = parseInt(req.params.id)
  const { rating } = req.body

  if (rating === undefined || rating < 0 || rating > 3) {
    return res.status(400).json({ message: 'rating phải từ 0 đến 3' })
  }

  let progress = await UserVocabularyProgress.findOne({ where: { user_id: userId, vocabulary_id: vocabularyId } })

  if (!progress) {
    progress = await UserVocabularyProgress.create({ user_id: userId, vocabulary_id: vocabularyId })
  }

  const next = calculateNextReview({
    ease_factor: progress.ease_factor,
    interval_days: progress.interval_days,
    rating,
  })

  await progress.update({
    ease_factor: next.ease_factor,
    interval_days: next.interval_days,
    next_review_at: next.next_review_at,
    times_seen: progress.times_seen + 1,
    times_correct: rating >= 2 ? progress.times_correct + 1 : progress.times_correct,
  })

  res.json({ message: 'Đã lưu kết quả', next_review_at: next.next_review_at })
}

module.exports = { getVocabulary, getReviewCards, submitReview }
