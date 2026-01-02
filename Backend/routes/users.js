const express = require('express');
const { query, param } = require('express-validator');
const usersController = require('../controllers/UsersController');

const router = express.Router();

/**
 * Validation middleware for pagination
 */
const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  query('search')
    .optional()
    .isString()
    .trim()
    .withMessage('Search must be a string'),
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either "active" or "inactive"')
];

/**
 * Validation middleware for user ID parameter
 */
const validateUserId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a valid integer')
];

/**
 * Validation middleware for user update
 */
const validateUserUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a valid integer')
];

/**
 * Routes for managing regular users
 */

// GET /api/users - Get all users with pagination and filters
router.get('/', validatePagination, usersController.getAllUsers);

// GET /api/users/stats - Get user statistics
router.get('/stats', usersController.getUserStats);

// GET /api/users/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', usersController.getDashboardStats);

// GET /api/users/:id - Get a specific user by ID
router.get('/:id', validateUserId, usersController.getUserById);

// PUT /api/users/:id - Update a user
router.put('/:id', validateUserId, usersController.updateUser);

// DELETE /api/users/:id - Delete a user (soft delete)
router.delete('/:id', validateUserId, usersController.deleteUser);

module.exports = router;

