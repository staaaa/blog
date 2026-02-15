const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Studio = sequelize.define('Studio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'studios'
});

module.exports = Studio;
