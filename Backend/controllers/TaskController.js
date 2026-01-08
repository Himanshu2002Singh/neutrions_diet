const { Op } = require('sequelize');
const { Task, DoctorTask, Admin, User, Referral } = require('../models');

// Helper to calculate task progress
const calculateProgress = (doctorTask, task) => {
  if (task.taskType === 'new_user' && task.targetCount > 0) {
    return Math.min(100, Math.round((doctorTask.referralCount / task.targetCount) * 100));
  }
  return doctorTask.progress || 0;
};

// Helper to calculate countdown timer for referral task
const calculateCountdown = (doctorTask, task) => {
  if (task.taskType !== 'new_user' || !task.deadline) {
    return null;
  }

  const now = new Date();
  const deadline = new Date(task.deadline);
  
  // Calculate remaining time
  const remainingMs = deadline.getTime() - now.getTime();
  
  if (remainingMs <= 0) {
    return {
      isExpired: true,
      display: '00:00:00',
      remainingMs: 0
    };
  }

  // Convert to hours, minutes, seconds
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    isExpired: false,
    display,
    remainingMs
  };
};

// Helper to check and auto-complete task if target reached and deadline passed
const checkAutoComplete = async (doctorTask, task) => {
  if (task.taskType !== 'new_user') {
    return false;
  }

  // Check if target is reached
  const targetReached = task.targetCount > 0 && doctorTask.referralCount >= task.targetCount;
  
  // Check if deadline has passed
  const deadlinePassed = task.deadline && new Date(task.deadline) < new Date();

  // Auto-complete only if target reached AND deadline passed
  if (targetReached && deadlinePassed && doctorTask.status !== 'completed') {
    doctorTask.status = 'completed';
    doctorTask.completedAt = new Date();
    doctorTask.progress = 100;
    await doctorTask.save();
    
    // Update main task status
    const allAssignments = await DoctorTask.findAll({
      where: { taskId: task.id, isActive: true }
    });
    const completedCount = allAssignments.filter(a => a.status === 'completed').length;
    if (completedCount === allAssignments.length) {
      task.status = 'completed';
      task.completedAt = new Date();
      await task.save();
    }
    
    return true;
  }
  
  return false;
};

// Helper to check and update overdue tasks
const checkOverdueTasks = async () => {
  const overdueTasks = await Task.findAll({
    where: {
      status: { [Op.in]: ['pending', 'in_progress'] },
      dueDate: { [Op.lt]: new Date() },
      isActive: true
    }
  });

  for (const task of overdueTasks) {
    task.status = 'overdue';
    await task.save();
  }

  return overdueTasks.length;
};

/**
 * Create a new task
 * POST /api/tasks
 */
const createTask = async (req, res) => {
  try {
    const { title, description, taskType, priority, dueDate, deadline, targetCount, referralTimerMinutes, metadata } = req.body;

    if (!title || !taskType) {
      return res.status(400).json({
        success: false,
        message: 'Title and task type are required'
      });
    }

    // Calculate next occurrence for recurring tasks
    let nextOccurrence = null;
    const now = new Date();
    
    if (taskType === 'daily') {
      nextOccurrence = new Date(now.setDate(now.getDate() + 1));
    } else if (taskType === 'weekly') {
      nextOccurrence = new Date(now.setDate(now.getDate() + 7));
    } else if (taskType === 'monthly') {
      nextOccurrence = new Date(now.setMonth(now.getMonth() + 1));
    }

    const task = await Task.create({
      title,
      description,
      taskType,
      priority: priority || 'medium',
      dueDate,
      deadline, // New deadline field for referral countdown
      nextOccurrence,
      targetCount: targetCount || 1,
      referralTimerMinutes: referralTimerMinutes || 1440, // Default 24 hours per referral
      metadata: metadata || {}
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
};

/**
 * Get all tasks
 * GET /api/tasks
 */
const getAllTasks = async (req, res) => {
  try {
    const { status, taskType, priority, page = 1, limit = 20 } = req.query;
    
    const whereClause = { isActive: true };
    
    if (status) whereClause.status = status;
    if (taskType) whereClause.taskType = taskType;
    if (priority) whereClause.priority = priority;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: tasks } = await Task.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: tasks,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tasks',
      error: error.message
    });
  }
};

/**
 * Get a single task
 * GET /api/tasks/:id
 */
const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [{
        model: DoctorTask,
        as: 'doctorAssignments',
        include: [{
          model: Admin,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName', 'email', 'category']
        }]
      }]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get task',
      error: error.message
    });
  }
};

/**
 * Update a task
 * PUT /api/tasks/:id
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, taskType, priority, status, dueDate, targetCount, metadata } = req.body;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (taskType) task.taskType = taskType;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;
    if (targetCount !== undefined) task.targetCount = targetCount;
    if (metadata !== undefined) task.metadata = metadata;

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
};

/**
 * Delete a task (soft delete)
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.isActive = false;
    await task.save();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};

/**
 * Assign a task to a doctor
 * POST /api/tasks/:id/assign
 */
const assignTaskToDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId, notes } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
    }

    // Check if task exists
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if doctor exists
    const doctor = await Admin.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if already assigned
    const existingAssignment = await DoctorTask.findOne({
      where: {
        taskId: id,
        doctorId,
        isActive: true
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Task is already assigned to this doctor'
      });
    }

    // Create the assignment
    const doctorTask = await DoctorTask.create({
      taskId: id,
      doctorId,
      notes,
      status: 'assigned'
    });

    // Update task status if it's the first assignment
    const assignmentCount = await DoctorTask.count({ where: { taskId: id, isActive: true } });
    if (assignmentCount === 1 && task.status === 'pending') {
      task.status = 'in_progress';
      await task.save();
    }

    res.status(201).json({
      success: true,
      message: 'Task assigned to doctor successfully',
      data: doctorTask
    });

  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign task',
      error: error.message
    });
  }
};

/**
 * Get tasks assigned to a doctor
 * GET /api/tasks/doctor/:doctorId
 */
const getDoctorTasks = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const whereClause = { doctorId, isActive: true };
    if (status) whereClause.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: doctorTasks } = await DoctorTask.findAndCountAll({
      where: whereClause,
      include: [{
        model: Task,
        as: 'task'
      }],
      order: [
        [{ model: Task, as: 'task' }, 'dueDate', 'ASC'],
        ['created_at', 'DESC']
      ],
      limit: parseInt(limit),
      offset
    });

    // Add progress calculation and countdown
    const tasksWithProgress = doctorTasks.map(dt => {
      const taskData = dt.toJSON();
      taskData.progress = calculateProgress(dt, dt.task);
      taskData.task.progress = taskData.progress;
      // Add countdown info for referral tasks
      taskData.countdown = calculateCountdown(dt, dt.task);
      taskData.task.countdown = taskData.countdown;
      return taskData;
    });

    res.json({
      success: true,
      data: tasksWithProgress,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get doctor tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor tasks',
      error: error.message
    });
  }
};

/**
 * Update doctor task status
 * PUT /api/tasks/doctor/:doctorTaskId/status
 */
const updateDoctorTaskStatus = async (req, res) => {
  try {
    const { doctorTaskId } = req.params;
    const { status, notes, progress } = req.body;

    const doctorTask = await DoctorTask.findByPk(doctorTaskId, {
      include: [{ model: Task, as: 'task' }]
    });

    if (!doctorTask) {
      return res.status(404).json({
        success: false,
        message: 'Doctor task not found'
      });
    }

    if (status) {
      doctorTask.status = status;
      
      if (status === 'in_progress') {
        doctorTask.startedAt = new Date();
      } else if (status === 'completed') {
        doctorTask.completedAt = new Date();
        doctorTask.progress = 100;
      }
    }

    if (notes !== undefined) doctorTask.notes = notes;
    if (progress !== undefined) doctorTask.progress = progress;

    await doctorTask.save();

    // Check for auto-completion (target reached AND deadline passed)
    await checkAutoComplete(doctorTask, doctorTask.task);

    // Update main task status based on all assignments
    const allAssignments = await DoctorTask.findAll({
      where: { taskId: doctorTask.taskId, isActive: true }
    });

    const completedCount = allAssignments.filter(a => a.status === 'completed').length;
    const totalCount = allAssignments.length;

    if (completedCount === totalCount) {
      doctorTask.task.status = 'completed';
      doctorTask.task.completedAt = new Date();
      await doctorTask.task.save();
    }

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: {
        ...doctorTask.toJSON(),
        progress: calculateProgress(doctorTask, doctorTask.task)
      }
    });

  } catch (error) {
    console.error('Update doctor task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message
    });
  }
};

/**
 * Get all doctors/members
 * GET /api/tasks/doctors
 */
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Admin.findAll({
      where: { role: 'member', isActive: true },
      attributes: ['id', 'firstName', 'lastName', 'email', 'category']
    });

    res.json({
      success: true,
      data: doctors
    });

  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctors',
      error: error.message
    });
  }
};

/**
 * Get task statistics
 * GET /api/tasks/stats
 */
const getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.count({ where: { isActive: true } });
    const pendingTasks = await Task.count({ where: { status: 'pending', isActive: true } });
    const inProgressTasks = await Task.count({ where: { status: 'in_progress', isActive: true } });
    const completedTasks = await Task.count({ where: { status: 'completed', isActive: true } });
    const overdueTasks = await Task.count({ 
      where: { 
        status: 'overdue', 
        isActive: true 
      } 
    });

    // Check and update overdue tasks
    const updatedCount = await checkOverdueTasks();

    res.json({
      success: true,
      data: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks + updatedCount
      }
    });

  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get task statistics',
      error: error.message
    });
  }
};

