const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DailyMealActivity = sequelize.define('DailyMealActivity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  mealType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'e.g., breakfast, mid-morning, lunch, pre-workout, evening-snacks, dinner, bedtime',
    field: 'meal_type'
  },
  selectedItems: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('selectedItems');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('selectedItems', JSON.stringify(value || []));
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  totalCalories: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Total calories for this meal',
    field: 'total_calories'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'daily_meal_activities',
  indexes: [
    {
      fields: ['user_id', 'date']
    },
    {
      fields: ['user_id']
    }
  ]
});

module.exports = DailyMealActivity;

