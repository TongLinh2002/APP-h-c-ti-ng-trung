const { Op } = require('sequelize')
const { Vocabulary, UserVocabularyProgress, User } = require('../models')
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
  const filterLevel = req.query.hsk_level ? parseInt(req.query.hsk_level) : null

  // Due cards filtered by HSK level if provided
  const vocabWhere = filterLevel ? { hsk_level: filterLevel } : {}
  const dueCards = await UserVocabularyProgress.findAll({
    where: { user_id: userId, next_review_at: { [Op.lte]: now } },
    include: [{ model: Vocabulary, where: vocabWhere }],
    limit: 30,
  })

  // New cards — vocabulary not yet studied
  const newLimit = Math.max(0, 30 - dueCards.length)
  let newCardWrapped = []

  if (newLimit > 0) {
    const seenRows = await UserVocabularyProgress.findAll({
      where: { user_id: userId },
      attributes: ['vocabulary_id'],
    })
    const seenIds = seenRows.map(r => r.vocabulary_id)

    const whereClause = filterLevel
      ? { hsk_level: filterLevel }
      : { hsk_level: { [Op.between]: [1, 9] } }
    if (seenIds.length > 0) whereClause.id = { [Op.notIn]: seenIds }

    const newCards = await Vocabulary.findAll({
      where: whereClause,
      limit: newLimit,
      order: [['hsk_level', 'ASC'], ['id', 'ASC']],
    })

    newCardWrapped = newCards.map(v => ({ Vocabulary: v.toJSON(), isNew: true }))
  }

  res.json([...dueCards, ...newCardWrapped])
}

async function getLevelStats(req, res) {
  const userId = req.userId
  const now = new Date()
  const sequelize = Vocabulary.sequelize

  // 1. Total vocab per level (1 query)
  const totalRows = await Vocabulary.findAll({
    attributes: ['hsk_level', [sequelize.fn('COUNT', sequelize.col('id')), 'cnt']],
    group: ['hsk_level'],
    raw: true,
  })

  // 2. Seen vocab IDs (1 query)
  const seenRows = await UserVocabularyProgress.findAll({
    where: { user_id: userId },
    attributes: ['vocabulary_id'],
    raw: true,
  })
  const seenIds = seenRows.map(r => r.vocabulary_id)

  // 3. New vocab per level (1 query)
  const newWhere = seenIds.length > 0 ? { id: { [Op.notIn]: seenIds } } : {}
  const newRows = await Vocabulary.findAll({
    attributes: ['hsk_level', [sequelize.fn('COUNT', sequelize.col('id')), 'cnt']],
    where: newWhere,
    group: ['hsk_level'],
    raw: true,
  })

  // 4. Due cards per level (1 query via join)
  const dueRows = await UserVocabularyProgress.findAll({
    where: { user_id: userId, next_review_at: { [Op.lte]: now } },
    include: [{ model: Vocabulary, attributes: ['hsk_level'] }],
    attributes: [],
    raw: true,
  })

  // Build result map
  const result = {}
  for (let level = 1; level <= 9; level++) {
    const t = totalRows.find(r => parseInt(r.hsk_level) === level)
    const n = newRows.find(r => parseInt(r.hsk_level) === level)
    const dueCount = dueRows.filter(r => parseInt(r['Vocabulary.hsk_level']) === level).length
    result[level] = {
      total: t ? parseInt(t.cnt) : 0,
      new: n ? parseInt(n.cnt) : 0,
      due: dueCount,
    }
  }

  res.json(result)
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

async function getSessionStats(req, res) {
  const userId = req.userId
  const now = new Date()

  const user = await User.findByPk(userId, { attributes: ['current_hsk_level'] })
  const hskLevel = user?.current_hsk_level || 1

  const dueCount = await UserVocabularyProgress.count({
    where: { user_id: userId, next_review_at: { [Op.lte]: now } },
  })

  const seenRows = await UserVocabularyProgress.findAll({
    where: { user_id: userId },
    attributes: ['vocabulary_id'],
  })
  const seenIds = seenRows.map(r => r.vocabulary_id)

  const whereClause = { hsk_level: { [Op.lte]: hskLevel } }
  if (seenIds.length > 0) whereClause.id = { [Op.notIn]: seenIds }

  const newCount = await Vocabulary.count({ where: whereClause })

  res.json({ dueCount, newCount, totalNew: newCount })
}

module.exports = { getVocabulary, getReviewCards, submitReview, getSessionStats, getLevelStats }
