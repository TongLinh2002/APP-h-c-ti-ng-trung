const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ExamSection = sequelize.define('ExamSection', {
  exam_id:     { type: DataTypes.INTEGER, allowNull: false },
  title:       { type: DataTypes.STRING,  allowNull: false },
  type:        { type: DataTypes.ENUM('listening', 'reading', 'fill'), allowNull: false },
  order_index: { type: DataTypes.TINYINT, defaultValue: 0 },
  audio_url:   { type: DataTypes.STRING },
  passage:     { type: DataTypes.TEXT },
})

module.exports = ExamSection
