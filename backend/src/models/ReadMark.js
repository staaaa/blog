const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReadMark = sequelize.define('ReadMark', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
}, {
  tableName: 'read_marks',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'review_id']
    }
  ]
});

module.exports = ReadMark;
