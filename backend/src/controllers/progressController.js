const { Op, fn, col, literal } = require('sequelize')
const { UserVocabularyProgress, UserLessonHistory, Vocabulary } = require('../models')

async function getProgress(req, res) {
  const userId = req.userId

  const totalLearned = await UserVocabularyProgress.count({ where: { user_id: userId } })

  const byLevel = await UserVocabularyProgress.findAll({
    where: { user_id: userId },
    include: [{ model: Vocabulary, attributes: ['hsk_level'] }],
    attributes: [[fn('COUNT', col('UserVocabularyProgress.id')), 'count']],
    group: ['Vocabulary.hsk_level'],
    raw: true,
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Collect active days from BOTH vocab reviews and lesson completions
  const [vocabDays, lessonDays] = await Promise.all([
    UserVocabularyProgress.findAll({
      where: { user_id: userId, times_seen: { [Op.gt]: 0 }, updatedAt: { [Op.gte]: thirtyDaysAgo } },
      attributes: [[fn('DATE', col('updatedAt')), 'day']],
      group: [literal('DATE(updatedAt)')],
      raw: true,
    }),
    UserLessonHistory.findAll({
      where: { user_id: userId, createdAt: { [Op.gte]: thirtyDaysAgo } },
      attributes: [[fn('DATE', col('createdAt')), 'day']],
      group: [literal('DATE(createdAt)')],
      raw: true,
    }),
  ])

  // Merge into a Set of 'YYYY-MM-DD' strings
  const activeDaySet = new Set([
    ...vocabDays.map((r) => r.day),
    ...lessonDays.map((r) => r.day),
  ])

  // Calculate streak
  let streak = 0
  const todayStr = today.toISOString().slice(0, 10)
  if (activeDaySet.has(todayStr)) {
    streak = 1
    const checkDate = new Date(today)
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1)
      const dayStr = checkDate.toISOString().slice(0, 10)
      if (activeDaySet.has(dayStr)) streak++
      else break
    }
  }

  // Weekly activity (last 7 days) — count vocab reviews per day
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 6)
  weekAgo.setHours(0, 0, 0, 0)

  const weeklyVocab = await UserVocabularyProgress.findAll({
    where: { user_id: userId, times_seen: { [Op.gt]: 0 }, updatedAt: { [Op.gte]: weekAgo } },
    attributes: [[fn('DATE', col('updatedAt')), 'day'], [fn('COUNT', col('id')), 'count']],
    group: [literal('DATE(updatedAt)')],
    raw: true,
  })
  const weeklyLesson = await UserLessonHistory.findAll({
    where: { user_id: userId, createdAt: { [Op.gte]: weekAgo } },
    attributes: [[fn('DATE', col('createdAt')), 'day'], [fn('COUNT', col('id')), 'count']],
    group: [literal('DATE(createdAt)')],
    raw: true,
  })

  // Merge weekly activity counts by day
  const weeklyMap = {}
  weeklyVocab.forEach((r) => { weeklyMap[r.day] = (weeklyMap[r.day] || 0) + parseInt(r.count) })
  weeklyLesson.forEach((r) => { weeklyMap[r.day] = (weeklyMap[r.day] || 0) + parseInt(r.count) })
  const weeklyActivity = Object.entries(weeklyMap).map(([day, count]) => ({ day, count }))

  res.json({ totalLearned, byLevel, streak, weeklyActivity })
}

module.exports = { getProgress }
