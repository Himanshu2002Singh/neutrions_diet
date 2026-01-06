const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Admin = require('./Admin');
const HealthProfile = require('./HealthProfile');
const BMICalculation = require('./BMICalculation');
const DietRecommendation = require('./DietRecommendation');
const DietFile = require('./DietFile');
const DietPlan = require('./DietPlan');
const Referral = require('./Referral');
const DailyMealActivity = require('./DailyMealActivity');
const ChatConversation = require('./ChatConversation');
const ChatMessage = require('./ChatMessage');

// Define associations
User.hasMany(HealthProfile, { foreignKey: 'userId', as: 'healthProfiles' });
HealthProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(BMICalculation, { foreignKey: 'userId', as: 'bmiCalculations' });
BMICalculation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(DietRecommendation, { foreignKey: 'userId', as: 'dietRecommendations' });
DietRecommendation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(DietFile, { foreignKey: 'userId', as: 'dietFiles' });
DietFile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(DietFile, { foreignKey: 'doctorId', as: 'uploadedDietFiles' });
DietFile.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

HealthProfile.hasMany(BMICalculation, { foreignKey: 'healthProfileId', as: 'bmiCalculations' });
BMICalculation.belongsTo(HealthProfile, { foreignKey: 'healthProfileId', as: 'healthProfile' });

HealthProfile.hasMany(DietRecommendation, { foreignKey: 'healthProfileId', as: 'dietRecommendations' });
DietRecommendation.belongsTo(HealthProfile, { foreignKey: 'healthProfileId', as: 'healthProfile' });

BMICalculation.hasMany(DietRecommendation, { foreignKey: 'bmiCalculationId', as: 'dietRecommendations' });
DietRecommendation.belongsTo(BMICalculation, { foreignKey: 'bmiCalculationId', as: 'bmiCalculation' });

// Referral associations
// User has many referrals they gave (referrer)
User.hasMany(Referral, { foreignKey: 'referrerUserId', as: 'referralsGiven' });
Referral.belongsTo(User, { foreignKey: 'referrerUserId', as: 'referrer' });

// User has many referrals they received (referred user)
User.hasMany(Referral, { foreignKey: 'referredUserId', as: 'referralsReceived' });
Referral.belongsTo(User, { foreignKey: 'referredUserId', as: 'referredUser' });

// DailyMealActivity associations
User.hasMany(DailyMealActivity, { foreignKey: 'userId', as: 'dailyMealActivities' });
DailyMealActivity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// DietPlan associations
User.hasMany(DietPlan, { foreignKey: 'userId', as: 'dietPlans' });
DietPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(DietPlan, { foreignKey: 'doctorId', as: 'uploadedDietPlans' });
DietPlan.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

// Self-referential association for referredByUserId
User.belongsTo(User, { foreignKey: 'referredByUserId', as: 'referredBy' });
User.hasMany(User, { foreignKey: 'referredByUserId', as: 'referredUsers' });

// HealthProfile can have only one current profile per user
HealthProfile.addHook('beforeCreate', 'setCurrentFlag', async (healthProfile) => {
  if (healthProfile.isCurrent) {
    await HealthProfile.update(
      { isCurrent: false },
      { 
        where: { 
          userId: healthProfile.userId,
          isCurrent: true 
        } 
      }
    );
  }
});

// Chat associations
// Conversation belongs to a user (the patient)
User.hasMany(ChatConversation, { foreignKey: 'userId', as: 'chatConversations' });
ChatConversation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Conversation belongs to a member (doctor/dietitian)
User.hasMany(ChatConversation, { foreignKey: 'memberId', as: 'memberConversations' });
ChatConversation.belongsTo(User, { foreignKey: 'memberId', as: 'member' });

// Messages belong to a conversation
ChatConversation.hasMany(ChatMessage, { foreignKey: 'conversationId', as: 'messages' });
ChatMessage.belongsTo(ChatConversation, { foreignKey: 'conversationId', as: 'conversation' });

// Messages belong to a sender (either user or member)
User.hasMany(ChatMessage, { foreignKey: 'senderId', as: 'sentMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

module.exports = {
  sequelize,
  User,
  Admin,
  HealthProfile,
  BMICalculation,
  DietRecommendation,
  DietFile,
  DietPlan,
  Referral,
  DailyMealActivity,
  ChatConversation,
  ChatMessage
};
