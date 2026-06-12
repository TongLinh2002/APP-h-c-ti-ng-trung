const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Exam = sequelize.define('Exam', {
  title:              { type: DataTypes.STRING,  allowNull: false },
  exam_type:          { type: DataTypes.ENUM('hsk', 'hskk'), allowNull: false },
  hsk_level:          { type: DataTypes.TINYINT, allowNull: false },
  time_limit_minutes: { type: DataTypes.TINYINT, allowNull: false },
  description:        { type: DataTypes.TEXT },
})

module.exports = Exam
