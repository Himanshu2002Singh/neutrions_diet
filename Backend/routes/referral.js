const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { auth, authenticateAdmin } = require('../middleware/auth');
const { User, Referral } = require('../models');
const crypto = require('crypto');

// Helper function to generate unique referral code
const generateUniqueReferralCode = async () => {
  const length = 8;
  let code;
  let exists = true;
  
  while (exists) {
    code = 'REF' + crypto.randomBytes(length).toString('hex').substring(0, length).toUpperCase();
    const existingUser = await User.findOne({ where: { referralCode: code } });
    const existingReferral = await Referral.findOne({ where: { referralCode: code } });
    exists = existingUser || existingReferral;
  }
  
  return code;
};

/**
 * Validation middleware
 */
const validateReferralCode = [
  body('referralCode')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Referral code must be between 6 and 20 characters')
];

const validateUserId = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a valid integer')
];

const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

// POST /api/referral/generate - Generate a referral code for the current user
router.post('/generate', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If user already has a referral code, return it
    if (user.referralCode) {
      return res.json({
        success: true,
        message: 'You already have a referral code',
        data: {
          referralCode: user.referralCode
        }
      });
    }
    
    // Generate a new unique referral code
    const referralCode = await generateUniqueReferralCode();
    
    // Save the referral code to the user
    user.referralCode = referralCode;
    await user.save();
    
    // Also create a referral record for tracking
    await Referral.create({
      referralCode,
      referrerUserId: userId,
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      message: 'Referral code generated successfully',
      data: {
        referralCode
      }
    });
    
  } catch (error) {
    console.error('Generate referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate referral code',
      error: error.message
    });
  }
});

// GET /api/referral/my-code - Get the current user's referral code
router.get('/my-code', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'referralCode']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink: user.referralCode ? `https://www.nutreazy.in/?ref=${user.referralCode}` : null
      }
    });
    
  } catch (error) {
    console.error('Get referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral code',
      error: error.message
    });
  }
});

// POST /api/referral/apply - Apply a referral code during registration
router.post('/apply', auth, [...validateReferralCode, ...validateUserId], async (req, res) => {
  try {
    const { referralCode, userId: referredUserId } = req.body;
    
    if (!referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required'
      });
    }
    
    // Find the referrer by referral code
    const referrer = await User.findOne({
      where: { referralCode: referralCode.toUpperCase() }
    });
    
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }
    
    // Update the referred user
    const referredUser = await User.findByPk(referredUserId);
    
    if (!referredUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent self-referral
    if (referrer.id === referredUser.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot refer yourself'
      });
    }
    
    // Check if user was already referred
    if (referredUser.referredByUserId) {
      return res.status(400).json({
        success: false,
        message: 'This account has already been referred'
      });
    }
    
    // Update the referred user
    referredUser.referredByUserId = referrer.id;
    await referredUser.save();
    
    // Create/update the referral record
    let referral = await Referral.findOne({
      where: {
        referralCode: referralCode.toUpperCase(),
        referredUserId: null
      }
    });
    
    if (!referral) {
      // Create new referral record
      referral = await Referral.create({
        referralCode: referralCode.toUpperCase(),
        referrerUserId: referrer.id,
        referredUserId: referredUser.id,
        status: 'completed',
        referredAt: new Date()
      });
    } else {
      // Update existing referral record
      referral.referredUserId = referredUser.id;
      referral.status = 'completed';
      referral.referredAt = new Date();
      await referral.save();
    }
    
    res.json({
      success: true,
      message: 'Referral code applied successfully'
    });
    
  } catch (error) {
    console.error('Apply referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply referral code',
      error: error.message
    });
  }
});

