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

/**
   * Upload a diet file for a user
   * POST /api/health/doctor/upload-diet-file
   */
  async uploadDietFile(req, res) {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please upload a PDF file.'
        });
      }

      // Get the logged-in doctor/dietician's ID from the auth middleware
      if (!req.admin || !req.admin.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Doctor authentication required'
        });
      }

      const doctorId = req.admin.id;
      const { userId, description } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // Import the DietFile model
      const DietFile = require('../models/DietFile');

      // Save file info to database
      const dietFile = await DietFile.create({
        userId: parseInt(userId),
        doctorId: doctorId,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        description: description || null
      });

      res.status(201).json({
        success: true,
        message: 'Diet file uploaded successfully',
        data: {
          id: dietFile.id,
          userId: dietFile.userId,
          fileName: dietFile.fileName,
          originalName: dietFile.originalName,
          description: dietFile.description,
          createdAt: dietFile.createdAt
        }
      });

    } catch (error) {
      console.error('Upload diet file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload diet file',
        error: error.message
      });
    }
  }

  /**
   * Get all diet files for a user
   * GET /api/health/doctor/user/:userId/diet-files
   */
  async getUserDietFiles(req, res) {
    try {
      // Get the logged-in doctor/dietician's ID from the auth middleware
      if (!req.admin || !req.admin.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Doctor authentication required'
        });
      }

      const { userId } = req.params;

      // Import the DietFile model
      const DietFile = require('../models/DietFile');

      // Get all diet files for the user, ordered by creation date (newest first)
      const dietFiles = await DietFile.findAll({
        where: {
          userId: parseInt(userId),
          isActive: true
        },
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: dietFiles
      });

    } catch (error) {
      console.error('Get user diet files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get diet files',
        error: error.message
      });
    }
  }

  /**
   * Download a diet file
   * GET /api/health/doctor/diet-files/:fileId/download
   */
  async downloadDietFile(req, res) {
    try {
      // Get the logged-in doctor/dietician's ID from the auth middleware
      if (!req.admin || !req.admin.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Doctor authentication required'
        });
      }

      const { fileId } = req.params;

      // Import the DietFile model
      const DietFile = require('../models/DietFile');

      // Find the file
      const dietFile = await DietFile.findByPk(parseInt(fileId));

      if (!dietFile) {
        return res.status(404).json({
          success: false,
          message: 'Diet file not found'
        });
      }

      if (!dietFile.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Diet file has been deleted'
        });
      }

      // Check if file exists on disk
      const fs = require('fs');
      if (!fs.existsSync(dietFile.filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }

      // Send the file
      res.download(dietFile.filePath, dietFile.originalName);

    } catch (error) {
      console.error('Download diet file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download diet file',
        error: error.message
      });
    }
  }

  /**
   * Delete a diet file
   * DELETE /api/health/doctor/diet-files/:fileId
   */
  async deleteDietFile(req, res) {
    try {
      // Get the logged-in doctor/dietician's ID from the auth middleware
      if (!req.admin || !req.admin.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Doctor authentication required'
        });
      }

      const { fileId } = req.params;

      // Import the DietFile model
      const DietFile = require('../models/DietFile');

      // Find the file
      const dietFile = await DietFile.findByPk(parseInt(fileId));

      if (!dietFile) {
        return res.status(404).json({
          success: false,
          message: 'Diet file not found'
        });
      }

      // Soft delete - set isActive to false
      dietFile.isActive = false;
      await dietFile.save();

      // Optionally delete the file from disk
      const fs = require('fs');
      if (fs.existsSync(dietFile.filePath)) {
        try {
          fs.unlinkSync(dietFile.filePath);
        } catch (err) {
          console.warn('Could not delete file from disk:', err);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Diet file deleted successfully'
      });

    } catch (error) {
      console.error('Delete diet file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete diet file',
        error: error.message
      });
    }
  }

  /**
   * Get user diet report - shows users with assigned doctors and diet upload status
   * GET /api/health/admin/user-diet-report
   */
  async getUserDietReport(req, res) {
    try {
      const { limit = 100, offset = 0 } = req.query;
      const page = parseInt(offset) / parseInt(limit) + 1 || 1;

      const result = await healthService.getUserDietReport(
        parseInt(limit),
        parseInt(offset)
      );

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: {
          page,
          limit: parseInt(limit),
          total: result.totalCount,
          totalPages: Math.ceil(result.totalCount / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Get user diet report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user diet report',
        error: error.message
      });
    }
  }

