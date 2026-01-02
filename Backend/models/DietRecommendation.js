const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DietRecommendation = sequelize.define('DietRecommendation', {
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
  bmiCalculationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bmi_calculations',
      key: 'id'
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
  protein: {
    type: DataTypes.DECIMAL(5, 1),
    allowNull: false,
    validate: {
      min: 0,
      max: 500
    }
  },
  carbs: {
    type: DataTypes.DECIMAL(5, 1),
    allowNull: false,
    validate: {
      min: 0,
      max: 500
    }
  },
  fats: {
    type: DataTypes.DECIMAL(5, 1),
    allowNull: false,
    validate: {
      min: 0,
      max: 300
    }
  },
  meals: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('meals');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('meals', JSON.stringify(value || []));
    }
  },
  foods: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('foods');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('foods', JSON.stringify(value || []));
    }
  },
  restrictions: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('restrictions');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('restrictions', JSON.stringify(value || []));
    }
  },
  medicalRecommendations: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('medicalRecommendations');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('medicalRecommendations', JSON.stringify(value || []));
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'diet_recommendations',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['health_profile_id']
    },
    {
      fields: ['bmi_calculation_id']
    }
  ]
});

module.exports = DietRecommendation;
