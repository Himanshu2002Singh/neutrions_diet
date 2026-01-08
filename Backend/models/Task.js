const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Task title
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Task description
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Task type: 'daily', 'weekly', 'monthly', 'new_user'
  taskType: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'new_user'),
    allowNull: false,
    field: 'task_type'
  },
  // Priority: 'low', 'medium', 'high', 'urgent'
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  // Task status: 'pending', 'in_progress', 'completed', 'overdue', 'cancelled'
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue', 'cancelled'),
    defaultValue: 'pending',
    field: 'status'
  },
  // Due date for the task
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'due_date'
  },
  // For recurring tasks - next occurrence date
  nextOccurrence: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'next_occurrence'
  },
  // Completion date
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  // Deadline for task completion (for referral countdown timer)
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deadline'
  },
  // Target count for tasks like referral targets
  targetCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'target_count'
  },
  // Minutes per referral for countdown timer (default 1440 = 24 hours)
  referralTimerMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 1440,
    field: 'referral_timer_minutes'
  },
  // Last referral timestamp for timer tracking
  lastReferralAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_referral_at'
  },
  // Current progress count
  currentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'current_count'
  },
  // Whether the task is active
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  // Additional metadata as JSON
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['task_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['due_date']
    }
  ]
});

// Instance methods
Task.prototype.isOverdue = function() {
  if (this.dueDate && this.status !== 'completed') {
    return new Date() > new Date(this.dueDate);
  }
  return false;
};

Task.prototype.calculateProgress = function() {
  if (this.targetCount > 0) {
    return Math.min(100, Math.round((this.currentCount / this.targetCount) * 100));
  }
  return 0;
};

module.exports = Task;

