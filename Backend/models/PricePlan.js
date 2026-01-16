const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PricePlan = sequelize.define('PricePlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
  },
  badge: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: null,
  },
  offer: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
  },
  color: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'bg-[#C5E17A]',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'price_plans',
  timestamps: true,
  underscored: true,
});

// Class method to get color based on index for alternating colors
PricePlan.getColorForIndex = function(index) {
  const colors = [
    'bg-[#C5E17A]',
    'bg-[#FFC878]',
    'bg-[#CE93D8]',
    'bg-[#4FC3F7]',
    'bg-[#FF8A65]',
  ];
  return colors[index % colors.length];
};

module.exports = PricePlan;

