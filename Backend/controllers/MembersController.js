const memberService = require('../services/memberService');
const { validationResult } = require('express-validator');

class MembersController {
  /**
   * Create a new member (doctor or dietician)
   * POST /api/members
   */
  async createMember(req, res) {
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

      const memberData = req.body;
      const result = await memberService.createMember(memberData);

      res.status(201).json(result);

    } catch (error) {
      console.error('Create member error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create member',
        error: error.message
      });
    }
  }

  /**
   * Get all members with pagination
   * GET /api/members
   */
  async getAllMembers(req, res) {
    try {
      const { limit = 50, offset = 0, role } = req.query;

      const result = await memberService.getAllMembers(limit, offset, role);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Get all members error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch members',
        error: error.message
      });
    }
  }

  /**
   * Get a specific member by ID
   * GET /api/members/:id
   */
  async getMemberById(req, res) {
    try {
      const { id } = req.params;

      const result = await memberService.getMemberById(parseInt(id));

      res.status(200).json(result);

    } catch (error) {
      console.error('Get member by ID error:', error);
      
      if (error.message === 'Member not found') {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch member',
        error: error.message
      });
    }
  }

  /**
   * Update a member
   * PUT /api/members/:id
   */
  async updateMember(req, res) {
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

      const { id } = req.params;
      const updateData = req.body;

      const result = await memberService.updateMember(parseInt(id), updateData);

      res.status(200).json(result);

    } catch (error) {
      console.error('Update member error:', error);
      
      if (error.message === 'Member not found') {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }

      if (error.message === 'Email already exists') {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update member',
        error: error.message
      });
    }
  }

  /**
   * Delete a member
   * DELETE /api/members/:id
   */
  async deleteMember(req, res) {
    try {
      const { id } = req.params;

      const result = await memberService.deleteMember(parseInt(id));

      res.status(200).json(result);

    } catch (error) {
      console.error('Delete member error:', error);
      
      if (error.message === 'Member not found') {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete member',
        error: error.message
      });
    }
  }

  /**
   * Get member statistics
   * GET /api/members/stats
   */
  async getMemberStats(req, res) {
    try {
      const result = await memberService.getMemberStats();

      res.status(200).json(result);

    } catch (error) {
      console.error('Get member stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch member statistics',
        error: error.message
      });
    }
  }

  /**
   * Get members for assignment (active doctors and dietitians)
   * GET /api/members/assignable
   */
  async getAssignableMembers(req, res) {
    try {
      const { role } = req.query;
      
      const result = await memberService.getAllMembers(100, 0, role);

      // Filter only active members
      const activeMembers = result.data.filter(member => member.isActive);

      res.status(200).json({
        success: true,
        data: activeMembers,
        pagination: {
          total: activeMembers.length,
          limit: 100,
          offset: 0,
          pages: 1
        }
      });

    } catch (error) {
      console.error('Get assignable members error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assignable members',
        error: error.message
      });
    }
  }
}

module.exports = new MembersController();
