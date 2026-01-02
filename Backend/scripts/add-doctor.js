/**
 * Script to add a new doctor with PLAIN TEXT password
 */

const { sequelize, Admin } = require('../models');

async function addDoctor() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const doctorData = {
      firstName: 'Doctor',
      lastName: 'Test',
      email: 'technicalstudy2025@gmail.com',
      password: '1234567890',  // Plain text password
      role: 'member',
      category: 'doctor',
      phone: '1234567890',
      isActive: true
    };

    // Check if doctor already exists
    const existing = await Admin.findOne({ where: { email: doctorData.email } });
    if (existing) {
      console.log(`⚠️  Doctor with email ${doctorData.email} already exists`);
      console.log('   Deleting existing...');
      await existing.destroy();
      console.log('   Deleted. Creating new...');
    }

    // Create new doctor with plain text password
    const doctor = await Admin.create(doctorData);
    console.log('✅ Doctor created successfully!');
    console.log('\n📋 Doctor Details:');
    console.log(`   Email: ${doctor.email}`);
    console.log(`   Password: ${doctor.password} (plain text)`);
    console.log(`   Role: ${doctor.role}`);
    console.log(`   Category: ${doctor.category}`);
    console.log(`   ID: ${doctor.id}`);

    await sequelize.close();
    console.log('\n🔒 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addDoctor();

