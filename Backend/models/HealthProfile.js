const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HealthProfile = sequelize.define('HealthProfile', {
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
  // Health data only - user details come from users table via JOIN
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 20,
      max: 500
    }
  },
  height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 100,
      max: 250
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 13,
      max: 120
    }
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  activityLevel: {
    type: DataTypes.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
    allowNull: false
  },
  medicalConditions: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('medicalConditions');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('medicalConditions', JSON.stringify(value || []));
    }
  },
  goals: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('goals');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('goals', JSON.stringify(value || []));
    }
  },
  isCurrent: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'health_profiles',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['user_id', 'is_current']
    }
  ]
});

module.exports = HealthProfile;

