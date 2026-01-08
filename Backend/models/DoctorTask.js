const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DoctorTask = sequelize.define('DoctorTask', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Reference to the task
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'task_id'
    // Removed foreign key reference to avoid sync order issues
  },
  // The doctor/member assigned to this task
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'doctor_id'
    // Removed foreign key reference to avoid sync order issues
  },
  // Assignment status: 'assigned', 'accepted', 'in_progress', 'completed', 'rejected'
  status: {
    type: DataTypes.ENUM('assigned', 'accepted', 'in_progress', 'completed', 'rejected'),
    defaultValue: 'assigned',
    field: 'status'
  },
  // Doctor's notes on the task
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // When the doctor accepted/started the task
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'started_at'
  },
  // When the doctor completed the task
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  // For referral tracking - count of successful referrals
  referralCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'referral_count'
  },
  // Progress percentage (0-100)
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Whether this assignment is active
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'doctor_tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['task_id']
    },
    {
      fields: ['doctor_id']
    },
    {
      fields: ['status']
    }
  ]
});

// Instance methods
DoctorTask.prototype.calculateProgress = function(task) {
  if (task && task.targetCount > 0) {
    const count = task.taskType === 'new_user' ? this.referralCount : task.currentCount;
    return Math.min(100, Math.round((count / task.targetCount) * 100));
  }
  return this.progress || 0;
};

module.exports = DoctorTask;

