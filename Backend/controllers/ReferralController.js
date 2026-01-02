const crypto = require('crypto');
const { User, Referral } = require('../models');

// Generate a unique referral code
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
 * Generate or get referral code for a user
 * POST /api/referral/generate
 */
const generateReferralCode = async (req, res) => {
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
};

/**
 * Get user's referral code
 * GET /api/referral/my-code
 */
const getUserReferralCode = async (req, res) => {
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
        userName: `${user.firstName} ${user.lastName}`
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
};

/**
 * Apply a referral code during registration
 * POST /api/referral/apply
 */
const applyReferralCode = async (req, res) => {
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
      message: 'Referral code applied successfully',
      data: {
        referrerName: `${referrer.firstName} ${referrer.lastName}`
      }
    });
    
  } catch (error) {
    console.error('Apply referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply referral code',
      error: error.message
    });
  }
};

/**
 * Get list of users referred by the current user
 * GET /api/referral/my-referrals
 */
const getUserReferrals = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const referrals = await Referral.findAll({
      where: { referrerUserId: userId },
      include: [{
        model: User,
        as: 'referredUser',
        attributes: ['id', 'firstName', 'lastName', 'email', 'created_at', 'isActive']
      }],
      order: [['created_at', 'DESC']]
    });
    
    const referredUsers = referrals.map(ref => {
      const referredUser = ref.referredUser ? ref.referredUser.toJSON() : null;
      return {
        id: ref.id,
        referralCode: ref.referralCode,
        status: ref.status,
        referredAt: ref.referredAt,
        createdAt: ref.created_at,
        referredUser: referredUser ? {
          id: referredUser.id,
          name: `${referredUser.firstName} ${referredUser.lastName}`,
          email: referredUser.email,
          joinedAt: referredUser.created_at,
          isActive: referredUser.isActive
        } : null
      };
    });
    
    res.json({
      success: true,
      data: referredUsers
    });
    
  } catch (error) {
    console.error('Get user referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referrals',
      error: error.message
    });
  }
};

/**
 * Get referral statistics for the current user
 * GET /api/referral/stats
 */
const getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user details
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'referralCode']
    });
    
    // Count total referrals
    const totalReferrals = await Referral.count({
      where: { referrerUserId: userId }
    });
    
    // Count completed referrals
    const completedReferrals = await Referral.count({
      where: { 
        referrerUserId: userId,
        status: 'completed'
      }
    });
    
    // Count pending referrals
    const pendingReferrals = await Referral.count({
      where: { 
        referrerUserId: userId,
        status: 'pending'
      }
    });
    
    // Get referred users count (users who used this user's code)
    const referredUsersCount = await User.count({
      where: { referredByUserId: userId }
    });
    
    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        userName: `${user.firstName} ${user.lastName}`,
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        referredUsersCount,
        referralLink: `https://neutrion.com?ref=${user.referralCode}`
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
};

/**
 * Admin: Get all referrals (for admin dashboard)
 * GET /api/referral/admin/all
 */
const getAllReferrals = async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, search } = req.query;
    
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
    
    const transformedReferrals = referrals.map(ref => {
      const referrer = ref.referrer ? ref.referrer.toJSON() : null;
      const referredUser = ref.referredUser ? ref.referredUser.toJSON() : null;
      
      return {
        id: ref.id,
        referralCode: ref.referralCode,
        status: ref.status,
        referredAt: ref.referredAt,
        createdAt: ref.created_at,
        referrer: referrer ? {
          id: referrer.id,
          name: `${referrer.firstName} ${referrer.lastName}`,
          email: referrer.email
        } : null,
        referredUser: referredUser ? {
          id: referredUser.id,
          name: `${referredUser.firstName} ${referredUser.lastName}`,
          email: referredUser.email
        } : null
      };
    });
    
    res.json({
      success: true,
      data: transformedReferrals,
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
};

/**
 * Admin: Get referral statistics for all users
 * GET /api/referral/admin/stats
 */
const getAllReferralStats = async (req, res) => {
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
};

/**
 * Admin: Get referrals for a specific user
 * GET /api/referral/admin/user/:userId
 */
const getUserReferralsByAdmin = async (req, res) => {
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
      include: [{
        model: User,
        as: 'referredUser',
        attributes: ['id', 'firstName', 'lastName', 'email', 'created_at', 'isActive']
      }],
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
          createdAt: ref.created_at,
          referredUser: ref.referredUser ? {
            id: ref.referredUser.id,
            name: `${ref.referredUser.firstName} ${ref.referredUser.lastName}`,
            email: ref.referredUser.email,
            joinedAt: ref.referredUser.created_at,
            isActive: ref.referredUser.isActive
          } : null
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
};

module.exports = {
  generateReferralCode,
  getUserReferralCode,
  applyReferralCode,
  getUserReferrals,
  getReferralStats,
  getAllReferrals,
  getAllReferralStats,
  getUserReferralsByAdmin,
  generateUniqueReferralCode
};