/**
   * Save user's daily meal activity
   * POST /api/health/meal-activity/save
   */
  async saveMealActivity(req, res) {
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

      const { date, mealType, selectedItems, notes } = req.body;

      // Get user ID from auth (assuming user is authenticated)
      // For now, we'll use the userId from the body or require authentication
      let userId = req.body.userId;
      
      if (!userId) {
        // Try to get from authenticated user
        userId = req.user?.id;
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      // Validate date: only allow current date and previous 7 days
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (selectedDate < sevenDaysAgo) {
        return res.status(400).json({
          success: false,
          message: 'Cannot mark meals for dates older than 7 days. Only current and previous 7 days are allowed.'
        });
      }

      // Import the DailyMealActivity model
      const { DailyMealActivity } = require('../models');

      // Check if there's already an activity for this user, date, and meal type
      let existingActivity = await DailyMealActivity.findOne({
        where: {
          userId,
          date,
          mealType
        }
      });

      if (existingActivity) {
        // Update existing activity
        existingActivity.selectedItems = selectedItems;
        existingActivity.notes = notes || null;
        await existingActivity.save();

        res.status(200).json({
          success: true,
          message: 'Meal activity updated successfully',
          data: {
            id: existingActivity.id,
            userId: existingActivity.userId,
            date: existingActivity.date,
            mealType: existingActivity.mealType,
            selectedItems: existingActivity.selectedItems,
            notes: existingActivity.notes
          }
        });
      } else {
        // Create new activity
        const activity = await DailyMealActivity.create({
          userId,
          date,
          mealType,
          selectedItems,
          notes: notes || null
        });

        res.status(201).json({
          success: true,
          message: 'Meal activity saved successfully',
          data: {
            id: activity.id,
            userId: activity.userId,
            date: activity.date,
            mealType: activity.mealType,
            selectedItems: activity.selectedItems,
            notes: activity.notes
          }
        });
      }

    } catch (error) {
      console.error('Save meal activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save meal activity',
        error: error.message
      });
    }
  }

  /**
   * Get user's meal activity for a specific date
   * GET /api/health/meal-activity/:userId/:date
   */
  async getMealActivityByDate(req, res) {
    try {
      const { userId, date } = req.params;

      // Import the DailyMealActivity model
      const { DailyMealActivity } = require('../models');

      // Get all meal activities for this user and date
      const activities = await DailyMealActivity.findAll({
        where: {
          userId: parseInt(userId),
          date: date
        },
        order: [['createdAt', 'ASC']]
      });

      // Convert to a more convenient format
      const activityByMeal = {};
      activities.forEach(activity => {
        activityByMeal[activity.mealType] = {
          id: activity.id,
          selectedItems: activity.selectedItems,
          notes: activity.notes,
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt
        };
      });

      res.status(200).json({
        success: true,
        data: {
          userId: parseInt(userId),
          date,
          activities: activityByMeal
        }
      });

    } catch (error) {
      console.error('Get meal activity by date error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get meal activity',
        error: error.message
      });
    }
  }

  /**
   * Get user's meal activities for a date range
   * GET /api/health/meal-activity/:userId
   */
  async getMealActivities(req, res) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      // Calculate date range (default: last 7 days)
      let start = startDate;
      let end = endDate;

      if (!start) {
        const endDateObj = end ? new Date(end) : new Date();
        const startDateObj = new Date(endDateObj);
        startDateObj.setDate(startDateObj.getDate() - 7);
        start = startDateObj.toISOString().split('T')[0];
      }

      if (!end) {
        end = new Date().toISOString().split('T')[0];
      }

      // Import the DailyMealActivity model
      const { DailyMealActivity } = require('../models');

      // Get all meal activities for this user in the date range
      const activities = await DailyMealActivity.findAll({
        where: {
          userId: parseInt(userId),
          date: {
            [require('sequelize').Op.between]: [start, end]
          }
        },
        order: [['date', 'DESC'], ['mealType', 'ASC']]
      });

      // Group by date
      const activitiesByDate = {};
      activities.forEach(activity => {
        if (!activitiesByDate[activity.date]) {
          activitiesByDate[activity.date] = {};
        }
        activitiesByDate[activity.date][activity.mealType] = {
          id: activity.id,
          selectedItems: activity.selectedItems,
          notes: activity.notes,
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt
        };
      });

      res.status(200).json({
        success: true,
        data: {
          userId: parseInt(userId),
          startDate: start,
          endDate: end,
          activitiesByDate
        }
      });

    } catch (error) {
      console.error('Get meal activities error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get meal activities',
        error: error.message
      });
    }
  }

  /**
   * Get all diet files/menu items
   * GET /api/diet/files
   */
  async getDietFiles(req, res) {
    try {
      const { category } = req.query;

      // Sample diet files data - in production this would come from a database
      const sampleDietFiles = [
        {
          id: 1,
          name: 'Grilled Chicken Salad',
          description: 'Healthy grilled chicken with mixed greens and vegetables',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop',
          category: 'Lunch',
          calories: 350,
          carbs: 15,
          protein: 40,
          fats: 12,
          difficulty: 'Easy',
          healthScore: 92,
          prepTime: 15,
          mealType: 'Lunch',
          isFeatured: false
        },
        {
          id: 2,
          name: 'Oatmeal with Berries',
          description: 'Warm oatmeal topped with fresh berries and honey',
          imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=200&h=150&fit=crop',
          category: 'Breakfast',
          calories: 280,
          carbs: 45,
          protein: 10,
          fats: 5,
          difficulty: 'Easy',
          healthScore: 88,
          prepTime: 10,
          mealType: 'Breakfast',
          isFeatured: true
        },
        {
          id: 3,
          name: 'Salmon with Vegetables',
          description: 'Baked salmon with roasted seasonal vegetables',
          imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=150&fit=crop',
          category: 'Dinner',
          calories: 420,
          carbs: 20,
          protein: 45,
          fats: 18,
          difficulty: 'Medium',
          healthScore: 95,
          prepTime: 25,
          mealType: 'Dinner',
          isFeatured: true
        },
        {
          id: 4,
          name: 'Greek Yogurt Parfait',
          description: 'Greek yogurt with granola and fresh fruits',
          imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=150&fit=crop',
          category: 'Snack',
          calories: 220,
          carbs: 30,
          protein: 15,
          fats: 6,
          difficulty: 'Easy',
          healthScore: 85,
          prepTime: 5,
          mealType: 'Snack',
          isFeatured: false
        },
        {
          id: 5,
          name: 'Vegetable Stir Fry',
          description: 'Fresh vegetables stir-fried with tofu in a savory sauce',
          imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=150&fit=crop',
          category: 'Lunch',
          calories: 320,
          carbs: 35,
          protein: 18,
          fats: 10,
          difficulty: 'Easy',
          healthScore: 90,
          prepTime: 15,
          mealType: 'Lunch',
          isFeatured: false
        },
        {
          id: 6,
          name: 'Avocado Toast',
          description: 'Whole grain toast topped with fresh avocado and egg',
          imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414395d8?w=200&h=150&fit=crop',
          category: 'Breakfast',
          calories: 350,
          carbs: 28,
          protein: 14,
          fats: 20,
          difficulty: 'Easy',
          healthScore: 87,
          prepTime: 10,
          mealType: 'Breakfast',
          isFeatured: false
        },
        {
          id: 7,
          name: 'Mixed Nuts Bowl',
          description: 'A mix of almonds, walnuts, and cashews',
          imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=150&fit=crop',
          category: 'Snack',
          calories: 180,
          carbs: 8,
          protein: 5,
          fats: 16,
          difficulty: 'Easy',
          healthScore: 82,
          prepTime: 1,
          mealType: 'Snack',
          isFeatured: false
        },
        {
          id: 8,
          name: 'Quinoa Bowl',
          description: 'Quinoa with roasted vegetables and hummus',
          imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=200&h=150&fit=crop',
          category: 'Dinner',
          calories: 400,
          carbs: 50,
          protein: 15,
          fats: 14,
          difficulty: 'Medium',
          healthScore: 91,
          prepTime: 20,
          mealType: 'Dinner',
          isFeatured: true
        }
      ];

      // Filter by category if provided
      let filteredFiles = sampleDietFiles;
      if (category) {
        filteredFiles = sampleDietFiles.filter(
          file => file.mealType.toLowerCase() === category.toLowerCase()
        );
      }

      res.status(200).json({
        success: true,
        data: filteredFiles
      });

    } catch (error) {
      console.error('Get diet files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get diet files',
        error: error.message
      });
    }
  }

  /**
   * Get a specific diet file by ID
   * GET /api/diet/files/:id
   */
  async getDietFile(req, res) {
    try {
      const { id } = req.params;

      // Sample diet files data - in production this would come from a database
      const sampleDietFiles = [
        {
          id: 1,
          name: 'Grilled Chicken Salad',
          description: 'Healthy grilled chicken with mixed greens and vegetables',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
          category: 'Lunch',
          calories: 350,
          carbs: 15,
          protein: 40,
          fats: 12,
          difficulty: 'Easy',
          healthScore: 92,
          prepTime: 15,
          mealType: 'Lunch',
          ingredients: ['150g chicken breast', '2 cups mixed greens', '1/2 cup cherry tomatoes', '1/4 cup cucumber', '2 tbsp olive oil', 'Salt and pepper'],
          steps: ['Season chicken with salt and pepper', 'Grill chicken for 6-7 minutes per side', 'Let chicken rest, then slice', 'Arrange greens on plate', 'Top with sliced chicken and vegetables', 'Drizzle with olive oil'],
          isFeatured: false
        },
        {
          id: 2,
          name: 'Oatmeal with Berries',
          description: 'Warm oatmeal topped with fresh berries and honey',
          imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&h=300&fit=crop',
          category: 'Breakfast',
          calories: 280,
          carbs: 45,
          protein: 10,
          fats: 5,
          difficulty: 'Easy',
          healthScore: 88,
          prepTime: 10,
          mealType: 'Breakfast',
          ingredients: ['1/2 cup rolled oats', '1 cup milk', '1/2 cup mixed berries', '1 tbsp honey', '1 tbsp chia seeds'],
          steps: ['Bring milk to a boil', 'Add oats and reduce heat', 'Cook for 5 minutes', 'Transfer to bowl', 'Top with berries, honey, and chia seeds'],
          isFeatured: true
        },
        {
          id: 3,
          name: 'Salmon with Vegetables',
          description: 'Baked salmon with roasted seasonal vegetables',
          imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
          category: 'Dinner',
          calories: 420,
          carbs: 20,
          protein: 45,
          fats: 18,
          difficulty: 'Medium',
          healthScore: 95,
          prepTime: 25,
          mealType: 'Dinner',
          ingredients: ['200g salmon fillet', '1 cup broccoli', '1/2 cup bell peppers', '2 tbsp olive oil', 'Lemon juice', 'Garlic', 'Salt and pepper'],
          steps: ['Preheat oven to 400°F (200°C)', 'Season salmon with salt, pepper, and garlic', 'Cut vegetables into bite-sized pieces', 'Toss vegetables with olive oil', 'Place salmon and vegetables on baking sheet', 'Bake for 20-25 minutes', 'Squeeze lemon juice before serving'],
          isFeatured: true
        }
      ];

      const dietFile = sampleDietFiles.find(f => f.id === parseInt(id));

      if (!dietFile) {
        return res.status(404).json({
          success: false,
          message: 'Diet file not found'
        });
      }

      res.status(200).json({
        success: true,
        data: dietFile
      });

    } catch (error) {
      console.error('Get diet file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get diet file',
        error: error.message
      });
    }
  }

  /**
   * Get featured diet file
   * GET /api/diet/files/featured
   */
  async getFeaturedDietFile(req, res) {
    try {
      // Sample featured diet file - in production this would come from a database
      const featuredFile = {
        id: 3,
        name: 'Salmon with Vegetables',
        description: 'Baked salmon with roasted seasonal vegetables - a perfect balanced meal rich in omega-3s and vitamins',
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
        category: 'Dinner',
        calories: 420,
        carbs: 20,
        protein: 45,
        fats: 18,
        difficulty: 'Medium',
        healthScore: 95,
        prepTime: 25,
        mealType: 'Dinner',
        isFeatured: true
      };

      res.status(200).json({
        success: true,
        data: featuredFile
      });

    } catch (error) {
      console.error('Get featured diet file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get featured diet file',
        error: error.message
      });
    }
  }

  /**
   * Generate Simmi Ji diet plan format
   */
  generateSimmiJiDietPlan(dailyCalories, userName, userAge, userWeight, userHeight, bmiCategory, userId) {
    return {
      userId: userId || 1,
      userName: userName,
      profile: {
        age: userAge,
        weight: userWeight,
        height: userHeight,
        bmiCategory: bmiCategory,
        target: 'Weight loss - Lose 10 kg further'
      },
      nutritionTargets: {
        calories: `${dailyCalories - 200}-${dailyCalories} kcal`,
        protein: '75g',
        fiber: '25-30g',
        fat: '35-40g',
        carbs: '150g'
      },
      dailySchedule: [
        {
          time: '8:00 AM',
          mealType: 'Wake Up',
          title: 'Overnight Soaked Trifala Water',
          description: 'Strain it in the morning and have it empty stomach',
          options: [
            {
              name: 'Trifala Water',
              portion: '1 glass (250ml)',
              imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=150&fit=crop',
              calories: 10,
              notes: 'Overnight soaked'
            }
          ],
          tips: 'Helps with digestion and detoxification'
        },
        {
          time: '10:00 AM',
          mealType: 'Breakfast',
          title: 'Breakfast Options',
          options: [
            {
              name: 'Paneer Stuffed Moong Dal Cheela',
              portion: '1 small piece + low fat curd',
              imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop',
              calories: 280,
              macros: { protein: 15, carbs: 25, fats: 12 }
            },
            {
              name: 'Curd with Fruit and Nuts + Seeds',
              portion: '1 big bowl (350g)',
              imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=150&fit=crop',
              calories: 220,
              macros: { protein: 12, carbs: 30, fats: 6 }
            },
            {
              name: 'Sprouted Moong with Paneer',
              portion: '1 big bowl + 50g paneer',
              imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=200&h=150&fit=crop',
              calories: 250,
              macros: { protein: 18, carbs: 22, fats: 10 }
            },
            {
              name: 'Air Fried Vegetable Cutlet',
              portion: '2 pieces + curd',
              imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop',
              calories: 200,
              macros: { protein: 10, carbs: 28, fats: 6 }
            },
            {
              name: 'Avocado Toast',
              portion: '1 toast + green tea',
              imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef9f85b0c?w=200&h=150&fit=crop',
              calories: 320,
              macros: { protein: 8, carbs: 25, fats: 18 }
            },
            {
              name: 'Vegetable Idli',
              portion: '2 small + sambhar + peanut chutney',
              imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=150&fit=crop',
              calories: 240,
              macros: { protein: 10, carbs: 35, fats: 5 }
            },
            {
              name: 'Apple with Peanut Butter',
              portion: '1 apple + 1 tsp unsweetened peanut butter',
              imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=150&fit=crop',
              calories: 180,
              macros: { protein: 4, carbs: 25, fats: 8 }
            }
          ]
        },
        {
          time: '12:30 PM',
          mealType: 'Mid-Morning',
          title: 'Seasonal Fruit + Seeds',
          options: [
            {
              name: 'Seasonal Fruit + Mixed Seeds',
              portion: '1 medium fruit + 1 tbsp mixed seeds',
              imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=150&fit=crop',
              calories: 120,
              macros: { protein: 3, carbs: 20, fats: 5 }
            },
            {
              name: 'Coconut Water/Buttermilk',
              portion: '1 glass (250ml)',
              imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=200&h=150&fit=crop',
              calories: 60,
              macros: { protein: 1, carbs: 15, fats: 0 }
            }
          ],
          tips: 'Stay hydrated and get natural vitamins'
        },
        {
          time: '2:30 PM',
          mealType: 'Lunch',
          title: 'Lunch Options',
          options: [
            {
              name: 'Moong Dal + Rice',
              portion: '1 cup dal + 1 cup rice + salad',
              imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop',
              calories: 400,
              macros: { protein: 15, carbs: 60, fats: 8 }
            },
            {
              name: 'Quinoa Bowl',
              portion: '1 small bowl with veggies + salad',
              imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=200&h=150&fit=crop',
              calories: 350,
              macros: { protein: 12, carbs: 45, fats: 10 }
            },
            {
              name: 'Paneer Preparation',
              portion: '100g paneer + 1 roti + salad',
              imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop',
              calories: 450,
              macros: { protein: 22, carbs: 35, fats: 20 }
            },
            {
              name: 'Rajma + Rice',
              portion: '150g rajma + rice + salad',
              imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=150&fit=crop',
              calories: 420,
              macros: { protein: 18, carbs: 55, fats: 10 }
            },
            {
              name: 'Kadi + Rice',
              portion: '1 medium bowl kadi + 1 small bowl rice',
              imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=150&fit=crop',
              calories: 380,
              macros: { protein: 14, carbs: 50, fats: 12 }
            },
            {
              name: 'Chapati + Mixed Dal',
              portion: '1 chapati + mixed dal + bhindi + curd',
              imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop',
              calories: 400,
              macros: { protein: 16, carbs: 48, fats: 14 }
            },
            {
              name: 'Matar Makhana + Chapati',
              portion: '1 chapati + salad + raita',
              imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop',
              calories: 360,
              macros: { protein: 14, carbs: 42, fats: 12 }
            },
            {
              name: 'Soya Chunks Curry',
              portion: '1 plate + rice + salad + curd',
              imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=150&fit=crop',
              calories: 380,
              macros: { protein: 25, carbs: 40, fats: 10 }
            },
            {
              name: 'Paneer Pulao',
              portion: '150g + 150g curd + salad',
              imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop',
              calories: 480,
              macros: { protein: 18, carbs: 50, fats: 18 }
            }
          ],
          tips: 'Include curd or raita for probiotics'
        },
        {
          time: '4:00 PM',
          mealType: 'Pre-Workout',
          title: 'Pre-Workout Snacks',
          options: [
            {
              name: 'Walnuts + Almonds',
              portion: '2 walnuts + 6 soaked almonds',
              imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=150&fit=crop',
              calories: 100,
              macros: { protein: 3, carbs: 3, fats: 9 }
            },
            {
              name: 'Lavender Tea',
              portion: '1 cup',
              imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=200&h=150&fit=crop',
              calories: 5,
              macros: { protein: 0, carbs: 1, fats: 0 }
            }
          ],
          tips: 'Light energy boost before workout'
        },
        {
          time: '5:00 PM',
          mealType: 'Evening Snacks',
          title: 'Evening Snack Options',
          options: [
            {
              name: 'Roasted Chana',
              portion: '30g with lemon, chat masala',
              imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=150&fit=crop',
              calories: 120,
              macros: { protein: 6, carbs: 15, fats: 4 }
            },
            {
              name: 'Sprouted Moong Chat',
              portion: '1 bowl with onion, tomato, coriander, lemon',
              imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=150&fit=crop',
              calories: 100,
              macros: { protein: 7, carbs: 15, fats: 2 }
            },
            {
              name: 'Hummus with Veggies',
              portion: '2 tbsp hummus + veggie sticks',
              imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop',
              calories: 130,
              macros: { protein: 4, carbs: 12, fats: 8 }
            },
            {
              name: 'Makhana',
              portion: '50g + green tea',
              imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=150&fit=crop',
              calories: 100,
              macros: { protein: 4, carbs: 18, fats: 1 }
            },
            {
              name: 'Roasted Peanut',
              portion: '30g + green tea',
              imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=150&fit=crop',
              calories: 150,
              macros: { protein: 5, carbs: 5, fats: 12 }
            },
            {
              name: 'Sweet Corn Chat',
              portion: '1 bowl + green tea',
              imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=150&fit=crop',
              calories: 130,
              macros: { protein: 4, carbs: 25, fats: 2 }
            }
          ],
          tips: 'Add lemon, chili powder, or chat masala for taste'
        },
        {
          time: '7:30 PM',
          mealType: 'Dinner',
          title: 'Light Dinner Options',
          options: [
            {
              name: 'Tomato Soup',
              portion: '1 bowl + salad',
              imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=150&fit=crop',
              calories: 150,
              macros: { protein: 3, carbs: 20, fats: 5 }
            },
            {
              name: 'Dal Soup',
              portion: '1 bowl + salad',
              imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=150&fit=crop',
              calories: 140,
              macros: { protein: 8, carbs: 18, fats: 3 }
            },
            {
              name: 'Vegetable Soup',
              portion: '1 bowl',
              imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=150&fit=crop',
              calories: 100,
              macros: { protein: 4, carbs: 15, fats: 2 }
            },
            {
              name: 'Saute Veggies with Paneer',
              portion: '1 plate',
              imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop',
              calories: 250,
              macros: { protein: 12, carbs: 15, fats: 15 }
            },
            {
              name: 'Spinach Soup',
              portion: '1 bowl',
              imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=150&fit=crop',
              calories: 80,
              macros: { protein: 5, carbs: 10, fats: 2 }
            }
          ],
          tips: 'Keep dinner light and early'
        },
        {
          time: '10:00 PM',
          mealType: 'Bed Time',
          title: 'Bedtime Drink',
          options: [
            {
              name: 'Chamomile Tea',
              portion: '1 cup',
              imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=200&h=150&fit=crop',
              calories: 5,
              macros: { protein: 0, carbs: 1, fats: 0 }
            }
          ],
          tips: 'Helps with sleep and relaxation'
        }
      ],
      lateNightOptions: [
        {
          name: 'Protein Bar',
          portion: 'Half bar',
          imageUrl: 'https://images.unsplash.com/photo-1622484212028-5f1bf3b57d5c?w=200&h=150&fit=crop',
          calories: 100,
          macros: { protein: 10, carbs: 8, fats: 4 }
        },
        {
          name: 'Trail Mix',
          portion: '2 tbsp',
          imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=150&fit=crop',
          calories: 120,
          macros: { protein: 3, carbs: 15, fats: 6 }
        },
        {
          name: 'Nuts and Seeds Balls',
          portion: '1 homemade ball',
          imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=150&fit=crop',
          calories: 80,
          macros: { protein: 2, carbs: 10, fats: 4 }
        },
        {
          name: 'Apple with Peanut Butter',
          portion: '1 apple + 1 tsp PB',
          imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=150&fit=crop',
          calories: 180,
          macros: { protein: 4, carbs: 25, fats: 8 }
        },
        {
          name: 'Moong Dal Chips',
          portion: 'Air fried',
          imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=150&fit=crop',
          calories: 80,
          macros: { protein: 5, carbs: 12, fats: 1 }
        },
        {
          name: 'Beetroot Chips',
          portion: 'Air fried',
          imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=150&fit=crop',
          calories: 60,
          macros: { protein: 2, carbs: 12, fats: 0 }
        }
      ],
      importantPoints: [
        'Check weight every 10 days empty stomach in the morning (avoid if constipated, bloated)',
        'Take whole body measurements once a month in the morning empty stomach',
        'Update about your meals on WhatsApp',
        'Stay connected as much as possible for better consistency',
        'Be watchful of the portion size (most important)'
      ],
      portionSizeReference: {
        '1 glass': '250 ml',
        '1 small bowl': '150 g',
        '1 medium bowl': '250 g',
        '1 big bowl': '350 g',
        '1 tsp': '5 g',
        '1 tbsp': '15 g'
      },
      goals: [
        'Add small frequent meals',
        'Add Trifala powder in routine',
        'Increase Protein intake'
      ]
    };
  }

