const healthService = require('../services/HealthService');
const { validationResult } = require('express-validator');

class HealthController {
  /**
   * Submit health form and generate complete health profile
   * POST /api/health/submit
   */
  async submitHealthForm(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { userId } = req.params;
      const formData = req.body;

      // Submit health form
      const result = await healthService.submitHealthForm(formData, parseInt(userId));

      res.status(201).json({
        success: true,
        message: 'Health profile created successfully',
        data: result
      });

    } catch (error) {
      console.error('Health form submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit health form',
        error: error.message
      });
    }
  }

  /**
   * Get user's current health profile
   * GET /api/health/profile/:userId
   */
  async getCurrentHealthProfile(req, res) {
    try {
      const { userId } = req.params;

      const healthProfile = await healthService.getCurrentHealthProfile(parseInt(userId));

      if (!healthProfile) {
        return res.status(404).json({
          success: false,
          message: 'No health profile found for this user'
        });
      }

      res.status(200).json({
        success: true,
        data: healthProfile
      });

    } catch (error) {
      console.error('Get health profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get health profile',
        error: error.message
      });
    }
  }

  /**
   * Get user's health profile history
   * GET /api/health/history/:userId
   */
  async getHealthProfileHistory(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 10 } = req.query;

      const profiles = await healthService.getHealthProfileHistory(
        parseInt(userId), 
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: profiles,
        pagination: {
          limit: parseInt(limit),
          count: profiles.length
        }
      });

    } catch (error) {
      console.error('Get health profile history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get health profile history',
        error: error.message
      });
    }
  }

  /**
   * Calculate BMI only (for real-time calculations)
   * POST /api/bmi/calculate
   */
  async calculateBMI(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const formData = req.body;
      const calculation = await healthService.calculateBMIOnly(formData);

      res.status(200).json({
        success: true,
        data: calculation
      });

    } catch (error) {
      console.error('BMI calculation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate BMI',
        error: error.message
      });
    }
  }

  /**
   * Get BMI categories and recommendations
   * GET /api/bmi/categories
   */
  async getBMICategories(req, res) {
    try {
      const { calculateAllHealthMetrics, BMI_CATEGORIES } = require('../services/healthCalculations');

      res.status(200).json({
        success: true,
        data: {
          categories: BMI_CATEGORIES,
          calculationFunction: 'calculateAllHealthMetrics'
        }
      });

    } catch (error) {
      console.error('Get BMI categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get BMI categories',
        error: error.message
      });
    }
  }

  /**
   * Get diet recommendations
   * POST /api/diet/generate
   */
  async generateDietRecommendation(req, res) {
    try {
      const { bmiCalculationId } = req.params;

      // This would typically fetch the BMI calculation and generate new recommendations
      // For now, return a simple response
      res.status(200).json({
        success: true,
        message: 'Diet recommendation generation endpoint',
        data: {
          bmiCalculationId,
          status: 'Feature to be implemented'
        }
      });

    } catch (error) {
      console.error('Generate diet recommendation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate diet recommendation',
        error: error.message
      });
    }
  }

  /**
   * Get all diet recommendations for a user
   * GET /api/diet/recommendations/:userId
   */
  async getDietRecommendations(req, res) {
    try {
      const { userId } = req.params;
      const { DietRecommendation } = require('../models');

      const recommendations = await DietRecommendation.findAll({
        where: { userId },
        include: [
          {
            model: require('../models/HealthProfile'),
            as: 'healthProfile'
          },
          {
            model: require('../models/BMICalculation'),
            as: 'bmiCalculation'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: recommendations
      });

    } catch (error) {
      console.error('Get diet recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get diet recommendations',
        error: error.message
      });
    }
  }

  /**
   * Get all users with their health profiles for admin dashboard
   * GET /api/health/admin/users-with-profiles
   */
  async getUsersWithHealthProfiles(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const page = parseInt(offset) / parseInt(limit) + 1 || 1;

      const [users, totalCount] = await Promise.all([
        healthService.getUsersWithHealthProfiles(parseInt(limit), parseInt(offset)),
        healthService.getUsersWithHealthProfilesCount()
      ]);

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page,
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Get users with health profiles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users with health profiles',
        error: error.message
      });
    }
  }

  /**
   * Get a specific user's health profile details for admin
   * GET /api/health/admin/user/:userId/profile
   */
  async getUserHealthProfile(req, res) {
    try {
      const { userId } = req.params;

      const healthProfile = await healthService.getCurrentHealthProfile(parseInt(userId));

      if (!healthProfile) {
        return res.status(404).json({
          success: false,
          message: 'No health profile found for this user'
        });
      }

      // Get user information
      const { User } = require('../models');
      const user = await User.findByPk(userId, {
        attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'createdAt']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Combine user and health data
      const userHealthData = {
        id: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone || 'Not provided',
        age: healthProfile.age || 'N/A',
        plan: 'Standard Plan', // This could come from subscription data
        amount: '$39.99/month', // This could come from subscription data
        createdAt: user.createdAt,
        healthDetails: {
          medicalIssues: healthProfile.medicalConditions?.join(', ') || 'None specified',
          weight: healthProfile.weight,
          height: healthProfile.height,
          age: healthProfile.age,
          gender: healthProfile.gender,
          activityLevel: healthProfile.activityLevel,
          medicalConditions: healthProfile.medicalConditions?.join(', ') || 'None',
          allergies: 'Not specified', // This field doesn't exist in current model
          medications: 'Not specified', // This field doesn't exist in current model
          dietaryRestrictions: healthProfile.goals?.join(', ') || 'None specified',
          bmi: healthProfile.bmiCalculations?.[0]?.bmi || 0,
          bmiCategory: healthProfile.bmiCalculations?.[0]?.category || 'Not calculated',
          dailyCalories: healthProfile.bmiCalculations?.[0]?.dailyCalories || 0,
          dietRecommendations: healthProfile.dietRecommendations?.[0] ? {
            protein: healthProfile.dietRecommendations[0].protein,
            carbs: healthProfile.dietRecommendations[0].carbs,
            fats: healthProfile.dietRecommendations[0].fats,
            meals: healthProfile.dietRecommendations[0].meals,
            foods: healthProfile.dietRecommendations[0].foods
          } : null
        }
      };

      res.status(200).json({
        success: true,
        data: userHealthData
      });

    } catch (error) {
      console.error('Get user health profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user health profile',
        error: error.message
      });
    }
  }

  /**
   * Get users with health profiles but no assigned dietician
   * GET /api/health/admin/unassigned-users
   */
  async getUnassignedUsers(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const page = parseInt(offset) / parseInt(limit) + 1 || 1;

      const [users, totalCount] = await Promise.all([
        healthService.getUnassignedUsers(parseInt(limit), parseInt(offset)),
        healthService.getUnassignedUsersCount()
      ]);

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page,
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Get unassigned users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unassigned users',
        error: error.message
      });
    }
  }

  /**
   * Assign a dietician to a user
   * POST /api/health/admin/assign-dietician
   */
  async assignDieticianToUser(req, res) {
    try {
      const { userId, dieticianId } = req.body;

      if (!userId || !dieticianId) {
        return res.status(400).json({
          success: false,
          message: 'userId and dieticianId are required'
        });
      }

      const result = await healthService.assignDieticianToUser(
        parseInt(userId),
        parseInt(dieticianId)
      );

      res.status(200).json(result);

    } catch (error) {
      console.error('Assign dietician error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to assign dietician',
        error: error.message
      });
    }
  }

  /**
   * Remove assignment (unassign dietician from user)
   * POST /api/health/admin/remove-assignment
   */
  async removeUserAssignment(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      const result = await healthService.removeUserAssignment(parseInt(userId));

      res.status(200).json(result);

    } catch (error) {
      console.error('Remove assignment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to remove assignment',
        error: error.message
      });
    }
  }

