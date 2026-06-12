const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const UserExamResult = sequelize.define('UserExamResult', {
  user_id:            { type: DataTypes.INTEGER,  allowNull: false },
  exam_id:            { type: DataTypes.INTEGER,  allowNull: false },
  score:              { type: DataTypes.SMALLINT, allowNull: false },
  max_score:          { type: DataTypes.SMALLINT, allowNull: false },
  answers:            { type: DataTypes.JSON,     allowNull: false },
  time_taken_seconds: { type: DataTypes.SMALLINT },
  submitted_at:       { type: DataTypes.DATE,     allowNull: false },
})

module.exports = UserExamResult
