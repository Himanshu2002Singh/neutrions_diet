const db = require('../models/index.js');

async function checkDietPlan() {
  try {
    // Check DietPlan table
    const dietPlans = await db.DietPlan.findAll({ where: { userId: 9 } });
    console.log('=== Diet Plans for User 9 ===');
    console.log('Count:', dietPlans.length);
    if (dietPlans.length > 0) {
      console.log(JSON.stringify(dietPlans.map(p => p.toJSON()), null, 2));
    }
    
    // Check DietFile table
    const dietFiles = await db.DietFile.findAll({ where: { userId: 9 } });
    console.log('\n=== Diet Files for User 9 ===');
    console.log('Count:', dietFiles.length);
    if (dietFiles.length > 0) {
      console.log(JSON.stringify(dietFiles.map(f => f.toJSON()), null, 2));
    }
    
    // Check DietRecommendation table
    const dietRecs = await db.DietRecommendation.findAll({ where: { userId: 9 } });
    console.log('\n=== Diet Recommendations for User 9 ===');
    console.log('Count:', dietRecs.length);
    if (dietRecs.length > 0) {
      console.log(JSON.stringify(dietRecs.map(r => r.toJSON()), null, 2));
    }
    
    // Check all diet plans in system
    const allDietPlans = await db.DietPlan.findAll();
    console.log('\n=== All Diet Plans in System ===');
    console.log('Total:', allDietPlans.length);
    
    // Check all diet files in system
    const allDietFiles = await db.DietFile.findAll();
    console.log('\n=== All Diet Files in System ===');
    console.log('Total:', allDietFiles.length);

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await db.sequelize.close();
  }
}

checkDietPlan();

