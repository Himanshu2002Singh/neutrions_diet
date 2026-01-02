const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.post('/login', AdminController.login);

// Protected routes (require authentication)
router.get('/me', authenticateAdmin, AdminController.getMe);
router.post('/logout', authenticateAdmin, AdminController.logout);

// Admin management routes (admin only)
router.get('/', authenticateAdmin, AdminController.getAll);
router.post('/', authenticateAdmin, AdminController.create);
router.put('/:id', authenticateAdmin, AdminController.update);
router.delete('/:id', authenticateAdmin, AdminController.remove);

module.exports = router;