/**
 * Update referral count for a doctor task (called when a user logs in via referral)
 * POST /api/tasks/doctor/:doctorId/referral
 */
const updateReferralCount = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { referralCode } = req.body;

    // Find doctor tasks that are for new_user referrals
    const doctorTasks = await DoctorTask.findAll({
      where: {
        doctorId,
        isActive: true,
        status: { [Op.in]: ['assigned', 'accepted', 'in_progress'] }
      },
      include: [{
        model: Task,
        as: 'task',
        where: {
          taskType: 'new_user',
          isActive: true
        }
      }]
    });

    let updatedTasks = [];

    for (const doctorTask of doctorTasks) {
      // Increment referral count
      doctorTask.referralCount += 1;
      
      // Calculate new progress
      const progress = calculateProgress(doctorTask, doctorTask.task);
      doctorTask.progress = progress;

      // Check if target is reached
      if (progress >= 100 && doctorTask.status !== 'completed') {
        doctorTask.status = 'completed';
        doctorTask.completedAt = new Date();
      }

      await doctorTask.save();
      updatedTasks.push(doctorTask);
    }

    res.json({
      success: true,
      message: 'Referral count updated',
      data: {
        tasksUpdated: updatedTasks.length,
        tasks: updatedTasks.map(t => ({
          id: t.id,
          referralCount: t.referralCount,
          progress: t.progress,
          status: t.status
        }))
      }
    });

  } catch (error) {
    console.error('Update referral count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update referral count',
      error: error.message
    });
  }
};

/**
 * Get referrals for a doctor (users who signed up using the doctor's referral code)
 * GET /api/tasks/doctor/:doctorId/referrals
 */
const getDoctorReferrals = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Find all referrals where this doctor was the referrer
    // We need to find users who have this doctor's referral code in their referredByUserId
    const referredUsers = await User.findAll({
      where: {
        referredByUserId: doctorId
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'createdAt', 'referralCode']
    });

    // Also get referrals from the Referral table for more details
    const referralRecords = await Referral.findAll({
      where: {
        referrerUserId: doctorId,
        status: 'completed'
      },
      order: [['referredAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        totalReferrals: referredUsers.length,
        referrals: referredUsers.map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone || null,
          joinedAt: user.createdAt,
          referralCode: user.referralCode
        }))
      }
    });

  } catch (error) {
    console.error('Get doctor referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referrals',
      error: error.message
    });
  }
};

/**
 * Get doctor's referral code
 * GET /api/tasks/doctor/:doctorId/referral-code
 */
const getDoctorReferralCode = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Admin.findByPk(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Generate referral code if not exists
    if (!doctor.referralCode) {
      const shortName = doctor.firstName.substring(0, 3).toUpperCase();
      const uniqueCode = `DR-${shortName}-${doctor.id}-${Date.now().toString(36).toUpperCase()}`;
      doctor.referralCode = uniqueCode;
      await doctor.save();
    }

    res.json({
      success: true,
      data: {
        referralCode: doctor.referralCode,
        doctorName: doctor.getFullName()
      }
    });

  } catch (error) {
    console.error('Get doctor referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral code',
      error: error.message
    });
  }
};

/**
 * Create a referral invitation
 * POST /api/tasks/doctor/:doctorId/referral-invite
 */
const createReferralInvite = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { name, email, taskId } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Get doctor's referral code
    const doctor = await Admin.findByPk(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Generate referral code if not exists
    if (!doctor.referralCode) {
      const shortName = doctor.firstName.substring(0, 3).toUpperCase();
      const uniqueCode = `DR-${shortName}-${doctor.id}-${Date.now().toString(36).toUpperCase()}`;
      doctor.referralCode = uniqueCode;
      await doctor.save();
    }

    // Create a pending referral record
    const referral = await Referral.create({
      referrerUserId: doctorId,
      referrerType: 'doctor',
      referredName: name,
      referredEmail: email,
      referralCode: doctor.referralCode,
      status: 'pending',
      metadata: {
        taskId: taskId || null
      }
    });

    // TODO: Send invitation email to the referred user

    res.status(201).json({
      success: true,
      message: 'Referral invitation sent successfully',
      data: {
        referralCode: doctor.referralCode,
        referralId: referral.id,
        doctorName: doctor.getFullName()
      }
    });

  } catch (error) {
    console.error('Create referral invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send referral invitation',
      error: error.message
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  deleteTask,
  assignTaskToDoctor,
  getDoctorTasks,
  updateDoctorTaskStatus,
  getAllDoctors,
  getTaskStats,
  updateReferralCount,
  checkOverdueTasks,
  getDoctorReferrals,
  getDoctorReferralCode,
  createReferralInvite
};

