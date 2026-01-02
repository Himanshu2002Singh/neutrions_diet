const { User, HealthProfile, BMICalculation, DietRecommendation } = require('../models');
const { sequelize } = require('../config/database');
const { calculateAllHealthMetrics, generateDietRecommendation, getMedicalRecommendations } = require('./healthCalculations');
const { validateHealthForm } = require('./validationService');

class HealthService {
  /**
   * Retry decorator for database operations
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise} Result of the function
   */
  async withRetry(fn, maxRetries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Check if it's a lock timeout or connection error
        const isRetryableError = 
          error.name === 'SequelizeConnectionError' ||
          error.name === 'SequelizeConnectionRefusedError' ||
          error.name === 'SequelizeConnectionTimedOutError' ||
          (error.message && error.message.includes('Lock wait timeout exceeded')) ||
          (error.message && error.message.includes('Deadlock found')) ||
          (error.message && error.message.includes('Connection lost'));

        if (!isRetryableError || attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }
  /**
   * Submit health form and generate complete health profile
   * @param {Object} formData - Health form data
   * @param {number} userId - User ID
   * @returns {Object} Complete health profile with BMI and diet recommendations
   */
  async submitHealthForm(formData, userId) {
    return this.withRetry(async () => {
      try {
        // Validate input data
        const validation = validateHealthForm(formData);
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Use a simplified approach without complex transactions
        // This reduces lock contention
        const healthProfile = await this.createHealthProfileSimple(formData, userId);
        
        // Calculate BMI and health metrics
        const bmiCalculation = await this.calculateHealthMetricsSimple(formData, userId, healthProfile.id);
        
        // Generate diet recommendations
        const dietRecommendation = await this.generateDietRecommendationsSimple(
          formData, 
          userId, 
          healthProfile.id, 
          bmiCalculation.id
        );

        // Return complete health profile
        return {
          healthProfile,
          bmiCalculation,
          dietRecommendation
        };

      } catch (error) {
        console.error('Health form submission error:', error);
        throw new Error(`Failed to submit health form: ${error.message}`);
      }
    });
  }

  /**
   * Create health profile (simplified version without transactions)
   * @param {Object} formData - Health form data
   * @param {number} userId - User ID
   * @returns {Object} Health profile
   */
  async createHealthProfileSimple(formData, userId) {
    try {
      // Use upsert approach to avoid UPDATE conflicts
      // First, try to find existing profile
      const existingProfile = await HealthProfile.findOne({
        where: { userId, isCurrent: true }
      });

      if (existingProfile) {
        // Update existing profile instead of creating new one
        // This avoids the UPDATE lock contention
        await existingProfile.update({
          weight: formData.weight,
          height: formData.height,
          age: formData.age,
          gender: formData.gender,
          activityLevel: formData.activityLevel,
          medicalConditions: formData.medicalConditions ? formData.medicalConditions.split(',').map(c => c.trim()) : [],
          goals: formData.goals ? formData.goals.split(',').map(g => g.trim()) : [],
          updatedAt: new Date()
        });

        return existingProfile;
      } else {
        // No existing profile, create new one
        // User data (firstName, lastName, email, phone) is stored in users table, not health_profiles
        const healthProfile = await HealthProfile.create({
          userId,
          weight: formData.weight,
          height: formData.height,
          age: formData.age,
          gender: formData.gender,
          activityLevel: formData.activityLevel,
          medicalConditions: formData.medicalConditions ? formData.medicalConditions.split(',').map(c => c.trim()) : [],
          goals: formData.goals ? formData.goals.split(',').map(g => g.trim()) : [],
          isCurrent: true
        });

        return healthProfile;
      }
    } catch (error) {
      console.error('Error in createHealthProfileSimple:', error);
      throw error;
    }
  }

  /**
   * Calculate BMI and health metrics (simplified version without transactions)
   * @param {Object} formData - Health form data
   * @param {number} userId - User ID
   * @param {number} healthProfileId - Health profile ID
   * @returns {Object} BMI calculation
   */
  async calculateHealthMetricsSimple(formData, userId, healthProfileId) {
    try {
      // Calculate all health metrics using the health calculations service
      const calculation = calculateAllHealthMetrics(
        parseFloat(formData.height),
        parseFloat(formData.weight),
        parseInt(formData.age),
        formData.gender,
        formData.activityLevel
      );

      // Save BMI calculation to database
      const bmiCalculation = await BMICalculation.create({
        userId,
        healthProfileId,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        age: parseInt(formData.age),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        bmi: calculation.bmi,
        bmr: calculation.bmr,
        dailyCalories: calculation.dailyCalories,
        category: calculation.category,
        idealWeightMin: calculation.idealWeight[0],
        idealWeightMax: calculation.idealWeight[1],
        color: calculation.color
      });

      return bmiCalculation;
    } catch (error) {
      console.error('Error in calculateHealthMetricsSimple:', error);
      throw error;
    }
  }

  /**
   * Generate diet recommendations (simplified version without transactions)
   * @param {Object} formData - Health form data
   * @param {number} userId - User ID
   * @param {number} healthProfileId - Health profile ID
   * @param {number} bmiCalculationId - BMI calculation ID
   * @returns {Object} Diet recommendation
   */
  async generateDietRecommendationsSimple(formData, userId, healthProfileId, bmiCalculationId) {
    try {
      // Get BMI calculation for reference
      const bmiCalculation = await BMICalculation.findByPk(bmiCalculationId);
      
      // Create BMI calculation object for diet generation
      const bmiCalc = {
        bmi: parseFloat(bmiCalculation.bmi),
        category: bmiCalculation.category,
        bmr: parseInt(bmiCalculation.bmr),
        dailyCalories: parseInt(bmiCalculation.dailyCalories),
        idealWeight: [parseFloat(bmiCalculation.idealWeightMin), parseFloat(bmiCalculation.idealWeightMax)],
        color: bmiCalculation.color
      };

      // Parse medical conditions
      const medicalConditions = formData.medicalConditions ? 
        formData.medicalConditions.split(',').map(c => c.trim()) : [];

      // Generate diet recommendation
      const dietRec = generateDietRecommendation(bmiCalc, medicalConditions);

      // Get medical recommendations
      const medicalRecommendations = getMedicalRecommendations(medicalConditions);

      // Save diet recommendation to database
      // Ensure dailyCalories is at least 1000 (validation minimum)
      const safeDailyCalories = Math.max(parseInt(dietRec.dailyCalories), 1000);
      const safeProtein = Math.max(parseFloat(dietRec.protein), 0);
      const safeCarbs = Math.max(parseFloat(dietRec.carbs), 0);
      const safeFats = Math.max(parseFloat(dietRec.fats), 0);

      const dietRecommendation = await DietRecommendation.create({
        userId,
        healthProfileId,
        bmiCalculationId,
        dailyCalories: safeDailyCalories,
        protein: safeProtein,
        carbs: safeCarbs,
        fats: safeFats,
        meals: dietRec.meals,
        foods: dietRec.foods,
        restrictions: dietRec.restrictions,
        medicalRecommendations
      });

      return dietRecommendation;
    } catch (error) {
      console.error('Error in generateDietRecommendationsSimple:', error);
      throw error;
    }
  }

  /**
   * Create health profile (legacy method with transactions)
   * @param {Object} formData - Health form data
   * @param {number} userId - User ID
   * @param {Object} transaction - Sequelize transaction
   * @returns {Object} Health profile
   */
  async createHealthProfile(formData, userId, transaction = null) {
    return this.createHealthProfileSimple(formData, userId);
  }

  /**
   * Calculate BMI and health metrics
   * @param {Object} formData - Health form data
   * @param {number} userId - User ID
   * @param {number} healthProfileId - Health profile ID
   * @param {Object} transaction - Sequelize transaction
   * @returns {Object} BMI calculation
   */
  async calculateHealthMetrics(formData, userId, healthProfileId, transaction = null) {
    const options = transaction ? { transaction } : {};

    // Calculate all health metrics using the health calculations service
    const calculation = calculateAllHealthMetrics(
      parseFloat(formData.height),
      parseFloat(formData.weight),
      parseInt(formData.age),
      formData.gender,
      formData.activityLevel
    );

    // Save BMI calculation to database
    const bmiCalculation = await BMICalculation.create({
      userId,
      healthProfileId,
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      age: parseInt(formData.age),
      gender: formData.gender,
      activityLevel: formData.activityLevel,
      bmi: calculation.bmi,
      bmr: calculation.bmr,
      dailyCalories: calculation.dailyCalories,
      category: calculation.category,
      idealWeightMin: calculation.idealWeight[0],
      idealWeightMax: calculation.idealWeight[1],
      color: calculation.color
    }, options);

    return bmiCalculation;
  }

  /**
   * Generate diet recommendations
   * @param {Object} formData - Health form data
   * @param {number} userId - User ID
   * @param {number} healthProfileId - Health profile ID
   * @param {number} bmiCalculationId - BMI calculation ID
   * @param {Object} transaction - Sequelize transaction
   * @returns {Object} Diet recommendation
   */
  async generateDietRecommendations(formData, userId, healthProfileId, bmiCalculationId, transaction = null) {
    const options = transaction ? { transaction } : {};

    // Get BMI calculation for reference
    const bmiCalculation = await BMICalculation.findByPk(bmiCalculationId, options);
    
    // Create BMI calculation object for diet generation
    const bmiCalc = {
      bmi: parseFloat(bmiCalculation.bmi),
      category: bmiCalculation.category,
      bmr: parseInt(bmiCalculation.bmr),
      dailyCalories: parseInt(bmiCalculation.dailyCalories),
      idealWeight: [parseFloat(bmiCalculation.idealWeightMin), parseFloat(bmiCalculation.idealWeightMax)],
      color: bmiCalculation.color
    };

    // Parse medical conditions
    const medicalConditions = formData.medicalConditions ? 
      formData.medicalConditions.split(',').map(c => c.trim()) : [];

    // Generate diet recommendation
    const dietRec = generateDietRecommendation(bmiCalc, medicalConditions);

    // Get medical recommendations
    const medicalRecommendations = getMedicalRecommendations(medicalConditions);

    // Save diet recommendation to database
    // Ensure dailyCalories is at least 1000 (validation minimum)
    const safeDailyCalories = Math.max(parseInt(dietRec.dailyCalories), 1000);
    const safeProtein = Math.max(parseFloat(dietRec.protein), 0);
    const safeCarbs = Math.max(parseFloat(dietRec.carbs), 0);
    const safeFats = Math.max(parseFloat(dietRec.fats), 0);

    const dietRecommendation = await DietRecommendation.create({
      userId,
      healthProfileId,
      bmiCalculationId,
      dailyCalories: safeDailyCalories,
      protein: safeProtein,
      carbs: safeCarbs,
      fats: safeFats,
      meals: dietRec.meals,
      foods: dietRec.foods,
      restrictions: dietRec.restrictions,
      medicalRecommendations
    }, options);

    return dietRecommendation;
  }

  /**
   * Get user's current health profile
   * @param {number} userId - User ID
   * @returns {Object} Current health profile with BMI and diet data
   */
  async getCurrentHealthProfile(userId) {
    try {
      const healthProfile = await HealthProfile.findOne({
        where: { userId, isCurrent: true },
        include: [
          {
            model: BMICalculation,
            as: 'bmiCalculations',
            limit: 1,
            order: [['created_at', 'DESC']]
          },
          {
            model: DietRecommendation,
            as: 'dietRecommendations',
            limit: 1,
            order: [['created_at', 'DESC']]
          }
        ]
      });

      return healthProfile;
    } catch (error) {
      console.error('Error getting current health profile:', error);
      throw new Error('Failed to get current health profile');
    }
  }

  /**
   * Get user's health profile history
   * @param {number} userId - User ID
   * @param {number} limit - Number of records to return
   * @returns {Array} Array of health profiles
   */
  async getHealthProfileHistory(userId, limit = 10) {
    try {
      const profiles = await HealthProfile.findAll({
        where: { userId },
        include: [
          {
            model: BMICalculation,
            as: 'bmiCalculations',
            order: [['created_at', 'DESC']],
            limit: 1
          },
          {
            model: DietRecommendation,
            as: 'dietRecommendations',
            order: [['created_at', 'DESC']],
            limit: 1
          }
        ],
        order: [['created_at', 'DESC']],
        limit
      });

      return profiles;
    } catch (error) {
      console.error('Error getting health profile history:', error);
      throw new Error('Failed to get health profile history');
    }
  }

  /**
   * Calculate BMI only (for real-time calculations)
   * @param {Object} formData - Basic health data
   * @returns {Object} BMI calculation
   */
  async calculateBMIOnly(formData) {
    try {
      const calculation = calculateAllHealthMetrics(
        parseFloat(formData.height),
        parseFloat(formData.weight),
        parseInt(formData.age),
        formData.gender,
        formData.activityLevel
      );

      return calculation;
    } catch (error) {
      console.error('BMI calculation error:', error);
      throw new Error('Failed to calculate BMI');
    }
  }

  /**
   * Get all users with their current health profiles for admin dashboard
   * User data comes from users table via JOIN
   * @param {number} limit - Number of records to return
   * @param {number} offset - Offset for pagination
   * @returns {Array} Array of users with health profiles
   */
  async getUsersWithHealthProfiles(limit = 50, offset = 0) {
    return this.withRetry(async () => {
      try {
        // Use raw query to avoid Sequelize field name issues
        // User data (name, email, phone) comes from users table via JOIN
        const queryInterface = sequelize.getQueryInterface();
        
        const usersQuery = `
          SELECT 
            hp.id as healthProfileId,
            hp.user_id as userId,
            hp.age,
            hp.weight,
            hp.height,
            hp.gender,
            hp.activity_level as activityLevel,
            hp.medical_conditions as medicalConditions,
            hp.goals,
            hp.created_at,
            bc.bmi,
            bc.bmr,
            bc.daily_calories as dailyCalories,
            bc.category,
            bc.ideal_weight_min as idealWeightMin,
            bc.ideal_weight_max as idealWeightMax,
            dr.protein,
            dr.carbs,
            dr.fats,
            u.first_name as firstName,
            u.last_name as lastName,
            u.email,
            u.phone as userPhone
          FROM health_profiles hp
          INNER JOIN users u ON hp.user_id = u.id
          LEFT JOIN bmi_calculations bc ON hp.id = bc.health_profile_id
          LEFT JOIN diet_recommendations dr ON hp.id = dr.health_profile_id
          WHERE hp.is_current = 1
            AND u.role = 'user'
            AND u.is_active = 1
          ORDER BY hp.created_at DESC
          LIMIT ? OFFSET ?
        `;
        
        const users = await queryInterface.sequelize.query(usersQuery, {
          replacements: [limit, offset],
          type: queryInterface.sequelize.QueryTypes.SELECT
        });

        // For each user, format the response (data is already in the query result)
        const result = users.map(user => {
          // Parse medical conditions and goals from JSON strings
          let medicalConditions = [];
          let goals = [];
          
          try {
            if (user.medicalConditions) {
              medicalConditions = typeof user.medicalConditions === 'string' 
                ? JSON.parse(user.medicalConditions) 
                : user.medicalConditions;
            }
          } catch (e) {
            medicalConditions = [];
          }
          
          try {
            if (user.goals) {
              goals = typeof user.goals === 'string' 
                ? JSON.parse(user.goals) 
                : user.goals;
            }
          } catch (e) {
            goals = [];
          }

          return {
            id: user.userId,
            userName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.userPhone || 'Not specified',
            age: user.age,
            plan: 'Standard Plan',
            amount: '$39.99/month',
            createdAt: user.created_at,
            healthDetails: {
              medicalIssues: JSON.stringify(medicalConditions),
              weight: user.weight,
              height: user.height,
              age: user.age,
              gender: user.gender,
              activityLevel: user.activityLevel,
              medicalConditions: JSON.stringify(medicalConditions),
              allergies: 'Not specified',
              medications: 'Not specified',
              dietaryRestrictions: JSON.stringify(goals),
              bmi: user.bmi || 0,
              bmiCategory: user.category || 'Unknown',
              dailyCalories: user.dailyCalories || 0,
              dietRecommendations: user.protein ? {
                protein: String(user.protein),
                carbs: String(user.carbs),
                fats: String(user.fats),
                meals: '[]',
                foods: '[]'
              } : null
            }
          };
        });

        return result;

      } catch (error) {
        console.error('Error getting users with health profiles:', error);
        throw new Error('Failed to get users with health profiles');
      }
    });
  }

  /**
   * Get total count of users with health profiles
   * @returns {number} Total count
   */
  async getUsersWithHealthProfilesCount() {
    return this.withRetry(async () => {
      try {
        const queryInterface = sequelize.getQueryInterface();

        const countQuery = `
          SELECT COUNT(*) as count
          FROM users u
          INNER JOIN health_profiles hp ON u.id = hp.user_id AND hp.is_current = 1
          WHERE u.role = 'user' AND u.is_active = 1
        `;

        const result = await queryInterface.sequelize.query(countQuery, {
          type: queryInterface.sequelize.QueryTypes.SELECT
        });

        return result[0]?.count || 0;
      } catch (error) {
        console.error('Error getting users count:', error);
        throw new Error('Failed to get users count');
      }
    });
  }

  /**
   * Get users with health profiles but no assigned dietician
   * @param {number} limit - Number of records to return
   * @param {number} offset - Offset for pagination
   * @returns {Array} Array of unassigned users with health profiles
   */
  async getUnassignedUsers(limit = 50, offset = 0) {
    return this.withRetry(async () => {
      try {
        const queryInterface = sequelize.getQueryInterface();

        // First try to get users - if column doesn't exist, we'll get an error
        // The server.js will auto-sync, but we need to handle the case where it fails
        const usersQuery = `
          SELECT
            hp.id as healthProfileId,
            hp.user_id as userId,
            hp.age,
            hp.weight,
            hp.height,
            hp.gender,
            hp.activity_level as activityLevel,
            hp.medical_conditions as medicalConditions,
            hp.goals,
            hp.created_at,
            bc.bmi,
            bc.bmr,
            bc.daily_calories as dailyCalories,
            bc.category,
            bc.ideal_weight_min as idealWeightMin,
            bc.ideal_weight_max as idealWeightMax,
            dr.protein,
            dr.carbs,
            dr.fats,
            u.first_name as firstName,
            u.last_name as lastName,
            u.email,
            u.phone as userPhone,
            COALESCE(u.assigned_dietician_id, 0) as assignedDieticianId,
            u.assigned_at as assignedAt
          FROM health_profiles hp
          INNER JOIN users u ON hp.user_id = u.id
          LEFT JOIN bmi_calculations bc ON hp.id = bc.health_profile_id
          LEFT JOIN diet_recommendations dr ON hp.id = dr.health_profile_id
          WHERE hp.is_current = 1
            AND u.role = 'user'
            AND u.is_active = 1
            AND (u.assigned_dietician_id IS NULL OR u.assigned_dietician_id = 0)
          ORDER BY hp.created_at DESC
          LIMIT ? OFFSET ?
        `;

        const users = await queryInterface.sequelize.query(usersQuery, {
          replacements: [limit, offset],
          type: queryInterface.sequelize.QueryTypes.SELECT
        });

        // For each user, format the response
        const result = users.map(user => {
          let medicalConditions = [];
          let goals = [];

          try {
            if (user.medicalConditions) {
              medicalConditions = typeof user.medicalConditions === 'string'
                ? JSON.parse(user.medicalConditions)
                : user.medicalConditions;
            }
          } catch (e) {
            medicalConditions = [];
          }

          try {
            if (user.goals) {
              goals = typeof user.goals === 'string'
                ? JSON.parse(user.goals)
                : user.goals;
            }
          } catch (e) {
            goals = [];
          }

          return {
            id: user.userId,
            userName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.userPhone || 'Not specified',
            age: user.age,
            plan: 'Standard Plan',
            amount: '$39.99/month',
            createdAt: user.created_at,
            assignedDieticianId: user.assignedDieticianId || null,
            assignedAt: user.assignedAt || null,
            healthDetails: {
              medicalIssues: JSON.stringify(medicalConditions),
              weight: user.weight,
              height: user.height,
              age: user.age,
              gender: user.gender,
              activityLevel: user.activityLevel,
              medicalConditions: JSON.stringify(medicalConditions),
              allergies: 'Not specified',
              medications: 'Not specified',
              dietaryRestrictions: JSON.stringify(goals),
              bmi: user.bmi || 0,
              bmiCategory: user.category || 'Unknown',
              dailyCalories: user.dailyCalories || 0,
              dietRecommendations: user.protein ? {
                protein: String(user.protein),
                carbs: String(user.carbs),
                fats: String(user.fats),
                meals: '[]',
                foods: '[]'
              } : null
            }
          };
        });

        return result;

      } catch (error) {
        console.error('Error getting unassigned users:', error);
        throw new Error('Failed to get unassigned users');
      }
    });
  }

  /**
   * Get count of unassigned users
   * @returns {number} Total count of unassigned users
   */
  async getUnassignedUsersCount() {
    return this.withRetry(async () => {
      try {
        const queryInterface = sequelize.getQueryInterface();

        const countQuery = `
          SELECT COUNT(*) as count
          FROM users u
          INNER JOIN health_profiles hp ON u.id = hp.user_id AND hp.is_current = 1
          WHERE u.role = 'user'
            AND u.is_active = 1
            AND (COALESCE(u.assigned_dietician_id, 0) = 0 OR u.assigned_dietician_id IS NULL)
        `;

        const result = await queryInterface.sequelize.query(countQuery, {
          type: queryInterface.sequelize.QueryTypes.SELECT
        });

        return result[0]?.count || 0;
      } catch (error) {
        console.error('Error getting unassigned users count:', error);
        throw new Error('Failed to get unassigned users count');
      }
    });
  }

  /**
   * Assign a dietician to a user
   * @param {number} userId - User ID
   * @param {number} dieticianId - Dietician/Member ID
   * @returns {Object} Updated user with assignment info
   */
  async assignDieticianToUser(userId, dieticianId) {
    try {
      const { User } = require('../models');

      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== 'user') {
        throw new Error('Can only assign dieticians to regular users');
      }

      // Update the assignment
      await user.update({
        assignedDieticianId: dieticianId,
        assignedAt: new Date()
      });

      return {
        success: true,
        message: 'Dietician assigned successfully',
        data: {
          userId: user.id,
          userName: user.getFullName(),
          email: user.email,
          assignedDieticianId: user.assignedDieticianId,
          assignedAt: user.assignedAt
        }
      };

    } catch (error) {
      console.error('Error assigning dietician:', error);
      throw new Error(error.message || 'Failed to assign dietician');
    }
  }

