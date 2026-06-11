const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const UserVocabularyProgress = sequelize.define('UserVocabularyProgress', {
  ease_factor: { type: DataTypes.FLOAT, defaultValue: 2.5 },
  interval_days: { type: DataTypes.INTEGER, defaultValue: 1 },
  next_review_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  times_seen: { type: DataTypes.INTEGER, defaultValue: 0 },
  times_correct: { type: DataTypes.INTEGER, defaultValue: 0 },
})

module.exports = UserVocabularyProgress
