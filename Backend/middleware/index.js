const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('../models');

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176'
    ];
    
    // Add environment-based origins
    if (process.env.ALLOWED_ORIGINS) {
      const envOrigins = process.env.ALLOWED_ORIGINS.split(',');
      allowedOrigins.push(...envOrigins);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: message || 'Too many requests from this IP, please try again later.',
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// General rate limiter
const generalLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiter for health calculations
const healthCalculationLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  20, // limit each IP to 20 health calculations per 5 minutes
  'Too many health calculations from this IP, please try again later.'
);

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Resource already exists',
      error: err.message
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Database connection error
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    console.error('Database connection error:', err);
    return res.status(503).json({
      success: false,
      message: 'Database connection error',
      error: 'Service temporarily unavailable. Please try again later.'
    });
  }

  // Handle specific Sequelize errors
  if (err.name === 'SequelizeDatabaseError') {
    console.error('Database error:', err);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred while processing your request'
    });
  }

  // Handle timeout errors
  if (err.message && err.message.includes('timeout')) {
    console.error('Query timeout:', err);
    return res.status(504).json({
      success: false,
      message: 'Request timeout',
      error: 'The database query timed out. Please try again.'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err.message 
    })
  });
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

// Request logging middleware
const requestLogger = morgan('combined');

// Database connection middleware
const dbMiddleware = async (req, res, next) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    // Allow request to proceed even without DB connection
    // This prevents the 404 error
    next();
  }
};

// Apply middleware
const applyMiddleware = (app) => {
  // Security middleware
  app.use(helmet());
  app.use(cors(corsOptions));
  
  // Request processing middleware
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Logging middleware
  if (process.env.NODE_ENV !== 'test') {
    app.use(requestLogger);
  }
  
  // Rate limiting middleware
  app.use('/api/', generalLimiter);
  
  // Health-specific rate limiting (applies to health calculation endpoints)
  app.use('/api/bmi/', healthCalculationLimiter);
  
  // Database middleware
  app.use(dbMiddleware);
};

module.exports = {
  applyMiddleware,
  errorHandler,
  notFoundHandler,
  createRateLimiter
};

