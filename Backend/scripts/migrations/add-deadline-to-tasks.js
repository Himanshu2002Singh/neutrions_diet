/**
 * Script to add deadline and referral timer columns to the tasks table
 */

const { sequelize } = require('../../config/database');

async function addDeadlineColumns() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully.');

    console.log('Adding deadline columns to tasks table...');

    // Add deadline column
    try {
      await sequelize.query(`
        ALTER TABLE tasks
        ADD COLUMN deadline TIMESTAMP NULL
      `);
      console.log('Added deadline column.');
    } catch (e) {
      if (e.message.includes('Duplicate column name') || e.message.includes('already exists')) {
        console.log('deadline column already exists.');
      } else {
        console.log('deadline column error:', e.message);
      }
    }

    // Add referral_timer_minutes column
    try {
      await sequelize.query(`
        ALTER TABLE tasks
        ADD COLUMN referral_timer_minutes INT DEFAULT 1440
      `);
      console.log('Added referral_timer_minutes column.');
    } catch (e) {
      if (e.message.includes('Duplicate column name') || e.message.includes('already exists')) {
        console.log('referral_timer_minutes column already exists.');
      } else {
        console.log('referral_timer_minutes column error:', e.message);
      }
    }

    // Add last_referral_at column
    try {
      await sequelize.query(`
        ALTER TABLE tasks
        ADD COLUMN last_referral_at TIMESTAMP NULL
      `);
      console.log('Added last_referral_at column.');
    } catch (e) {
      if (e.message.includes('Duplicate column name') || e.message.includes('already exists')) {
        console.log('last_referral_at column already exists.');
      } else {
        console.log('last_referral_at column error:', e.message);
      }
    }

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

addDeadlineColumns();

