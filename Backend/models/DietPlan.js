const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DietPlan = sequelize.define('DietPlan', {
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
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'doctor_id'
  },
  planName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'plan_name'
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'user_name'
  },
  profileData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'profile_data'
  },
  nutritionTargets: {
    type: DataTypes.JSON,
    allowNull: true
  },
  dailySchedule: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'daily_schedule'
  },
  lateNightOptions: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'late_night_options'
  },
  importantPoints: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'important_points'
  },
  portionSizeReference: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'portion_size_reference'
  },
  goals: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isCurrent: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_current'
  }
}, {
  tableName: 'diet_plans',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['user_id', 'is_current']
    }
  ]
});

module.exports = DietPlan;

