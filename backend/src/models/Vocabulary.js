const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Vocabulary = sequelize.define('Vocabulary', {
  hanzi: { type: DataTypes.STRING(50), allowNull: false },
  pinyin: { type: DataTypes.STRING(100), allowNull: false },
  meaning_vi: { type: DataTypes.TEXT, allowNull: false },
  example_sentence: { type: DataTypes.STRING(500) },
  example_pinyin: { type: DataTypes.STRING(500) },
  audio_url: { type: DataTypes.STRING },
  hsk_level: { type: DataTypes.TINYINT, allowNull: false },
})

module.exports = Vocabulary
