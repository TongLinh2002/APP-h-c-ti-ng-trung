const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  display_name: { type: DataTypes.STRING },
  current_hsk_level: { type: DataTypes.TINYINT, defaultValue: 1 },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
})

module.exports = User
