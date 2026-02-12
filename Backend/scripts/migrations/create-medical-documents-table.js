const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Migration script to create medical_documents table
 * Run this after the SQL migration or use Sequelize sync
 */
async function createMedicalDocumentsTable() {
  try {
    // Define the MedicalDocument model inline for migration
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
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
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

    // Sync the model with database
    await MedicalDocument.sync({ force: false });
    console.log('✅ Medical documents table created/verified successfully');

    return MedicalDocument;
  } catch (error) {
    console.error('❌ Error creating medical documents table:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  createMedicalDocumentsTable()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createMedicalDocumentsTable };

