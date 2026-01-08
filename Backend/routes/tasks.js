const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { authenticateAdmin } = require('../middleware/auth');
const TaskController = require('../controllers/TaskController');

// Validation middleware
const validateTaskCreate = [
  body('title')
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('taskType')
    .isIn(['daily', 'weekly', 'monthly', 'new_user'])
    .withMessage('Task type must be daily, weekly, monthly, or new_user'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('targetCount')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Target count must be between 1 and 1000'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
];

const validateTaskId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a valid integer')
];

const validateDoctorTaskId = [
  param('doctorTaskId')
    .isInt({ min: 1 })
    .withMessage('Doctor task ID must be a valid integer')
];

const validateAssignTask = [
  body('doctorId')
    .isInt({ min: 1 })
    .withMessage('Doctor ID must be a valid integer')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// ============================================
// Public/Protected Routes
// ============================================

// Get all tasks (admin only)
router.get('/',  validatePagination, TaskController.getAllTasks);

// Get task statistics (admin only)
router.get('/stats',  TaskController.getTaskStats);

// Get all doctors (admin only)
router.get('/doctors',  TaskController.getAllDoctors);

// Create a new task (admin only)
router.post('/',  validateTaskCreate, TaskController.createTask);

// Get a single task (admin only)
router.get('/:id',  validateTaskId, TaskController.getTask);

// Update a task (admin only)
router.put('/:id',  validateTaskId, TaskController.updateTask);

// Delete a task (admin only)
router.delete('/:id',  validateTaskId, TaskController.deleteTask);

// Assign task to a doctor (admin only)
router.post('/:id/assign',  [...validateTaskId, ...validateAssignTask], TaskController.assignTaskToDoctor);

// ============================================
// Doctor Routes
// ============================================

// Get tasks assigned to a doctor
router.get('/doctor/:doctorId',  validatePagination, TaskController.getDoctorTasks);

// Update doctor task status
router.put('/doctor/:doctorTaskId/status',  validateDoctorTaskId, TaskController.updateDoctorTaskStatus);

// Update referral count (called when user logs in via referral)
router.post('/doctor/:doctorId/referral',  TaskController.updateReferralCount);

// Get referrals for a doctor
router.get('/doctor/:doctorId/referrals',  TaskController.getDoctorReferrals);

// Get doctor's referral code
router.get('/doctor/:doctorId/referral-code',  TaskController.getDoctorReferralCode);

// Create a referral invitation
router.post('/doctor/:doctorId/referral-invite',  TaskController.createReferralInvite);

module.exports = router;

