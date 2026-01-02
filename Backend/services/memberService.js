const { sequelize, User, HealthProfile, Admin } = require('../models');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const emailService = require('./emailService');

class MemberService {
  /**
   * Create a new member (doctor or dietician) in Admin table
   */
  async createMember(memberData) {
    try {
      // Validate required fields
      const { firstName, lastName, email, password, role, phone, category } = memberData;
      
      if (!firstName || !lastName || !email || !password || !role) {
        throw new Error('Missing required fields: firstName, lastName, email, password, role');
      }

      // Validate role
      if (!['doctor', 'dietitian'].includes(role)) {
        throw new Error('Role must be either "doctor" or "dietitian"');
      }

      // Check if admin already exists in Admin table
      const existingAdmin = await Admin.findOne({ where: { email } });
      if (existingAdmin) {
        throw new Error('User with this email already exists in admin table');
      }

      // Check if user already exists in User table
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Don't hash password here - let the Admin model's beforeCreate hook handle it
      // Create the member in Admin table with role="member" and category
      const member = await Admin.create({
        firstName,
        lastName,
        email,
        password, // Plain password - will be hashed by model's beforeCreate hook
        role: 'member', // Always 'member' for doctors/dietitians
        category: role, // category is 'doctor' or 'dietitian'
        phone: phone || null,
        isActive: true
      });

      // Return member data without password
      const memberResponseData = member.toJSON();
      delete memberResponseData.password;

      // Send welcome email
      const memberWithPassword = {
        ...memberResponseData,
        category: member.category
      };
      
      // Send email asynchronously (don't wait for it)
      emailService.sendMemberWelcomeEmail(memberWithPassword, password).catch(err => {
        console.error('Failed to send welcome email:', err);
      });

      return {
        success: true,
        data: memberResponseData,
        message: `${role === 'doctor' ? 'Doctor' : 'Dietician'} created successfully. Welcome email sent.`
      };

    } catch (error) {
      console.error('Create member error:', error);
      throw new Error(error.message || 'Failed to create member');
    }
  }

  /**
   * Get all members from Admin table with pagination
   */
  async getAllMembers(limit = 50, offset = 0, role = null) {
    try {
      console.log('Fetching members with role filter:', { limit, offset, role });
      
      // Check database connection first
      try {
        await sequelize.authenticate();
        console.log('Database connection established');
      } catch (dbError) {
        console.error('Database connection failed:', dbError);
        throw new Error('Database connection failed: ' + dbError.message);
      }
      
      // Only fetch members with role='member'
      const whereClause = { role: 'member' };
      if (role) {
        whereClause.category = role;
      }
      
      console.log('Where clause:', JSON.stringify(whereClause));
      
      const { count, rows: members } = await Admin.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'category', 'isActive', 'createdAt'],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });
      
      console.log(`Found ${count} members`);

      // Map to expected format for frontend compatibility
      const mappedMembers = members.map(member => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        role: member.category, // Use category as role for frontend compatibility
        isActive: member.isActive,
        createdAt: member.createdAt,
        category: member.category
      }));

      return {
        success: true,
        data: mappedMembers,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(count / limit)
        }
      };

    } catch (error) {
      console.error('Get all members error:', error);
      console.error('Error stack:', error.stack);
      throw new Error('Failed to fetch members: ' + error.message);
    }
  }

  /**
   * Get a specific member by ID from Admin table
   */
  async getMemberById(memberId) {
    try {
      const member = await Admin.findOne({
        where: { 
          id: memberId,
          role: 'member'
        },
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'category', 'isActive', 'createdAt']
      });

      if (!member) {
        throw new Error('Member not found');
      }

      return {
        success: true,
        data: {
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone,
          role: member.category,
          isActive: member.isActive,
          createdAt: member.createdAt,
          category: member.category
        }
      };

    } catch (error) {
      console.error('Get member by ID error:', error);
      throw new Error(error.message || 'Failed to fetch member');
    }
  }

  /**
   * Update a member in Admin table
   */
  async updateMember(memberId, updateData) {
    try {
      const member = await Admin.findOne({
        where: { 
          id: memberId,
          role: 'member'
        }
      });

      if (!member) {
        throw new Error('Member not found');
      }

      // If role is being updated, validate it
      if (updateData.role && !['doctor', 'dietitian'].includes(updateData.role)) {
        throw new Error('Role must be either "doctor" or "dietitian"');
      }

      // Handle category update
      if (updateData.role) {
        updateData.category = updateData.role;
        delete updateData.role;
      }

      // Hash password if being updated
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }

      // Update the member
      await member.update(updateData);

      // Return updated member data
      const updatedMember = member.toJSON();
      delete updatedMember.password;

      return {
        success: true,
        data: {
          ...updatedMember,
          role: updatedMember.category
        },
        message: 'Member updated successfully'
      };

    } catch (error) {
      console.error('Update member error:', error);
      throw new Error(error.message || 'Failed to update member');
    }
  }

  /**
   * Delete a member (soft delete by setting isActive to false)
   */
  async deleteMember(memberId) {
    try {
      const member = await Admin.findOne({
        where: { 
          id: memberId,
          role: 'member'
        }
      });

      if (!member) {
        throw new Error('Member not found');
      }

      // Soft delete by setting isActive to false
      await member.update({ isActive: false });

      return {
        success: true,
        message: 'Member deleted successfully'
      };

    } catch (error) {
      console.error('Delete member error:', error);
      throw new Error(error.message || 'Failed to delete member');
    }
  }

  /**
   * Get member statistics
   */
  async getMemberStats() {
    try {
      // Check database connection first
      try {
        await sequelize.authenticate();
        console.log('Database connection established for stats');
      } catch (dbError) {
        console.error('Database connection failed for stats:', dbError);
        throw new Error('Database connection failed: ' + dbError.message);
      }

      const { count: totalDoctors } = await Admin.findAndCountAll({
        where: { role: 'member', category: 'doctor', isActive: true }
      });

      const { count: totalDietitians } = await Admin.findAndCountAll({
        where: { role: 'member', category: 'dietitian', isActive: true }
      });

      const { count: totalActive } = await Admin.findAndCountAll({
        where: { 
          role: 'member',
          isActive: true 
        }
      });

      return {
        success: true,
        data: {
          totalDoctors,
          totalDietitians,
          totalActive,
          total: totalActive
        }
      };

    } catch (error) {
      console.error('Get member stats error:', error);
      console.error('Error stack:', error.stack);
      throw new Error('Failed to fetch member statistics: ' + error.message);
    }
  }
}

module.exports = new MemberService();
