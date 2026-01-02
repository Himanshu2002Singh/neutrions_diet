const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_of_birth'
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'dietician'),
    defaultValue: 'user',
    field: 'role'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  // Google OAuth fields
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'google_id'
  },
  googleAvatar: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'google_avatar'
  },
  isGoogleUser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_google_user'
  },
  // Assignment tracking
  assignedDieticianId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'assigned_dietician_id'
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'assigned_at'
  },
  // Referral system fields
  referralCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'referral_code'
  },
  // User who referred this user
  referredByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'referred_by_user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance methods
User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

module.exports = User;

