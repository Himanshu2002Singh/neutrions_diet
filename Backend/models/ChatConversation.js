const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatConversation = sequelize.define('ChatConversation', {
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
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'member_id'
  },
  lastMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'last_message'
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_message_at'
  }
}, {
  tableName: 'chat_conversations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ChatConversation;

