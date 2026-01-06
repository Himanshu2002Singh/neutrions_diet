const express = require('express');
const { body, param, query } = require('express-validator');
const healthController = require('../controllers/HealthController');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Validation middleware for health form submission
const validateHealthForm = [
  body('weight')
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  body('height')
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
  body('age')
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120 years'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('activityLevel')
    .isIn(['sedentary', 'light', 'moderate', 'active', 'very_active'])
    .withMessage('Activity level must be valid'),
  body('medicalConditions')
    .optional()
    .isString()
    .withMessage('Medical conditions must be a string'),
  body('goals')
    .optional()
    .isString()
    .withMessage('Goals must be a string')
];

// Validation middleware for BMI calculation
const validateBMIForm = [
  body('weight')
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  body('height')
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
  body('age')
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120 years'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('activityLevel')
    .isIn(['sedentary', 'light', 'moderate', 'active', 'very_active'])
    .withMessage('Activity level must be valid')
];

// Validation middleware for user ID parameter
const validateUserId = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a valid integer')
];

// Routes

/**
 * @route POST /api/health/submit/:userId
 * @desc Submit health form and generate complete health profile
 * @access Public
 */
router.post('/submit/:userId', validateUserId, validateHealthForm, healthController.submitHealthForm);

/**
 * @route GET /api/health/profile/:userId
 * @desc Get user's current health profile
 * @access Public
 */
router.get('/profile/:userId', validateUserId, healthController.getCurrentHealthProfile);

/**
 * @route GET /api/health/history/:userId
 * @desc Get user's health profile history
 * @access Public
 */
router.get('/history/:userId', validateUserId, 
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  healthController.getHealthProfileHistory
);

/**
 * @route POST /api/bmi/calculate
 * @desc Calculate BMI only (for real-time calculations)
 * @access Public
 */
router.post('/bmi/calculate', validateBMIForm, healthController.calculateBMI);

/**
 * @route GET /api/bmi/categories
 * @desc Get BMI categories and recommendations
 * @access Public
 */
router.get('/bmi/categories', healthController.getBMICategories);

/**
 * @route POST /api/diet/generate/:bmiCalculationId
 * @desc Generate diet recommendations
 * @access Public
 */
router.post('/diet/generate/:bmiCalculationId', 
  param('bmiCalculationId')
    .isInt({ min: 1 })
    .withMessage('BMI calculation ID must be a valid integer'),
  healthController.generateDietRecommendation
);

/**
 * @route GET /api/diet/recommendations/:userId
 * @desc Get all diet recommendations for a user
 * @access Public
 */
router.get('/diet/recommendations/:userId', validateUserId, healthController.getDietRecommendations);

// Admin Dashboard Routes

/**
 * @route GET /api/health/admin/users-with-profiles
 * @desc Get all users with their health profiles for admin dashboard
 * @access Admin
 */
router.get('/admin/users-with-profiles',
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  healthController.getUsersWithHealthProfiles
);

/**
 * @route GET /api/health/admin/user/:userId/profile
 * @desc Get a specific user's health profile details for admin
 * @access Admin
 */
router.get('/admin/user/:userId/profile', validateUserId, healthController.getUserHealthProfile);

/**
 * @route GET /api/health/admin/unassigned-users
 * @desc Get users with health profiles but no assigned dietician
 * @access Admin
 */
router.get('/admin/unassigned-users',
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  healthController.getUnassignedUsers
);

/**
 * @route POST /api/health/admin/assign-dietician
 * @desc Assign a dietician to a user
 * @access Admin
 */
router.post('/admin/assign-dietician',
  body('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a valid integer'),
  body('dieticianId')
    .isInt({ min: 1 })
    .withMessage('Dietician ID must be a valid integer'),
  healthController.assignDieticianToUser
);

/**
 * @route POST /api/health/admin/remove-assignment
 * @desc Remove assignment (unassign dietician from user)
 * @access Admin
 */
router.post('/admin/remove-assignment',
  body('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a valid integer'),
  healthController.removeUserAssignment
);

