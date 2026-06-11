const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Lesson = sequelize.define('Lesson', {
  title: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('listening', 'reading'), allowNull: false },
  content: { type: DataTypes.TEXT },
  audio_url: { type: DataTypes.STRING },
  transcript: { type: DataTypes.TEXT },
  hsk_level: { type: DataTypes.TINYINT, allowNull: false },
})

module.exports = Lesson
