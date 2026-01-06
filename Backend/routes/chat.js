const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const { auth } = require('../middleware/auth');

// User routes - authenticate with user token
router.get('/user/:userId/dietitian', auth, ChatController.getUserDietitianChat);
router.get('/user/conversation/:conversationId/messages', auth, ChatController.getMessages);
router.post('/user/conversation/:userId/send', auth, ChatController.sendMessage);
router.put('/user/conversation/:conversationId/read', auth, ChatController.markAsRead);
router.get('/user/:userId/unread-count', auth, ChatController.getUnreadCount);

// Member (doctor/dietitian) routes - authenticate with user token (dietitians are Users with role='dietician')
router.get('/member/:memberId/conversations', auth, ChatController.getMemberConversations);
router.get('/member/conversation/:conversationId/messages', auth, ChatController.getMessages);
router.post('/member/conversation/:memberId/send', auth, ChatController.sendMessage);
router.put('/member/conversation/:conversationId/read', auth, ChatController.markAsRead);

module.exports = router;

