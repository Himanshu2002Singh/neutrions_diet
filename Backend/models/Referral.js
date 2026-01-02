const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // The unique referral code generated for the referrer
  referralCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'referral_code'
  },
  // The user who is sharing the referral code
  referrerUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'referrer_user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // The user who was referred (if they signed up using this code)
  referredUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'referred_user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Status of the referral
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending',
    field: 'status'
  },
  // When the referred user signed up
  referredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'referred_at'
  }
}, {
  tableName: 'referrals',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['referral_code', 'referrer_user_id']
    },
    {
      fields: ['referrer_user_id']
    },
    {
      fields: ['referred_user_id']
    }
  ]
});

module.exports = Referral;

