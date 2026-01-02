const express = require('express');
const { body, param, query } = require('express-validator');
const membersController = require('../controllers/MembersController');

const router = express.Router();

// Validation middleware for member creation
const validateMemberCreation = [
  body('firstName')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['doctor', 'dietitian'])
    .withMessage('Role must be either "doctor" or "dietitian"'),
  body('phone')
    .optional()
    .isString()
    .trim()
    .withMessage('Phone must be a string'),
  body('category')
    .optional()
    .isIn(['doctor', 'dietitian'])
    .withMessage('Category must be either "doctor" or "dietitian"')
];

// Validation middleware for member update
const validateMemberUpdate = [
  body('firstName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['doctor', 'dietitian'])
    .withMessage('Role must be either "doctor" or "dietitian"'),
  body('phone')
    .optional()
    .isString()
    .trim()
    .withMessage('Phone must be a string'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Validation middleware for member ID parameter
const validateMemberId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Member ID must be a valid integer')
];

// Validation middleware for pagination
const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  query('role')
    .optional()
    .isIn(['doctor', 'dietitian'])
    .withMessage('Role filter must be either "doctor" or "dietitian"')
];

// Routes

/**
 * @route POST /api/members
 * @desc Create a new member (doctor or dietician)
 * @access Public
 */
router.post('/', validateMemberCreation, membersController.createMember);

/**
 * @route GET /api/members
 * @desc Get all members with pagination
 * @access Public
 */
router.get('/', validatePagination, membersController.getAllMembers);

/**
 * @route GET /api/members/assignable
 * @desc Get active members for assignment (doctors and dietitians)
 * @access Public
 */
router.get('/assignable',
  query('role')
    .optional()
    .isIn(['doctor', 'dietitian'])
    .withMessage('Role filter must be either "doctor" or "dietitian"'),
  membersController.getAssignableMembers
);

/**
 * @route GET /api/members/stats
 * @desc Get member statistics
 * @access Public
 */
router.get('/stats', membersController.getMemberStats);

/**
 * @route GET /api/members/:id
 * @desc Get a specific member by ID
 * @access Public
 */
router.get('/:id', validateMemberId, membersController.getMemberById);

/**
 * @route PUT /api/members/:id
 * @desc Update a member
 * @access Public
 */
router.put('/:id', validateMemberId, validateMemberUpdate, membersController.updateMember);

/**
 * @route DELETE /api/members/:id
 * @desc Delete a member (soft delete)
 * @access Public
 */
router.delete('/:id', validateMemberId, membersController.deleteMember);

module.exports = router;