/**
 * @route GET /api/health/admin/user/:userId/assignment
 * @desc Get user's assignment status
 * @access Admin
 */
router.get('/admin/user/:userId/assignment', validateUserId, healthController.getUserAssignmentStatus);

// Doctor Panel Routes

/**
 * @route GET /api/health/doctor/assigned-users
 * @desc Get users assigned to the logged-in doctor/dietician with their health profiles
 * @access Doctor/Dietician
 */
router.get('/doctor/assigned-users', authenticateAdmin, healthController.getDoctorAssignedUsers);

/**
 * @route GET /api/health/doctor/user/:userId/health-profile
 * @desc Get a specific user's health profile for the assigned doctor
 * @access Doctor/Dietician
 */
router.get('/doctor/user/:userId/health-profile', authenticateAdmin, validateUserId, healthController.getUserHealthProfileForDoctor);

/**
 * @route POST /api/health/doctor/upload-diet-file
 * @desc Upload a diet file for a user
 * @access Doctor/Dietician
 */
router.post('/doctor/upload-diet-file', authenticateAdmin, upload.single('file'), healthController.uploadDietFile);

/**
 * @route GET /api/health/doctor/user/:userId/diet-files
 * @desc Get all diet files for a user
 * @access Doctor/Dietician
 */
router.get('/doctor/user/:userId/diet-files', authenticateAdmin, validateUserId, healthController.getUserDietFiles);

/**
 * @route GET /api/health/doctor/diet-files/:fileId/download
 * @desc Download a diet file
 * @access Doctor/Dietician
 */
router.get('/doctor/diet-files/:fileId/download', authenticateAdmin, healthController.downloadDietFile);

/**
 * @route DELETE /api/health/doctor/diet-files/:fileId
 * @desc Delete a diet file
 * @access Doctor/Dietician
 */
router.delete('/doctor/diet-files/:fileId', authenticateAdmin, healthController.deleteDietFile);

/**
 * @route GET /api/health/admin/user-diet-report
 * @desc Get user diet report - shows users with assigned doctors and diet upload status
 * @access Admin
 */
router.get('/admin/user-diet-report',
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  healthController.getUserDietReport
);

// Daily Meal Activity Routes (User-facing)

/**
 * @route POST /api/health/meal-activity/save
 * @desc Save user's daily meal activity
 * @access User
 */
router.post('/meal-activity/save',
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
  body('mealType')
    .isString()
    .isIn(['breakfast', 'mid-morning', 'lunch', 'pre-workout', 'evening-snacks', 'dinner', 'bedtime'])
    .withMessage('Meal type must be valid'),
  body('selectedItems')
    .isArray()
    .withMessage('Selected items must be an array'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
  healthController.saveMealActivity
);

/**
 * @route GET /api/health/meal-activity/:userId/:date
 * @desc Get user's meal activity for a specific date
 * @access User
 */
router.get('/meal-activity/:userId/:date',
  validateUserId,
  param('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
  healthController.getMealActivityByDate
);

/**
 * @route GET /api/health/meal-activity/:userId
 * @desc Get user's meal activities for a date range (default: last 7 days)
 * @access User
 */
router.get('/meal-activity/:userId',
  validateUserId,
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),
  healthController.getMealActivities
);

/**
 * @route GET /api/diet/personalized/:userId
 * @desc Get personalized diet plan for a user based on their health profile
 * @access User
 */
router.get('/diet/personalized/:userId', validateUserId, healthController.getPersonalizedDietPlan);

/**
 * @route GET /api/diet/files
 * @desc Get all diet files/menu items
 * @access User
 */
router.get('/diet/files',
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  healthController.getDietFiles
);

/**
 * @route GET /api/diet/files/:id
 * @desc Get a specific diet file by ID
 * @access User
 */
router.get('/diet/files/:id',
  param('id')
    .isInt({ min: 1 })
    .withMessage('Diet file ID must be a valid integer'),
  healthController.getDietFile
);

/**
 * @route GET /api/diet/files/featured
 * @desc Get featured diet file
 * @access User
 */
router.get('/diet/files/featured', healthController.getFeaturedDietFile);

module.exports = router;

