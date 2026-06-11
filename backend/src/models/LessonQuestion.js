const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const LessonQuestion = sequelize.define('LessonQuestion', {
  question: { type: DataTypes.TEXT, allowNull: false },
  options: { type: DataTypes.JSON, allowNull: false },
  correct_answer: { type: DataTypes.TINYINT, allowNull: false },
})

module.exports = LessonQuestion
