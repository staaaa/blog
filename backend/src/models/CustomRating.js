const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomRating = sequelize.define('CustomRating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  scaleName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'scale_name'
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, max: 10 }
  }
}, {
  tableName: 'custom_ratings'
});

module.exports = CustomRating;
