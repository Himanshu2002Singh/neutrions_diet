/**
 * Seed script to insert Simmi Ji's diet plan into the database
 * Run this script with: node Backend/scripts/seed-simmi-diet.js
 */

const { sequelize, User, DietPlan } = require('../models');

async function seedSimmiDietPlan() {
  try {
    console.log('🌱 Starting Simmi Ji Diet Plan seed...');
    
    // Sync database
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');
    
    // Find or create a test user for Simmi Ji
    let user = await User.findOne({ where: { email: 'simmi.ji@test.com' } });
    
    if (!user) {
      user = await User.create({
        firstName: 'Simmi',
        lastName: 'Ji',
        email: 'simmi.ji@test.com',
        phone: '9876543210',
        password: 'password123',
        gender: 'female',
        age: 54,
        weight: 94,
        height: 163,
        activityLevel: 'active',
        medicalConditions: ['Thyroid', 'HTN'],
        medications: 'Thyroid 50 mcg, HTN',
        deficiency: 'Vitamin D',
        profession: 'Home maker',
        liveWithFamily: true
      });
      console.log('✅ Created test user for Simmi Ji');
    } else {
      console.log('ℹ️  Simmi Ji user already exists');
    }
    
    // Check if diet plan already exists
    const existingPlan = await DietPlan.findOne({
      where: { userId: user.id, isCurrent: true }
    });
    
    if (existingPlan) {
      console.log('ℹ️  Diet plan already exists for Simmi Ji, updating...');
      await existingPlan.update({
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
        goals: generateGoals()
      });
      console.log('✅ Diet plan updated successfully');
    } else {
      // Create the diet plan
      await DietPlan.create({
        userId: user.id,
        doctorId: null, // Can be updated with actual doctor ID
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
      console.log('✅ Diet plan created successfully');
    }
    
    // Log user ID for testing
    console.log(`\n📋 Simmi Ji User ID: ${user.id}`);
    console.log('📧 Email: simmi.ji@test.com');
    console.log('🔑 Password: password123');
    
    console.log('\n✨ Seed completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
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
        },
        {
          name: 'Air Fried Vegetable Cutlet',
          portion: '2 pieces + curd (150g)',
          imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop',
          calories: 200,
          macros: { protein: 10, carbs: 28, fats: 6 },
          notes: 'Low oil, healthy version of traditional cutlet'
        },
        {
          name: 'Avocado Toast',
          portion: '1 toast + green tea',
          imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef9f85b0c?w=200&h=150&fit=crop',
          calories: 320,
          macros: { protein: 8, carbs: 25, fats: 18 },
          notes: 'Healthy fats from avocado'
        },
        {
          name: 'Vegetable Idli',
          portion: '2 small + sambhar + peanut chutney',
          imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=150&fit=crop',
          calories: 240,
          macros: { protein: 10, carbs: 35, fats: 5 },
          notes: 'South Indian style healthy breakfast'
        },
        {
          name: 'Apple with Peanut Butter',
          portion: '1 apple + 1 tsp unsweetened peanut butter',
          imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=150&fit=crop',
          calories: 180,
          macros: { protein: 4, carbs: 25, fats: 8 },
          notes: 'Quick and easy breakfast option'
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
        },
        {
          name: 'Buttermilk',
          portion: '1 glass (250ml)',
          imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=200&h=150&fit=crop',
          calories: 40,
          macros: { protein: 2, carbs: 6, fats: 1 },
          notes: 'Cooling and digestive'
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
        },
        {
          name: 'Rajma + Rice',
          portion: '150g rajma + rice + salad',
          imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=150&fit=crop',
          calories: 420,
          macros: { protein: 18, carbs: 55, fats: 10 },
          notes: 'High fiber kidney beans curry'
        },
        {
          name: 'Kadi + Rice',
          portion: '1 medium bowl kadi + 1 small bowl rice',
          imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=150&fit=crop',
          calories: 380,
          macros: { protein: 14, carbs: 50, fats: 12 },
          notes: 'Traditional Indian curry with yogurt'
        },
        {
          name: 'Chapati + Mixed Dal',
          portion: '1 chapati + mixed dal + bhindi + curd',
          imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop',
          calories: 400,
          macros: { protein: 16, carbs: 48, fats: 14 },
          notes: 'Balanced thali style meal'
        },
        {
          name: 'Matar Makhana + Chapati',
          portion: '1 chapati + salad + raita',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop',
          calories: 360,
          macros: { protein: 14, carbs: 42, fats: 12 },
          notes: 'Low calorie, high protein option'
        },
        {
          name: 'Soya Chunks Curry',
          portion: '1 plate + rice + salad + curd',
          imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=150&fit=crop',
          calories: 380,
          macros: { protein: 25, carbs: 40, fats: 10 },
          notes: 'Excellent meat alternative, high protein'
        },
        {
          name: 'Paneer Pulao',
          portion: '150g + 150g curd + salad',
          imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop',
          calories: 480,
          macros: { protein: 18, carbs: 50, fats: 18 },
          notes: 'Flavorful rice dish with paneer'
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
        },
        {
          name: 'Lavender Tea',
          portion: '1 cup',
          imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=200&h=150&fit=crop',
          calories: 5,
          macros: { protein: 0, carbs: 1, fats: 0 },
          notes: 'Relaxing and stress-relieving'
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
        },
        {
          name: 'Hummus with Veggies',
          portion: '2 tbsp hummus + veggie sticks',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop',
          calories: 130,
          macros: { protein: 4, carbs: 12, fats: 8 },
          notes: 'Protein-rich dip with fresh vegetables'
        },
        {
          name: 'Makhana',
          portion: '50g + green tea',
          imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=150&fit=crop',
          calories: 100,
          macros: { protein: 4, carbs: 18, fats: 1 },
          notes: 'Low calorie, diabetic-friendly snack'
        },
        {
          name: 'Roasted Peanut',
          portion: '30g + green tea',
          imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=150&fit=crop',
          calories: 150,
          macros: { protein: 5, carbs: 5, fats: 12 },
          notes: 'Good source of healthy fats'
        },
        {
          name: 'Sweet Corn Chat',
          portion: '1 bowl + green tea',
          imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=150&fit=crop',
          calories: 130,
          macros: { protein: 4, carbs: 25, fats: 2 },
          notes: 'Add lemon and chat masala for taste'
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
        },
        {
          name: 'Saute Veggies with Paneer',
          portion: '1 plate (200g)',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop',
          calories: 250,
          macros: { protein: 12, carbs: 15, fats: 15 },
          notes: 'Quick and nutritious dinner'
        },
        {
          name: 'Spinach Soup',
          portion: '1 bowl (250ml)',
          imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=150&fit=crop',
          calories: 80,
          macros: { protein: 5, carbs: 10, fats: 2 },
          notes: 'Iron-rich, very light option'
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
      name: 'Nuts and Seeds Balls',
      portion: '1 homemade ball (20g)',
      imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=150&fit=crop',
      calories: 80,
      macros: { protein: 2, carbs: 10, fats: 4 },
      notes: 'Make with dates, nuts, and seeds'
    },
    {
      name: 'Apple with Peanut Butter',
      portion: '1 medium apple + 1 tsp PB',
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=150&fit=crop',
      calories: 180,
      macros: { protein: 4, carbs: 25, fats: 8 },
      notes: 'Unsweetened peanut butter only'
    },
    {
      name: 'Moong Dal Chips',
      portion: 'Air fried (30g)',
      imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=150&fit=crop',
      calories: 80,
      macros: { protein: 5, carbs: 12, fats: 1 },
      notes: 'Healthy alternative to potato chips'
    },
    {
      name: 'Beetroot Chips',
      portion: 'Air fried (30g)',
      imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=150&fit=crop',
      calories: 60,
      macros: { protein: 2, carbs: 12, fats: 0 },
      notes: 'Rich in nitrates and antioxidants'
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

// Run the seed
seedSimmiDietPlan();

