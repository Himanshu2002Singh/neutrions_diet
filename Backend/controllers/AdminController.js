const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

// Generate JWT token for admin
const generateToken = (admin) => {
  return jwt.sign(
    { 
      id: admin.id,
      email: admin.email,
      role: admin.role
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Admin login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Simple plain text password comparison (no bcrypt)
    const isMatch = admin.password === password;

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(admin);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: {
          id: admin.id,
          name: admin.getFullName(),
          email: admin.email,
          role: admin.role,
          category: admin.category,
          isActive: admin.isActive
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin login failed',
      error: error.message
    });
  }
};

// Get current admin
const getMe = async (req, res) => {
  try {
    const admin = req.admin;
    
    res.json({
      success: true,
      data: {
        id: admin.id,
        name: admin.getFullName(),
        email: admin.email,
        role: admin.role,
        category: admin.category,
        isActive: admin.isActive,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin info'
    });
  }
};

// Logout
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Create new admin (admin only)
const create = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, category } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate category based on role
    if (role === 'admin') {
      // Admin cannot have a category
      if (category) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be set for admin role'
        });
      }
    } else if (role === 'member') {
      // Member must have a category (doctor or dietitian)
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category is required for member role (must be "doctor" or "dietitian")'
        });
      }
      if (!['doctor', 'dietitian'].includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Category must be either "doctor" or "dietitian"'
        });
      }
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    const admin = await Admin.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'member',
      category: role === 'member' ? category : null
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        id: admin.id,
        name: admin.getFullName(),
        email: admin.email,
        role: admin.role,
        category: admin.category
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message
    });
  }
};

// Get all admins (admin only)
const getAll = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admins'
    });
  }
};

// Update admin
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, category, isActive } = req.body;

    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Validate category based on role
    if (category !== undefined) {
      if (role === 'admin' || admin.role === 'admin') {
        // Admin cannot have a category
        if (category !== null) {
          return res.status(400).json({
            success: false,
            message: 'Category cannot be set for admin role'
          });
        }
      } else if (role === 'member' || admin.role === 'member') {
        // Member must have a category
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Category is required for member role'
          });
        }
        if (!['doctor', 'dietitian'].includes(category)) {
          return res.status(400).json({
            success: false,
            message: 'Category must be either "doctor" or "dietitian"'
          });
        }
      }
    }

    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (role) admin.role = role;
    if (category !== undefined) admin.category = category;
    if (typeof isActive === 'boolean') admin.isActive = isActive;

    await admin.save();

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: {
        id: admin.id,
        name: admin.getFullName(),
        email: admin.email,
        role: admin.role,
        category: admin.category,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin',
      error: error.message
    });
  }
};

// Delete admin
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    await admin.destroy();

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin',
      error: error.message
    });
  }
};

module.exports = {
  login,
  getMe,
  logout,
  create,
  getAll,
  update,
  remove
};

