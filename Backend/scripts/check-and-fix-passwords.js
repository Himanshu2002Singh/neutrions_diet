/**
 * Script to check and fix password formats in admin table
 * - Detects hashed passwords (bcrypt hashes start with $2a$, $2b$, etc.)
 * - Converts them to plain text if needed
 */

const { sequelize, Admin } = require('../models');
const bcrypt = require('bcryptjs');

async function checkAndFixPasswords() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get all admins
    const admins = await Admin.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'password', 'role']
    });

    console.log(`📊 Found ${admins.length} admin(s)\n`);
    console.log('Checking password formats...');
    console.log('='.repeat(60));

    let fixedCount = 0;

    for (const admin of admins) {
      const isHashed = admin.password.startsWith('$2a$') || 
                       admin.password.startsWith('$2b$') || 
                       admin.password.startsWith('$2y$');

      console.log(`\n👤 ${admin.firstName} ${admin.lastName}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Password starts with: ${admin.password.substring(0, 10)}...`);
      console.log(`   Is Hashed: ${isHashed ? '❌ YES (needs fix)' : '✅ NO (plain text)'}`);

      // If password is hashed, we can't recover the plain text
      // We'll need to note this and require password reset
      if (isHashed) {
        console.log(`   ⚠️  WARNING: Password is hashed. Cannot convert automatically.`);
        console.log(`   💡 Solution: Delete this admin and create new one`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Check complete!');
    console.log('\n📋 Notes:');
    console.log('   - Bcrypt hashes start with: $2a$, $2b$, or $2y$');
    console.log('   - Plain text passwords do NOT start with $');
    console.log('   - If any admin has hashed password, delete and recreate');

    await sequelize.close();
    console.log('\n🔒 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndFixPasswords();

