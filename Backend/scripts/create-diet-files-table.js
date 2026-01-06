/**
 * Database Migration: Create diet_files table
 * Run this script to create the diet_files table in the database
 * 
 * Usage: node scripts/create-diet-files-table.js
 */

const { sequelize } = require('../config/database');
const path = require('path');

async function createDietFilesTable() {
  try {
    console.log('Creating diet_files table...');
    
    // Read the SQL file
    const fs = require('fs');
    const sqlContent = fs.readFileSync(
      path.join(__dirname, 'migrations', 'create-diet-files-table.sql'),
      'utf8'
    );
    
    // Execute the SQL
    await sequelize.query(sqlContent);
    
    console.log('diet_files table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating diet_files table:', error);
    process.exit(1);
  }
}

// Run the migration
createDietFilesTable();

