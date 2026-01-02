const jwt = require('jsonwebtoken');
const { User, Referral } = require('../models');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate a unique referral code
const generateUniqueReferralCode = async () => {
  const crypto = require('crypto');
  const length = 8;
  let code;
  let exists = true;
  
  while (exists) {
    code = 'REF' + crypto.randomBytes(length).toString('hex').substring(0, length).toUpperCase();
    const existingUser = await User.findOne({ where: { referralCode: code } });
    const existingReferral = await Referral.findOne({ where: { referralCode: code } });
    exists = existingUser || existingReferral;
  }
  
  return code;
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Verify Google ID token and login/register user
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture: avatar } = payload;

    // Check if user exists with this Google ID
    let user = await User.findOne({ where: { googleId } });

    if (!user) {
      // Check if user exists with this email
      user = await User.findOne({ where: { email } });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.googleAvatar = avatar;
        user.isGoogleUser = true;
        user.lastLogin = new Date();
        await user.save();
      } else {
        // Create new user with referral code
        const nameParts = name ? name.split(' ') : ['Google User'];
        const firstName = nameParts[0] || 'Google';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        // Generate unique referral code for the new user
        const referralCode = await generateUniqueReferralCode();

        user = await User.create({
          email,
          firstName,
          lastName,
          googleId,
          googleAvatar: avatar,
          isGoogleUser: true,
          lastLogin: new Date(),
          referralCode: referralCode
        });

        // Create a referral record for tracking
        await Referral.create({
          referralCode: referralCode,
          referrerUserId: user.id,
          status: 'pending'
        });
      }
    } else {
      // Update last login and avatar
      user.lastLogin = new Date();
      if (avatar && user.googleAvatar !== avatar) {
        user.googleAvatar = avatar;
      }
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          avatar: user.googleAvatar || avatar,
          isGoogleUser: user.isGoogleUser,
          isActive: user.isActive
        },
        token
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Google login failed',
      error: error.message
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        avatar: user.googleAvatar || null,
        isGoogleUser: user.isGoogleUser,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user info'
    });
  }
};

// Logout (client-side will handle token removal)
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  googleLogin,
  getMe,
  logout
};

