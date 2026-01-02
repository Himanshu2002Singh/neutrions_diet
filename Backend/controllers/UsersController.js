// Helper function to determine subscription type
const getSubscriptionType = (userData) => {
  // For now, we'll randomly assign based on user ID for demo
  // In production, this would be based on actual subscription data
  const subscriptionTypes = ['Free', 'Basic', 'Standard', 'Premium'];
  const index = userData.id % subscriptionTypes.length;
  return subscriptionTypes[index];
};

const { User, Referral } = require('../models');
const { Op } = require('sequelize');

class UsersController {
  /**
   * Get all users (regular users with role 'user')
   * GET /api/users
   */
  async getAllUsers(req, res) {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        search,
        status,
        subscription
      } = req.query;

      // Build where clause for regular users
      const whereClause = {
        role: 'user' // Only fetch regular users
      };

      // Add search filter
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        attributes: [
          'id', 
          'firstName', 
          'lastName', 
          'email', 
          'phone', 
          'role', 
          'isActive', 
          'created_at',
          'lastLogin'
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      // Transform data to match frontend expectations
      const transformedUsers = await Promise.all(users.map(async user => {
        const userData = user.toJSON();
        
        // Get referral count for this user
        const referralCount = await Referral.count({
          where: { referrerUserId: userData.id, status: 'completed' }
        });
        
        return {
          id: userData.id,
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          phone: userData.phone || '',
          joinDate: userData.created_at,
          status: userData.isActive ? 'active' : 'inactive',
          subscription: getSubscriptionType(userData),
          lastLogin: userData.lastLogin,
          referralCount: referralCount,
          referralCode: userData.referralCode || null
        };
      }));

      res.status(200).json({
        success: true,
        data: transformedUsers,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }
  }

/**
   * Get user statistics
   * GET /api/users/stats
   */
  async getUserStats(req, res) {
    try {
      const { count: totalUsers } = await User.findAndCountAll({
        where: { role: 'user' }
      });

      const { count: activeUsers } = await User.findAndCountAll({
        where: { role: 'user', isActive: true }
      });

      const { count: inactiveUsers } = await User.findAndCountAll({
        where: { role: 'user', isActive: false }
      });

      // Get new users in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newUsers } = await User.findAndCountAll({
        where: {
          role: 'user',
          created_at: { [Op.gte]: thirtyDaysAgo }
        }
      });

      res.status(200).json({
        success: true,
        data: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          newThisMonth: newUsers
        }
      });

    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics',
        error: error.message
      });
    }
  }

  /**
   * Get dashboard statistics for admin dashboard
   * GET /api/users/dashboard/stats
   */
  async getDashboardStats(req, res) {
    try {
      const { User, Admin, HealthProfile, Referral } = require('../models');
      const { Op } = require('sequelize');
      
      // Total Users (role = 'user')
      const { count: totalUsers } = await User.findAndCountAll({
        where: { role: 'user' }
      });

      // Active Users
      const { count: activeUsers } = await User.findAndCountAll({
        where: { role: 'user', isActive: true }
      });

      // Total Dietitians (members with category = 'dietitian')
      const { count: totalDietitians } = await Admin.findAndCountAll({
        where: { role: 'member', category: 'dietitian', isActive: true }
      });

      // Users with completed health profiles
      const { count: usersWithHealthProfiles } = await HealthProfile.count({
        where: { isCurrent: true }
      });

      // Total Referrals
      const { count: totalReferrals } = await Referral.count();

      // Completed Referrals
      const { count: completedReferrals } = await Referral.count({
        where: { status: 'completed' }
      });

      // Pending Referrals
      const { count: pendingReferrals } = await Referral.count({
        where: { status: 'pending' }
      });

      // Get new users in last 7 days for "newThisWeek"
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: newThisWeek } = await User.findAndCountAll({
        where: {
          role: 'user',
          created_at: { [Op.gte]: sevenDaysAgo }
        }
      });

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          totalDietitians,
          usersWithHealthProfiles,
          totalReferrals,
          completedReferrals,
          pendingReferrals,
          newThisWeek
        }
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: error.message
      });
    }
  }

  /**
   * Get a specific user by ID
   * GET /api/users/:id
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findOne({
        where: { 
          id: parseInt(id),
          role: 'user'
        },
        attributes: [
          'id', 
          'firstName', 
          'lastName', 
          'email', 
          'phone', 
          'role', 
          'isActive', 
          'created_at',
          'lastLogin',
          'dateOfBirth',
          'googleAvatar'
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userData = user.toJSON();
      
      res.status(200).json({
        success: true,
        data: {
          id: userData.id,
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          phone: userData.phone || '',
          joinDate: userData.created_at,
          lastLogin: userData.lastLogin,
          dateOfBirth: userData.dateOfBirth,
          status: userData.isActive ? 'active' : 'inactive',
          subscription: getSubscriptionType(userData),
          avatar: userData.googleAvatar || null,
          isGoogleUser: userData.isGoogleUser || false
        }
      });

    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error.message
      });
    }
  }

  /**
   * Update a user
   * PUT /api/users/:id
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, phone, isActive } = req.body;

      const user = await User.findOne({
        where: { 
          id: parseInt(id),
          role: 'user'
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update allowed fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (typeof isActive === 'boolean') user.isActive = isActive;

      await user.save();

      const userData = user.toJSON();
      
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: {
          id: userData.id,
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          phone: userData.phone || '',
          status: userData.isActive ? 'active' : 'inactive'
        }
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message
      });
    }
  }

  /**
   * Delete a user (soft delete)
   * DELETE /api/users/:id
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findOne({
        where: { 
          id: parseInt(id),
          role: 'user'
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Soft delete by setting isActive to false
      await user.update({ isActive: false });

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  }
}

module.exports = new UsersController();

