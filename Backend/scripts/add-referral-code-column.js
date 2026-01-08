/**
 * Migration script to add referral_code column to admin table
 * Run: node scripts/add-referral-code-column.js
 */

const { sequelize } = require('../config/database');

async function migrate() {
  try {
    console.log('Adding referral_code column to admin table...');
    
    await sequelize.query(`
      ALTER TABLE admin 
      ADD COLUMN referral_code VARCHAR(255) NULL UNIQUE COMMENT 'Unique referral code for this doctor'
    `);
    
    console.log('Successfully added referral_code column!');
    process.exit(0);
  } catch (error) {
    // Check if column already exists
    if (error.message && error.message.includes('Duplicate column name')) {
      console.log('Column referral_code already exists. Migration complete.');
      process.exit(0);
    }
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();

