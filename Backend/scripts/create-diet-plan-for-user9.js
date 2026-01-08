/**
 * Create diet plan for User 9 from seed data
 * Run this script with: node Backend/scripts/create-diet-plan-for-user9.js
 */

const { sequelize, User, DietPlan, DietFile } = require('../models');

async function createDietPlanForUser9() {
  try {
    console.log('=== Creating Diet Plan for User 9 ===\n');

    // Skip sync - tables should already exist
    // await sequelize.sync({ alter: true });
    console.log('✅ Skipping database sync (tables should already exist)');

    // Find User 9
    const user = await User.findByPk(9);
    if (!user) {
      console.log('❌ User 9 not found');
      process.exit(1);
    }
    console.log(`✅ Found User 9: ${user.firstName} ${user.lastName}`);

    // Check if diet plan already exists
    const existingPlan = await DietPlan.findOne({
      where: { userId: user.id, isCurrent: true }
    });

    if (existingPlan) {
      console.log('ℹ️  Diet plan already exists for User 9');
      console.log(`   Plan ID: ${existingPlan.id}`);
      console.log(`   Plan Name: ${existingPlan.planName}`);
      console.log(`   Created: ${existingPlan.createdAt}`);
    } else {
      // Create the diet plan from seed data
      await DietPlan.create({
        userId: user.id,
        doctorId: null,
        planName: 'Simmi Ji Diet Plan - Weight Loss',
        userName: 'Simmi Ji',
        profileData: {
          age: 54,
          weight: 94,
          height: 163,
          bmiCategory: 'Obese II',
          target: 'Lose 10 kg further',
          medicalConditions: ['Thyroid', 'HTN'],
          medications: 'Thyroid 50 mcg, HTN',
          deficiency: 'Vitamin D',
          profession: 'Home maker',
          lifestyle: 'Active',
          liveWithFamily: true
        },
        nutritionTargets: {
          calories: '1000-1200 kcal',
          protein: '75g',
          fiber: '25-30g',
          fat: '35-40g',
          carbs: '150g'
        },
        dailySchedule: generateDailySchedule(),
        lateNightOptions: generateLateNightOptions(),
        importantPoints: generateImportantPoints(),
        portionSizeReference: generatePortionSizeReference(),
        goals: generateGoals(),
        isActive: true,
        isCurrent: true
      });
      console.log('✅ Diet plan created successfully for User 9');
    }

    // Check DietFile
    const dietFile = await DietFile.findOne({
      where: { userId: user.id, isActive: true },
      order: [['createdAt', 'DESC']]
    });

    if (dietFile) {
      console.log(`\n📄 DietFile exists: ${dietFile.originalName}`);
      console.log(`   File ID: ${dietFile.id}`);
    }

    // Log summary
    console.log('\n=== Summary ===');
    console.log(`User ID: ${user.id}`);
    console.log(`User Name: ${user.firstName} ${user.lastName}`);
    console.log(`Email: ${user.email}`);

    console.log('\n✨ Done!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

function generateDailySchedule() {
  return [
    {
      time: '8:00 AM',
      mealType: 'Wake Up',
      title: 'Overnight Soaked Trifala Water',
      description: 'Strain it in the morning and have it empty stomach',
      options: [
        {
          name: 'Trifala Water',
          portion: '1 glass (250ml)',
          imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=150&fit=crop',
          calories: 10,
          macros: { protein: 0, carbs: 2, fats: 0 },
          notes: 'Overnight soaked - helps with digestion and detoxification'
        }
      ],
      tips: 'Helps with digestion and detoxification. Best consumed on empty stomach.'
    },
    {
      time: '10:00 AM',
      mealType: 'Breakfast',
      title: 'Healthy Breakfast Options',
      description: 'Choose one of the following nutritious breakfast options',
      options: [
        {
          name: 'Paneer Stuffed Moong Dal Cheela',
          portion: '1 small piece + low fat curd (150g)',
          imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop',
          calories: 280,
          macros: { protein: 15, carbs: 25, fats: 12 },
          notes: 'High protein breakfast option'
        },
        {
          name: 'Curd with Fruit and Nuts + Seeds',
          portion: '1 big bowl (350g)',
          imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=150&fit=crop',
          calories: 220,
          macros: { protein: 12, carbs: 30, fats: 6 },
          notes: 'Rich in probiotics and antioxidants'
        },
        {
          name: 'Sprouted Moong with Paneer',
          portion: '1 big bowl + 50g paneer',
          imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=200&h=150&fit=crop',
          calories: 250,
          macros: { protein: 18, carbs: 22, fats: 10 },
          notes: 'Excellent source of plant and animal protein'
        }
      ],
      tips: 'Include protein in every breakfast for sustained energy'
    },
    {
      time: '12:30 PM',
      mealType: 'Mid-Morning',
      title: 'Seasonal Fruit + Seeds',
      description: 'Light mid-morning snack to keep energy levels up',
      options: [
        {
          name: 'Seasonal Fruit + Mixed Seeds',
          portion: '1 medium fruit + 1 tbsp mixed seeds (15g)',
          imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=150&fit=crop',
          calories: 120,
          macros: { protein: 3, carbs: 20, fats: 5 },
          notes: 'Seasonal fruits like papaya, guava, orange, apple'
        },
        {
          name: 'Coconut Water',
          portion: '1 glass (250ml)',
          imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=200&h=150&fit=crop',
          calories: 45,
          macros: { protein: 0, carbs: 11, fats: 0 },
          notes: 'Natural electrolyte replenishment'
        }
      ],
      tips: 'Stay hydrated and get natural vitamins from seasonal fruits'
    },
    {
      time: '2:30 PM',
      mealType: 'Lunch',
      title: 'Balanced Lunch Options',
      description: 'Complete meal with proteins, carbs, and vegetables',
      options: [
        {
          name: 'Moong Dal + Rice',
          portion: '1 cup dal + 1 cup rice + salad',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop',
          calories: 400,
          macros: { protein: 15, carbs: 60, fats: 8 },
          notes: 'Light and easy to digest'
        },
        {
          name: 'Quinoa Bowl',
          portion: '1 small bowl with veggies + salad',
          imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=200&h=150&fit=crop',
          calories: 350,
          macros: { protein: 12, carbs: 45, fats: 10 },
          notes: 'Complete protein with all essential amino acids'
        },
        {
          name: 'Paneer Preparation',
          portion: '100g paneer + 1 roti + salad',
          imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop',
          calories: 450,
          macros: { protein: 22, carbs: 35, fats: 20 },
          notes: 'Rich in calcium and protein'
        }
      ],
      tips: 'Include curd or raita for probiotics and better digestion'
    },
    {
      time: '4:00 PM',
      mealType: 'Pre-Workout',
      title: 'Pre-Workout Energy Boost',
      description: 'Light snack before workout for energy',
      options: [
        {
          name: 'Walnuts + Almonds',
          portion: '2 walnuts + 6 soaked almonds',
          imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=150&fit=crop',
          calories: 100,
          macros: { protein: 3, carbs: 3, fats: 9 },
          notes: 'Brain-healthy nuts'
        }
      ],
      tips: 'Light energy boost before workout - do not overeat'
    },
    {
      time: '5:00 PM',
      mealType: 'Evening Snacks',
      title: 'Healthy Evening Snacks',
      description: 'Light evening snacks to satisfy hunger cravings',
      options: [
        {
          name: 'Roasted Chana',
          portion: '30g with lemon, chat masala',
          imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=150&fit=crop',
          calories: 120,
          macros: { protein: 6, carbs: 15, fats: 4 },
          notes: 'High protein snack'
        },
        {
          name: 'Sprouted Moong Chat',
          portion: '1 bowl with onion, tomato, coriander, lemon',
          imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=150&fit=crop',
          calories: 100,
          macros: { protein: 7, carbs: 15, fats: 2 },
          notes: 'Low calorie, high fiber snack'
        }
      ],
      tips: 'Add lemon, chili powder, or chat masala for enhanced taste'
    },
    {
      time: '7:30 PM',
      mealType: 'Dinner',
      title: 'Light Dinner Options',
      description: 'Early, light dinner for better digestion and sleep',
      options: [
        {
          name: 'Tomato Soup',
          portion: '1 bowl (250ml) + salad',
          imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=150&fit=crop',
          calories: 150,
          macros: { protein: 3, carbs: 20, fats: 5 },
          notes: 'Rich in lycopene and antioxidants'
        },
        {
          name: 'Dal Soup',
          portion: '1 bowl (250ml) + salad',
          imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=150&fit=crop',
          calories: 140,
          macros: { protein: 8, carbs: 18, fats: 3 },
          notes: 'Light and nourishing'
        },
        {
          name: 'Vegetable Soup',
          portion: '1 bowl (250ml)',
          imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=150&fit=crop',
          calories: 100,
          macros: { protein: 4, carbs: 15, fats: 2 },
          notes: 'Loaded with vitamins and minerals'
        }
      ],
      tips: 'Keep dinner light and early (at least 2-3 hours before bedtime)'
    },
    {
      time: '10:00 PM',
      mealType: 'Bed Time',
      title: 'Bedtime Drink',
      description: 'Relaxing drink before sleep',
      options: [
        {
          name: 'Chamomile Tea',
          portion: '1 cup (250ml)',
          imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=200&h=150&fit=crop',
          calories: 5,
          macros: { protein: 0, carbs: 1, fats: 0 },
          notes: 'Promotes relaxation and better sleep'
        }
      ],
      tips: 'Helps with sleep and relaxation. Avoid caffeine after 4 PM.'
    }
  ];
}

function generateLateNightOptions() {
  return [
    {
      name: 'Protein Bar',
      portion: 'Half bar (25g)',
      imageUrl: 'https://images.unsplash.com/photo-1622484212028-5f1bf3b57d5c?w=200&h=150&fit=crop',
      calories: 100,
      macros: { protein: 10, carbs: 8, fats: 4 },
      notes: 'Choose low sugar protein bar'
    },
    {
      name: 'Trail Mix',
      portion: '2 tbsp (30g)',
      imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=150&fit=crop',
      calories: 120,
      macros: { protein: 3, carbs: 15, fats: 6 },
      notes: 'Homemade with nuts and dried fruits'
    },
    {
      name: 'Apple with Peanut Butter',
      portion: '1 medium apple + 1 tsp PB',
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=150&fit=crop',
      calories: 180,
      macros: { protein: 4, carbs: 25, fats: 8 },
      notes: 'Unsweetened peanut butter only'
    }
  ];
}

function generateImportantPoints() {
  return [
    'Check weight every 10 days empty stomach in the morning (avoid if constipated, bloated)',
    'Take whole body measurements once a month in the morning empty stomach',
    'Update about your meals on WhatsApp for better tracking',
    'Stay connected as much as possible for better consistency',
    'Be watchful of the portion size (most important)',
    'Drink at least 8 glasses of water daily',
    'Include all food groups in your diet',
    'Avoid processed foods and sugar',
    'Practice mindful eating',
    'Get adequate sleep (7-8 hours)'
  ];
}

function generatePortionSizeReference() {
  return {
    '1 glass': '250 ml',
    '1 small bowl': '150 g',
    '1 medium bowl': '250 g',
    '1 big bowl': '350 g',
    '1 tsp': '5 g',
    '1 tbsp': '15 g',
    '1 chapati/roti': '30 g',
    '1 cup': '200-250 ml',
    '1 medium fruit': '150-200 g'
  };
}

function generateGoals() {
  return [
    'S: Add small frequent meals (5-6 times per day)',
    'M: Track meals daily and update on WhatsApp',
    'A: Start with 3 main meals + 2-3 snacks',
    'R: Better blood sugar control and sustained energy',
    'T: Implement within 1 week and maintain long term',
    '',
    'S: Add Trifala powder in routine',
    'M: Drink Trifala water every morning',
    'A: Keep Trifala powder readily available',
    'R: Improved digestion and detoxification',
    'T: Start from day 1 and continue daily',
    '',
    'S: Increase Protein intake',
    'M: Include protein in every meal',
    'A: Aim for 75g protein daily',
    'R: Better muscle maintenance and satiety',
    'T: Gradually increase over 2 weeks'
  ];
}

// Run the script
createDietPlanForUser9();

