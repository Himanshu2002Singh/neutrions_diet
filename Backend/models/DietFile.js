const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DietFile = sequelize.define('DietFile', {
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
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'doctor_id'
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
    allowNull: false,
    field: 'file_size'
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'mime_type'
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
  tableName: 'diet_files',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['doctor_id']
    }
  ]
});

module.exports = DietFile;

