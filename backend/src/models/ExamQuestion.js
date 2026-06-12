const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ExamQuestion = sequelize.define('ExamQuestion', {
  section_id:     { type: DataTypes.INTEGER, allowNull: false },
  order_index:    { type: DataTypes.TINYINT, defaultValue: 0 },
  question_text:  { type: DataTypes.TEXT,    allowNull: false },
  options:        { type: DataTypes.JSON },
  correct_answer: { type: DataTypes.STRING(255), allowNull: false },
  points:         { type: DataTypes.TINYINT, defaultValue: 1 },
})

module.exports = ExamQuestion
