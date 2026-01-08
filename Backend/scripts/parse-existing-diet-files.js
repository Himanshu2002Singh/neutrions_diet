const db = require('../models/index.js');
const pdfExtractionService = require('../services/pdfExtractionService');
const fs = require('fs');

async function parseExistingDietFiles() {
  try {
    console.log('=== Parsing Existing Diet Files ===\n');

    // Get all diet files that haven't been parsed
    // We'll check which files have a corresponding DietPlan
    const { DietFile, DietPlan } = db;

    const allDietFiles = await DietFile.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${allDietFiles.length} total diet files\n`);

    let parsed = 0;
    let skipped = 0;
    let errors = [];

    for (const dietFile of allDietFiles) {
      console.log(`\nProcessing file ID ${dietFile.id} for User ${dietFile.userId}:`);
      console.log(`  File: ${dietFile.originalName}`);

      // Check if this user already has a current diet plan
      const existingPlan = await DietPlan.findOne({
        where: {
          userId: dietFile.userId,
          isCurrent: true
        }
      });

      if (existingPlan) {
        console.log(`  ⚠️  User ${dietFile.userId} already has a diet plan (ID: ${existingPlan.id}), skipping...`);
        skipped++;
        continue;
      }

      // Check if file exists
      if (!fs.existsSync(dietFile.filePath)) {
        console.log(`  ❌ File not found at path: ${dietFile.filePath}`);
        errors.push({ fileId: dietFile.id, error: 'File not found' });
        continue;
      }

      try {
        // Parse the PDF
        console.log(`  📄 Parsing PDF...`);
        const dietPlan = await pdfExtractionService.parseDietPlanPDF(dietFile.filePath);
        console.log(`  ✅ Parsed successfully!`);
        console.log(`     User: ${dietPlan.userName}`);
        console.log(`     Profile: ${JSON.stringify(dietPlan.profile)}`);
        console.log(`     Nutrition: ${JSON.stringify(dietPlan.nutritionTargets)}`);
        console.log(`     Schedule: ${dietPlan.dailySchedule?.length || 0} meals`);

        // Save to DietPlan table
        const newPlan = await DietPlan.create({
          userId: dietFile.userId,
          doctorId: dietFile.doctorId,
          planName: `Diet Plan - ${new Date(dietFile.createdAt).toISOString().split('T')[0]}`,
          userName: dietPlan.userName || 'User',
          profileData: dietPlan.profile || {},
          nutritionTargets: dietPlan.nutritionTargets || {},
          dailySchedule: dietPlan.dailySchedule || [],
          lateNightOptions: dietPlan.lateNightOptions || [],
          importantPoints: dietPlan.importantPoints || [],
          portionSizeReference: dietPlan.portionSizeReference || {},
          goals: dietPlan.goals || [],
          isActive: true,
          isCurrent: true
        });

        console.log(`  💾 Saved DietPlan ID: ${newPlan.id}`);
        parsed++;

      } catch (parseError) {
        console.log(`  ❌ Error parsing: ${parseError.message}`);
        errors.push({ fileId: dietFile.id, error: parseError.message });
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total files: ${allDietFiles.length}`);
    console.log(`Parsed successfully: ${parsed}`);
    console.log(`Skipped (already has plan): ${skipped}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\nError details:');
      errors.forEach(e => {
        console.log(`  File ID ${e.fileId}: ${e.error}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await db.sequelize.close();
  }
}

parseExistingDietFiles();

