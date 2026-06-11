const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const UserLessonHistory = sequelize.define('UserLessonHistory', {
  score: { type: DataTypes.TINYINT, allowNull: false },
})

module.exports = UserLessonHistory
