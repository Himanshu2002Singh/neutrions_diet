/**
 * Script to delete ALL members from admin table
 * Run this to clean up and start fresh
 */

const { sequelize, Admin } = require('../models');

async function deleteAllMembers() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Count members before deletion
    const count = await Admin.count({ where: { role: 'member' } });
    console.log(`📊 Found ${count} members to delete`);

    if (count > 0) {
      // Delete all members
      const deleted = await Admin.destroy({
        where: { role: 'member' }
      });
      console.log(`✅ Deleted ${deleted} members successfully`);
    } else {
      console.log('ℹ️ No members found (already empty)');
    }

    await sequelize.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteAllMembers();

