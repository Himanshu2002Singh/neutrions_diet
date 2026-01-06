const { ChatMessage, ChatConversation } = require('../models');
const { User } = require('../models');
const { Op } = require('sequelize');

// Get chat with assigned dietitian for a user
const getUserDietitianChat = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get user's assigned dietitian from user record
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'assignedDieticianId']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.assignedDieticianId) {
      return res.status(404).json({
        success: false,
        message: 'No dietitian assigned to this user'
      });
    }

    // Get the assigned dietitian
    const assignedDoctor = await User.findByPk(user.assignedDieticianId, {
      where: { role: 'dietician' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role']
    });

    if (!assignedDoctor) {
      return res.status(404).json({
        success: false,
        message: 'Assigned dietitian not found'
      });
    }

    // Find or create conversation
    let conversation = await ChatConversation.findOne({
      where: {
        userId,
        memberId: assignedDoctor.id
      }
    });

    if (!conversation) {
      conversation = await ChatConversation.create({
        userId,
        memberId: assignedDoctor.id
      });
    }

    // Get unread message count
    const unreadCount = await ChatMessage.count({
      where: {
        conversationId: conversation.id,
        senderType: 'member',
        read: false
      }
    });

    res.json({
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          userId: conversation.userId,
          memberId: conversation.memberId,
          createdAt: conversation.created_at
        },
        dietitian: {
          id: assignedDoctor.id,
          name: `${assignedDoctor.firstName} ${assignedDoctor.lastName}`,
          email: assignedDoctor.email,
          role: assignedDoctor.role
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get user dietitian chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat',
      error: error.message
    });
  }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const messages = await ChatMessage.findAll({
      where: { conversationId },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    // Get total count
    const totalCount = await ChatMessage.count({
      where: { conversationId }
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Send in chronological order
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + messages.length < totalCount
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { conversationId, message, senderType } = req.body;
    
    // Get sender ID based on type
    let senderId;
    if (senderType === 'user') {
      senderId = parseInt(req.params.userId) || req.user?.id;
    } else {
      senderId = parseInt(req.params.memberId) || req.member?.id;
    }

    if (!senderId) {
      return res.status(400).json({
        success: false,
        message: 'Sender ID is required'
      });
    }

    // Create the message
    const chatMessage = await ChatMessage.create({
      conversationId: parseInt(conversationId),
      senderId,
      senderType,
      message
    });

    // Update conversation with last message
    await ChatConversation.update(
      {
        lastMessage: message.substring(0, 100),
        lastMessageAt: new Date()
      },
      { where: { id: conversationId } }
    );

    res.json({
      success: true,
      data: {
        id: chatMessage.id,
        conversationId: chatMessage.conversationId,
        senderId: chatMessage.senderId,
        senderType: chatMessage.senderType,
        message: chatMessage.message,
        read: chatMessage.read,
        createdAt: chatMessage.created_at
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const { senderType } = req.body; // 'user' or 'member' - mark opposite type as read

    const oppositeType = senderType === 'user' ? 'member' : 'user';

    await ChatMessage.update(
      { read: true },
      {
        where: {
          conversationId,
          senderType: oppositeType,
          read: false
        }
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

// Get all conversations for a member (doctor/dietitian)
const getMemberConversations = async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);

    const conversations = await ChatConversation.findAll({
      where: { memberId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['lastMessageAt', 'DESC']]
    });

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await ChatMessage.count({
          where: {
            conversationId: conv.id,
            senderType: 'user',
            read: false
          }
        });

        return {
          id: conv.id,
          userId: conv.userId,
          user: {
            id: conv.user ? conv.user.id : 0,
            name: conv.user ? `${conv.user.firstName} ${conv.user.lastName}` : 'Unknown User',
            email: conv.user ? conv.user.email : ''
          },
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: conversationsWithUnread
    });
  } catch (error) {
    console.error('Get member conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message
    });
  }
};

// Get unread count for a user
const getUnreadCount = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const conversations = await ChatConversation.findAll({
      where: { userId }
    });

    const conversationIds = conversations.map(c => c.id);

    const unreadCount = await ChatMessage.count({
      where: {
        conversationId: { [Op.in]: conversationIds },
        senderType: 'member',
        read: false
      }
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

module.exports = {
  getUserDietitianChat,
  getMessages,
  sendMessage,
  markAsRead,
  getMemberConversations,
  getUnreadCount
};

