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

  const recentDays = await UserLessonHistory.findAll({
    where: {
      user_id: userId,
      createdAt: { [Op.gte]: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) },
    },
    attributes: [[fn('DATE', col('createdAt')), 'day']],
    group: [literal('day')],
    raw: true,
    order: [[literal('day'), 'DESC']],
  })

  let streak = 0
  const todayStr = today.toISOString().slice(0, 10)
  const activeDays = recentDays.map((r) => r.day)

  if (activeDays.includes(todayStr)) {
    streak = 1
    const checkDate = new Date(today)
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1)
      const dayStr = checkDate.toISOString().slice(0, 10)
      if (activeDays.includes(dayStr)) {
        streak++
      } else {
        break
      }
    }
  }

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 6)
  weekAgo.setHours(0, 0, 0, 0)

  const weeklyActivity = await UserLessonHistory.findAll({
    where: { user_id: userId, createdAt: { [Op.gte]: weekAgo } },
    attributes: [[fn('DATE', col('createdAt')), 'day'], [fn('COUNT', col('id')), 'count']],
    group: [literal('day')],
    raw: true,
  })

  res.json({ totalLearned, byLevel, streak, weeklyActivity })
}

module.exports = { getProgress }
