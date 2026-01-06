const express = require('express');
const { applyMiddleware, errorHandler, notFoundHandler } = require('./middleware');
const healthRoutes = require('./routes/health');
const membersRoutes = require('./routes/members');
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const referralRoutes = require('./routes/referral');
const chatRoutes = require('./routes/chat');
const { testConnection } = require('./config/database');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Apply middleware
applyMiddleware(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Neutrion Health API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/chat', chatRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Neutrion Health API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: {
        health: {
          submit: 'POST /api/health/submit/:userId',
          profile: 'GET /api/health/profile/:userId',
          history: 'GET /api/health/history/:userId',
          bmi: {
            calculate: 'POST /api/bmi/calculate',
            categories: 'GET /api/bmi/categories'
          },
          diet: {
            generate: 'POST /api/diet/generate/:bmiCalculationId',
            recommendations: 'GET /api/diet/recommendations/:userId'
          }
        },
        members: {
          create: 'POST /api/members',
          list: 'GET /api/members',
          get: 'GET /api/members/:id',
          update: 'PUT /api/members/:id',
          delete: 'DELETE /api/members/:id',
          stats: 'GET /api/members/stats',
          assignable: 'GET /api/members/assignable'
        },
        admin: {
          login: 'POST /api/admin/login',
          me: 'GET /api/admin/me',
          logout: 'POST /api/admin/logout',
          list: 'GET /api/admin',
          create: 'POST /api/admin',
          update: 'PUT /api/admin/:id',
          delete: 'DELETE /api/admin/:id'
        },
        referral: {
          generate: 'POST /api/referral/generate',
          myCode: 'GET /api/referral/my-code',
          apply: 'POST /api/referral/apply',
          myReferrals: 'GET /api/referral/my-referrals',
          stats: 'GET /api/referral/stats',
          admin: {
            all: 'GET /api/referral/admin/all',
            stats: 'GET /api/referral/admin/stats',
            userReferrals: 'GET /api/referral/admin/user/:userId'
          }
        }
      }
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models (creates tables if they don't exist)
    const { sequelize, User, HealthProfile, BMICalculation, DietRecommendation, Admin, Referral } = require('./models');
    
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ alter: false }); // Sync without altering to avoid key limit errors
    console.log('✅ Database models synced successfully');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Neutrion Health API server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📋 Available Endpoints:');
        console.log(`   POST http://localhost:${PORT}/api/health/submit/:userId`);
        console.log(`   GET  http://localhost:${PORT}/api/health/profile/:userId`);
        console.log(`   GET  http://localhost:${PORT}/api/health/history/:userId`);
        console.log(`   POST http://localhost:${PORT}/api/bmi/calculate`);
        console.log(`   GET  http://localhost:${PORT}/api/bmi/categories`);
        console.log(`   GET  http://localhost:${PORT}/api/diet/recommendations/:userId`);
        console.log(`   POST http://localhost:${PORT}/api/members`);
        console.log(`   GET  http://localhost:${PORT}/api/members`);
        console.log(`   GET  http://localhost:${PORT}/api/members/:id`);
        console.log(`   PUT  http://localhost:${PORT}/api/members/:id`);
        console.log(`   DELETE http://localhost:${PORT}/api/members/:id`);
        console.log(`   GET  http://localhost:${PORT}/api/members/stats`);
        console.log(`   GET  http://localhost:${PORT}/api/members/assignable`);
        console.log(`   POST http://localhost:${PORT}/api/admin/login`);
        console.log(`   GET  http://localhost:${PORT}/api/admin/me`);
        console.log(`   POST http://localhost:${PORT}/api/admin/logout`);
        console.log(`   GET  http://localhost:${PORT}/api/admin`);
        console.log(`   POST http://localhost:${PORT}/api/admin`);
        console.log(`   PUT  http://localhost:${PORT}/api/admin/:id`);
        console.log(`   DELETE http://localhost:${PORT}/api/admin/:id`);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  
  const { sequelize } = require('./models');
  await sequelize.close();
  
  console.log('✅ Database connection closed.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
  
  const { sequelize } = require('./models');
  await sequelize.close();
  
  console.log('✅ Database connection closed.');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

module.exports = app;

