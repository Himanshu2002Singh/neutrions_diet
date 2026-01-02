const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BMICalculation = sequelize.define('BMICalculation', {
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
    }
  },
  healthProfileId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'health_profiles',
      key: 'id'
    }
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  activityLevel: {
    type: DataTypes.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
    allowNull: false
  },
  bmi: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: false,
    validate: {
      min: 10,
      max: 60
    }
  },
  bmr: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 800,
      max: 4000
    }
  },
  dailyCalories: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1000,
      max: 5000
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  idealWeightMin: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  idealWeightMax: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'bmi_calculations',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['health_profile_id']
    }
  ]
});

module.exports = BMICalculation;
