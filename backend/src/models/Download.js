const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Download = sequelize.define('Download', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  file_url: { type: DataTypes.STRING(500), allowNull: false },
  file_type: { type: DataTypes.ENUM('vocabulary_list', 'pinyin_chart', 'slide', 'other'), allowNull: false },
  hsk_level: { type: DataTypes.TINYINT },
})

module.exports = Download
