/**
 * Script to add timestamp columns to the users table
 * This fixes the "Unknown column 'createdAt' in 'field list'" error
 */

const { sequelize } = require('../config/database');

async function addTimestampColumns() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully.');

    console.log('Adding timestamp columns to users table...');

    // Add created_at column if it doesn't exist
    await sequelize.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('Added created_at column.');

    // Add updated_at column if it doesn't exist
    await sequelize.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
    console.log('Added updated_at column.');

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error.message);
    // If "IF NOT EXISTS" is not supported, try adding directly
    if (error.message.includes('check the manual')) {
      console.log('Trying alternative approach without IF NOT EXISTS...');
      try {
        await sequelize.query(`
          ALTER TABLE users
          ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
        console.log('Added created_at column.');
      } catch (e) {
        if (!e.message.includes('Duplicate')) {
          console.log('created_at column may already exist or error:', e.message);
        }
      }

      try {
        await sequelize.query(`
          ALTER TABLE users
          ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);
        console.log('Added updated_at column.');
      } catch (e) {
        if (!e.message.includes('Duplicate')) {
          console.log('updated_at column may already exist or error:', e.message);
        }
      }
    }
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

addTimestampColumns();

