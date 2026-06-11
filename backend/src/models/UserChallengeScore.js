const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const UserChallengeScore = sequelize.define('UserChallengeScore', {
  hsk_level: { type: DataTypes.TINYINT, allowNull: false },
  best_score: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_games: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_played_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  indexes: [{ unique: true, fields: ['user_id', 'hsk_level'] }]
})

module.exports = UserChallengeScore
