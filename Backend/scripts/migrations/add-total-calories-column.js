/**
 * Script to add total_calories column to daily_meal_activities table
 * Run this script with: node scripts/add-total-calories-column.js
 */

const { sequelize } = require('../../config/database');
const { QueryTypes } = require('sequelize');

async function addTotalCaloriesColumn() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully!');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'daily_meal_activities' 
      AND COLUMN_NAME = 'total_calories'
    `);

    if (results[0].count > 0) {
      console.log('Column total_calories already exists. Skipping...');
    } else {
      // Add the column
      console.log('Adding total_calories column...');
      await sequelize.query(`
        ALTER TABLE daily_meal_activities
        ADD COLUMN total_calories INT DEFAULT 0 COMMENT 'Total calories for this meal' AFTER notes
      `);
      console.log('Column total_calories added successfully!');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addTotalCaloriesColumn();