/**
   * Get personalized diet plan for a user based on their health profile
   * GET /api/diet/personalized/:userId
   */
  async getPersonalizedDietPlan(req, res) {
    try {
      const { userId } = req.params;

      // Try to get diet plan from database first
      const { DietPlan } = require('../models');
      
      const storedDietPlan = await DietPlan.findOne({
        where: {
          userId: parseInt(userId),
          isCurrent: true,
          isActive: true
        }
      });

      if (storedDietPlan) {
        // Return the stored diet plan from database
        return res.status(200).json({
          success: true,
          data: {
            userId: storedDietPlan.userId,
            userName: storedDietPlan.userName,
            profile: storedDietPlan.profileData,
            nutritionTargets: storedDietPlan.nutritionTargets,
            dailySchedule: storedDietPlan.dailySchedule,
            lateNightOptions: storedDietPlan.lateNightOptions,
            importantPoints: storedDietPlan.importantPoints,
            portionSizeReference: storedDietPlan.portionSizeReference,
            goals: storedDietPlan.goals,
            source: 'database'
          }
        });
      }

      // If no stored diet plan, generate one dynamically
      // Calculate daily calories based on profile
      let dailyCalories = 2000; // Default
      let bmiCategory = 'Normal';
      let userName = 'User';
      let userAge = 0;
      let userWeight = 0;
      let userHeight = 0;

      try {
        // Import models
        const { HealthProfile, BMICalculation } = require('../models');

        // Get user's current health profile
        const healthProfile = await HealthProfile.findOne({
          where: {
            userId: parseInt(userId),
            isCurrent: true
          }
        });

        if (healthProfile) {
          userAge = healthProfile.age || 0;
          userWeight = healthProfile.weight || 0;
          userHeight = healthProfile.height || 0;
          userName = 'User';
        }

        // Get latest BMI calculation
        const bmiCalculation = await BMICalculation.findOne({
          where: { userId: parseInt(userId) },
          order: [['createdAt', 'DESC']]
        });

        if (bmiCalculation) {
          dailyCalories = bmiCalculation.dailyCalories || 2000;
          bmiCategory = bmiCalculation.category || 'Normal';
        } else if (healthProfile) {
          // Calculate based on profile
          const { calculateAllHealthMetrics } = require('../services/healthCalculations');
          const metrics = calculateAllHealthMetrics({
            weight: healthProfile.weight,
            height: healthProfile.height,
            age: healthProfile.age,
            gender: healthProfile.gender,
            activityLevel: healthProfile.activityLevel
          });
          dailyCalories = metrics.dailyCalories;
          bmiCategory = metrics.category;
        }
      } catch (dbError) {
        console.warn('Could not fetch health data, using defaults:', dbError.message);
        // Continue with default values
      }

      // Generate Simmi Ji diet plan format using the class method
      const dietPlan = HealthController.prototype.generateSimmiJiDietPlan(
        dailyCalories, 
        userName, 
        userAge, 
        userWeight, 
        userHeight, 
        bmiCategory, 
        parseInt(userId)
      );

      res.status(200).json({
        success: true,
        data: {
          ...dietPlan,
          source: 'generated'
        }
      });

    } catch (error) {
      console.error('Get personalized diet plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get personalized diet plan',
        error: error.message
      });
    }
  }

  /**
   * Save or update a diet plan for a user (for doctors/admin)
   * POST /api/diet/save-plan
   */
  async saveDietPlan(req, res) {
    try {
      const { userId, dietPlan } = req.body;

      if (!userId || !dietPlan) {
        return res.status(400).json({
          success: false,
          message: 'userId and dietPlan are required'
        });
      }

      // Import models
      const { DietPlan } = require('../models');

      // Check if there's already a current diet plan for this user
      let existingPlan = await DietPlan.findOne({
        where: {
          userId: parseInt(userId),
          isCurrent: true
        }
      });

      if (existingPlan) {
        // Update existing plan
        // First, mark all existing plans as not current
        await DietPlan.update(
          { isCurrent: false },
          { where: { userId: parseInt(userId) } }
        );
      }

      // Create new diet plan
      const newPlan = await DietPlan.create({
        userId: parseInt(userId),
        doctorId: req.admin?.id || null,
        planName: dietPlan.planName || 'Personalized Diet Plan',
        userName: dietPlan.userName || 'User',
        profileData: dietPlan.profile || {},
        nutritionTargets: dietPlan.nutritionTargets || {},
        dailySchedule: dietPlan.dailySchedule || [],
        lateNightOptions: dietPlan.lateNightOptions || [],
        importantPoints: dietPlan.importantPoints || [],
        portionSizeReference: dietPlan.portionSizeReference || {},
        goals: dietPlan.goals || [],
        isActive: true,
        isCurrent: true
      });

      res.status(201).json({
        success: true,
        message: 'Diet plan saved successfully',
        data: {
          id: newPlan.id,
          userId: newPlan.userId,
          planName: newPlan.planName,
          createdAt: newPlan.createdAt
        }
      });

    } catch (error) {
      console.error('Save diet plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save diet plan',
        error: error.message
      });
    }
  }
}

module.exports = new HealthController();