  /**
   * Remove assignment (unassign dietician from user)
   * @param {number} userId - User ID
   * @returns {Object} Updated user
   */
  async removeUserAssignment(userId) {
    try {
      const { User } = require('../models');

      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      await user.update({
        assignedDieticianId: null,
        assignedAt: null
      });

      return {
        success: true,
        message: 'Assignment removed successfully',
        data: {
          userId: user.id,
          userName: user.getFullName(),
          assignedDieticianId: null,
          assignedAt: null
        }
      };

    } catch (error) {
      console.error('Error removing assignment:', error);
      throw new Error(error.message || 'Failed to remove assignment');
    }
  }

/**
   * Get assignment details for a user (including dietician info)
   * @param {number} userId - User ID
   * @returns {Object} User with dietician assignment info
   */
  async getUserAssignmentStatus(userId) {
    try {
      const { User } = require('../models');

      const user = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'assignedDieticianId', 'assignedAt']
      });

      if (!user) {
        throw new Error('User not found');
      }

      let dieticianInfo = null;
      if (user.assignedDieticianId) {
        const dietician = await User.findByPk(user.assignedDieticianId, {
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role']
        });
        if (dietician) {
          dieticianInfo = {
            id: dietician.id,
            name: dietician.getFullName(),
            email: dietician.email,
            phone: dietician.phone,
            role: dietician.role
          };
        }
      }

      return {
        success: true,
        data: {
          userId: user.id,
          userName: user.getFullName(),
          email: user.email,
          phone: user.phone,
          isAssigned: !!user.assignedDieticianId,
          assignedDieticianId: user.assignedDieticianId,
          assignedAt: user.assignedAt,
          dietician: dieticianInfo
        }
      };

    } catch (error) {
      console.error('Error getting assignment status:', error);
      throw new Error(error.message || 'Failed to get assignment status');
    }
  }

  /**
   * Get users assigned to a specific doctor/dietician
   * @param {number} doctorId - Doctor/Dietician ID
   * @returns {Object} List of assigned users with health profiles
   */
  async getDoctorAssignedUsers(doctorId) {
    return this.withRetry(async () => {
      try {
        const queryInterface = sequelize.getQueryInterface();

        // Get users assigned to this doctor
        const usersQuery = `
          SELECT
            hp.id as healthProfileId,
            hp.user_id as userId,
            hp.age,
            hp.weight,
            hp.height,
            hp.gender,
            hp.activity_level as activityLevel,
            hp.medical_conditions as medicalConditions,
            hp.goals,
            hp.created_at,
            bc.bmi,
            bc.bmr,
            bc.daily_calories as dailyCalories,
            bc.category,
            bc.ideal_weight_min as idealWeightMin,
            bc.ideal_weight_max as idealWeightMax,
            dr.protein,
            dr.carbs,
            dr.fats,
            dr.meals,
            dr.foods,
            dr.restrictions,
            dr.medical_recommendations as medicalRecommendations,
            u.first_name as firstName,
            u.last_name as lastName,
            u.email,
            u.phone as userPhone,
            u.assigned_at as assignedAt
          FROM users u
          INNER JOIN health_profiles hp ON u.id = hp.user_id AND hp.is_current = 1
          LEFT JOIN bmi_calculations bc ON hp.id = bc.health_profile_id
          LEFT JOIN diet_recommendations dr ON hp.id = dr.health_profile_id
          WHERE u.assigned_dietician_id = ?
            AND u.role = 'user'
            AND u.is_active = 1
          ORDER BY u.assigned_at DESC
        `;

        const users = await queryInterface.sequelize.query(usersQuery, {
          replacements: [doctorId],
          type: queryInterface.sequelize.QueryTypes.SELECT
        });

        // Format the response
        const result = users.map(user => {
          let medicalConditions = [];
          let goals = [];
          let restrictions = [];
          let medicalRecommendations = [];

          try {
            if (user.medicalConditions) {
              medicalConditions = typeof user.medicalConditions === 'string'
                ? JSON.parse(user.medicalConditions)
                : user.medicalConditions;
            }
          } catch (e) {
            medicalConditions = [];
          }

          try {
            if (user.goals) {
              goals = typeof user.goals === 'string'
                ? JSON.parse(user.goals)
                : user.goals;
            }
          } catch (e) {
            goals = [];
          }

          try {
            if (user.restrictions) {
              restrictions = typeof user.restrictions === 'string'
                ? JSON.parse(user.restrictions)
                : user.restrictions;
            }
          } catch (e) {
            restrictions = [];
          }

          try {
            if (user.medicalRecommendations) {
              medicalRecommendations = typeof user.medicalRecommendations === 'string'
                ? JSON.parse(user.medicalRecommendations)
                : user.medicalRecommendations;
            }
          } catch (e) {
            medicalRecommendations = [];
          }

          return {
            id: user.userId,
            userName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.userPhone || 'Not specified',
            age: user.age,
            weight: parseFloat(user.weight),
            height: parseFloat(user.height),
            gender: user.gender,
            activityLevel: user.activityLevel,
            assignedAt: user.assignedAt,
            healthProfile: {
              medicalConditions,
              goals,
              bmi: parseFloat(user.bmi) || 0,
              bmiCategory: user.category || 'Unknown',
              bmr: parseInt(user.bmr) || 0,
              dailyCalories: parseInt(user.dailyCalories) || 0,
              idealWeightMin: parseFloat(user.idealWeightMin) || 0,
              idealWeightMax: parseFloat(user.idealWeightMax) || 0,
              dietRecommendation: user.protein ? {
                protein: parseFloat(user.protein),
                carbs: parseFloat(user.carbs),
                fats: parseFloat(user.fats),
                meals: user.meals || '',
                foods: user.foods || '',
                restrictions,
                medicalRecommendations
              } : null
            }
          };
        });

        return {
          success: true,
          data: result,
          count: result.length
        };

      } catch (error) {
        console.error('Error getting doctor assigned users:', error);
        throw new Error('Failed to get assigned users');
      }
    });
  }

  /**
   * Get a specific user's health profile for a doctor
   * @param {number} userId - User ID
   * @param {number} doctorId - Doctor ID (to verify assignment)
   * @returns {Object} User health profile
   */
  async getUserHealthProfileForDoctor(userId, doctorId) {
    try {
      const { User, HealthProfile, BMICalculation, DietRecommendation } = require('../models');

      // First verify the user exists and is assigned to this doctor
      const user = await User.findOne({
        where: { id: userId, assignedDieticianId: doctorId, role: 'user', isActive: true }
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found or not assigned to this doctor'
        };
      }

      // Get health profile
      const healthProfile = await HealthProfile.findOne({
        where: { userId, isCurrent: true }
      });

      if (!healthProfile) {
        return {
          success: false,
          message: 'No health profile found for this user'
        };
      }

      // Get latest BMI calculation
      const bmiCalculation = await BMICalculation.findOne({
        where: { healthProfileId: healthProfile.id },
        order: [['createdAt', 'DESC']]
      });

      // Get latest diet recommendation
      const dietRecommendation = await DietRecommendation.findOne({
        where: { healthProfileId: healthProfile.id },
        order: [['createdAt', 'DESC']]
      });

      return {
        success: true,
        data: {
          id: user.id,
          userName: user.getFullName(),
          email: user.email,
          phone: user.phone || 'Not specified',
          age: healthProfile.age,
          gender: healthProfile.gender,
          assignedAt: user.assignedAt,
          healthProfile: {
            weight: parseFloat(healthProfile.weight),
            height: parseFloat(healthProfile.height),
            age: healthProfile.age,
            gender: healthProfile.gender,
            activityLevel: healthProfile.activityLevel,
            medicalConditions: healthProfile.medicalConditions || [],
            goals: healthProfile.goals || [],
            bmi: bmiCalculation ? parseFloat(bmiCalculation.bmi) : 0,
            bmiCategory: bmiCalculation ? bmiCalculation.category : 'Unknown',
            bmr: bmiCalculation ? parseInt(bmiCalculation.bmr) : 0,
            dailyCalories: bmiCalculation ? parseInt(bmiCalculation.dailyCalories) : 0,
            idealWeightMin: bmiCalculation ? parseFloat(bmiCalculation.idealWeightMin) : 0,
            idealWeightMax: bmiCalculation ? parseFloat(bmiCalculation.idealWeightMax) : 0,
            dietRecommendation: dietRecommendation ? {
              protein: parseFloat(dietRecommendation.protein),
              carbs: parseFloat(dietRecommendation.carbs),
              fats: parseFloat(dietRecommendation.fats),
              meals: dietRecommendation.meals || '',
              foods: dietRecommendation.foods || '',
              restrictions: dietRecommendation.restrictions || [],
              medicalRecommendations: dietRecommendation.medicalRecommendations || []
            } : null
          }
        }
      };

    } catch (error) {
      console.error('Error getting user health profile for doctor:', error);
      throw new Error(error.message || 'Failed to get user health profile');
    }
  }
}

module.exports = new HealthService();
