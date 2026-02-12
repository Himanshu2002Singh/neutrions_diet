const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicalDocument = sequelize.define('MedicalDocument', {
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
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_name'
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'original_name'
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_path'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'file_size'
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'mime_type'
  },
  documentType: {
    type: DataTypes.ENUM('lab_report', 'prescription', 'medical_certificate', 'diet_history', 'other'),
    allowNull: false,
    defaultValue: 'other',
    field: 'document_type'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'medical_documents',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['user_id', 'is_active']
    },
    {
      fields: ['document_type']
    }
  ]
});

module.exports = MedicalDocument;

