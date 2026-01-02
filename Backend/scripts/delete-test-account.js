/**
 * Script to delete test account: technicalstudy2025@gmail.com
 * Run this after restarting the server to ensure the email is removed
 */

const { sequelize, Admin } = require('../models');

async function deleteTestAccount() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find the test account
    const testAccount = await Admin.findOne({
      where: { email: 'technicalstudy2025@gmail.com' }
    });

    if (testAccount) {
      console.log(`📧 Found account: ${testAccount.email} (ID: ${testAccount.id})`);
      await testAccount.destroy();
      console.log('✅ Account deleted successfully');
    } else {
      console.log('ℹ️ Account not found (already deleted or never existed)');
    }

    await sequelize.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteTestAccount();

