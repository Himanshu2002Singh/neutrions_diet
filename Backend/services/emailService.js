const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'nutreazyinfo@gmail.com',
      pass: process.env.EMAIL_PASS || 'ofhl qhhm bpai qqgu'
    }
  });
};

/**
 * Send welcome email to new doctor/dietitian
 * @param {Object} member - Member details
 * @param {string} password - Plain text password
 */
const sendMemberWelcomeEmail = async (member, password) => {
  try {
    const transporter = createTransporter();
    
    const categoryText = member.category === 'doctor' ? 'Doctor' : 'Dietitian';
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'nutreazyinfo@gmail.com',
      to: member.email,
      subject: `Welcome to Neutrion - ${categoryText} Account Created`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Neutrion!</h2>
          <p>Dear ${member.firstName} ${member.lastName},</p>
          
          <p>Your ${categoryText} account has been created successfully. Here are your login credentials:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${member.email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p><strong>Category:</strong> ${categoryText}</p>
          </div>
          
          <p><strong>Important:</strong> Please change your password after first login for security.</p>
          
          <p>You can login at: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">${process.env.FRONTEND_URL || 'http://localhost:5173'}</a></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            Neutrion Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${member.email}`);
    return { success: true, message: 'Email sent successfully' };
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'nutreazyinfo@gmail.com',
      to: email,
      subject: 'Neutrion - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>You have requested to reset your password. Click the button below to reset it:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280;">This link will expire in 1 hour.</p>
          
          <p>If you didn't request this, please ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            Neutrion Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return { success: true, message: 'Email sent successfully' };
    
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Verify email configuration
 */
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('Email configuration error:', error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendMemberWelcomeEmail,
  sendPasswordResetEmail,
  verifyEmailConfig
};