// GET /api/referral/my-referrals - Get list of users referred by the current user
router.get('/my-referrals', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const referrals = await Referral.findAll({
      where: { referrerUserId: userId },
      order: [['created_at', 'DESC']]
    });
    
    // Get referred user details
    const referredUsers = await Promise.all(referrals.map(async (ref) => {
      let referredUser = null;
      if (ref.referredUserId) {
        referredUser = await User.findByPk(ref.referredUserId, {
          attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt', 'isActive']
        });
      }
      
      return {
        id: ref.id,
        referralCode: ref.referralCode,
        status: ref.status,
        referredAt: ref.referredAt,
        joinedAt: referredUser ? referredUser.createdAt : null,
        rewardStatus: ref.status === 'completed' ? 'eligible' : 'pending',
        referredUser: referredUser ? {
          id: referredUser.id,
          name: `${referredUser.firstName} ${referredUser.lastName}`,
          email: referredUser.email,
          isActive: referredUser.isActive
        } : null
      };
    }));
    
    const completedReferrals = referrals.filter(r => r.status === 'completed').length;
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
    
    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink: user.referralCode ? `https://www.nutreazy.in/?ref=${user.referralCode}` : null,
        totalReferrals: referrals.length,
        completedReferrals,
        pendingReferrals,
        referredUsers
      }
    });
    
  } catch (error) {
    console.error('Get user referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referrals',
      error: error.message
    });
  }
});

// GET /api/referral/stats - Get referral statistics for the current user
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const totalReferrals = await Referral.count({
      where: { referrerUserId: userId }
    });
    
    const completedReferrals = await Referral.count({
      where: { 
        referrerUserId: userId,
        status: 'completed'
      }
    });
    
    const pendingReferrals = await Referral.count({
      where: { 
        referrerUserId: userId,
        status: 'pending'
      }
    });
    
    const cancelledReferrals = await Referral.count({
      where: { 
        referrerUserId: userId,
        status: 'cancelled'
      }
    });
    
    res.json({
      success: true,
      data: {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        cancelledReferrals
      }
    });
    
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral statistics',
      error: error.message
    });
  }
});

/**
 * Admin Referral Routes (require authentication)
 */

// GET /api/referral/admin/all - Get all referrals
router.get('/admin/all',  [...validatePagination], async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    const { count, rows: referrals } = await Referral.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'referrer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'referredUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: referrals,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('Get all referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referrals',
      error: error.message
    });
  }
});

// GET /api/referral/admin/stats - Get referral statistics
router.get('/admin/stats',  async (req, res) => {
  try {
    const totalReferrals = await Referral.count();
    const completedReferrals = await Referral.count({ where: { status: 'completed' } });
    const pendingReferrals = await Referral.count({ where: { status: 'pending' } });
    const cancelledReferrals = await Referral.count({ where: { status: 'cancelled' } });
    
    // Get unique users who have referred others
    const uniqueReferrers = await Referral.findAll({
      attributes: [
        [require('sequelize').fn('DISTINCT', require('sequelize').col('referrer_user_id')), 'referrerUserId']
      ],
      where: { referrerUserId: { [require('sequelize').Op.ne]: null } },
      group: ['referrer_user_id']
    });
    
    // Get total referred users count
    const totalReferredUsers = await User.count({
      where: { referredByUserId: { [require('sequelize').Op.ne]: null } }
    });
    
    res.json({
      success: true,
      data: {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        cancelledReferrals,
        uniqueReferrers: uniqueReferrers.length,
        totalReferredUsers
      }
    });
    
  } catch (error) {
    console.error('Get all referral stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral statistics',
      error: error.message
    });
  }
});

// GET /api/referral/admin/user/:userId - Get referrals for a specific user
router.get('/admin/user/:userId', auth, [
  param('userId').isInt({ min: 1 }).withMessage('User ID must be a valid integer')
], async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'referralCode']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get referrals given by this user
    const referralsGiven = await Referral.findAll({
      where: { referrerUserId: userId },
      order: [['created_at', 'DESC']]
    });
    
    // Count referrals received by this user
    const referralsReceivedCount = await User.count({
      where: { referredByUserId: userId }
    });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          referralCode: user.referralCode
        },
        referralCount: referralsGiven.length,
        referredUsersCount: referralsReceivedCount,
        referrals: referralsGiven.map(ref => ({
          id: ref.id,
          referralCode: ref.referralCode,
          status: ref.status,
          referredAt: ref.referredAt,
          createdAt: ref.created_at
        }))
      }
    });
    
  } catch (error) {
    console.error('Get user referrals by admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user referrals',
      error: error.message
    });
  }
});

module.exports = router;