/**
   * Get user's assignment status
   * GET /api/health/admin/user/:userId/assignment
   */
  async getUserAssignmentStatus(req, res) {
    try {
      const { userId } = req.params;

      const result = await healthService.getUserAssignmentStatus(parseInt(userId));

      res.status(200).json(result);

    } catch (error) {
      console.error('Get assignment status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get assignment status',
        error: error.message
      });
    }
  }

  /**
   * Get users assigned to the logged-in doctor/dietician
   * GET /api/health/doctor/assigned-users
   */
  async getDoctorAssignedUsers(req, res) {
    try {
      // Get the logged-in doctor/dietician's ID from the auth middleware
      // The admin middleware sets req.admin with the authenticated user's info
      if (!req.admin || !req.admin.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Doctor authentication required'
        });
      }

      const doctorId = req.admin.id;

      const result = await healthService.getDoctorAssignedUsers(doctorId);

      res.status(200).json(result);

    } catch (error) {
      console.error('Get doctor assigned users error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get assigned users',
        error: error.message
      });
    }
  }

  /**
   * Get a specific user's health profile for the assigned doctor
   * GET /api/health/doctor/user/:userId/health-profile
   */
  async getUserHealthProfileForDoctor(req, res) {
    try {
      const { userId } = req.params;

      // Get the logged-in doctor/dietician's ID from the auth middleware
      if (!req.admin || !req.admin.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Doctor authentication required'
        });
      }

      const doctorId = req.admin.id;

      const result = await healthService.getUserHealthProfileForDoctor(
        parseInt(userId),
        doctorId
      );

      res.status(200).json(result);

    } catch (error) {
      console.error('Get user health profile for doctor error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user health profile',
        error: error.message
      });
    }
  }
}

module.exports = new HealthController();

