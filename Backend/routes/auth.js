const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const AuthController = require('../controllers/AuthController');

// Google OAuth routes
router.post('/google', AuthController.googleLogin);

// Google Identity Services credential handler (for GIS SDK)
router.post('/google/credential', async (req, res) => {
  const { credential } = req.body;
  
  if (!credential) {
    return res.status(400).json({ 
      success: false, 
      error: 'No credential token received' 
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(credential);
    
    if (!decoded || !decoded.email) {
      throw new Error('Invalid credential token');
    }

    const { User } = require('../models');

    let user = await User.findOne({ where: { googleId: decoded.sub } });

    if (!user) {
      user = await User.findOne({ where: { email: decoded.email } });
      
      if (user) {
        user.googleId = decoded.sub;
        user.googleAvatar = decoded.picture;
        user.isGoogleUser = true;
        user.lastLogin = new Date();
        await user.save();
      } else {
        const nameParts = decoded.name ? decoded.name.split(' ') : ['Google User'];
        user = await User.create({
          email: decoded.email,
          firstName: nameParts[0] || 'Google',
          lastName: nameParts.slice(1).join(' ') || 'User',
          googleId: decoded.sub,
          googleAvatar: decoded.picture,
          isGoogleUser: true,
          lastLogin: new Date()
        });
      }
    } else {
      user.lastLogin = new Date();
      if (decoded.picture && user.googleAvatar !== decoded.picture) {
        user.googleAvatar = decoded.picture;
      }
      await user.save();
    }

    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.firstName + ' ' + user.lastName,
          email: user.email,
          avatar: user.googleAvatar || decoded.picture,
          isGoogleUser: true,
          isActive: user.isActive
        },
        token: token
      }
    });
  } catch (error) {
    console.error('Credential validation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Authentication failed' 
    });
  }
});

// OAuth callback route for popup flow
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.send(`
      <script>
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'GOOGLE_AUTH_ERROR', 
            error: 'No authorization code received' 
          }, '*');
          window.close();
        } else {
          window.parent.postMessage({ 
            type: 'GOOGLE_AUTH_ERROR', 
            error: 'No authorization code received' 
          }, '*');
        }
      </script>
      <h1>Authentication Failed</h1>
      <p>No authorization code received from Google.</p>
      <button onclick="window.close()">Close</button>
    `);
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code.toString(),
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
      }),
    });

    const tokenData = await response.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenData.access_token}`);
    const userInfo = await userInfoResponse.json();

    const idTokenResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenData.id_token}`);
    const idTokenInfo = await idTokenResponse.json();

    const { User } = require('../models');
    const jwt = require('jsonwebtoken');

    let user = await User.findOne({ where: { googleId: idTokenInfo.sub } });

    if (!user) {
      user = await User.findOne({ where: { email: userInfo.email } });
      
      if (user) {
        user.googleId = idTokenInfo.sub;
        user.googleAvatar = userInfo.picture;
        user.isGoogleUser = true;
        user.lastLogin = new Date();
        await user.save();
      } else {
        const nameParts = userInfo.name ? userInfo.name.split(' ') : ['Google User'];
        user = await User.create({
          email: userInfo.email,
          firstName: nameParts[0] || 'Google',
          lastName: nameParts.slice(1).join(' ') || 'User',
          googleId: idTokenInfo.sub,
          googleAvatar: userInfo.picture,
          isGoogleUser: true,
          lastLogin: new Date()
        });
      }
    } else {
      user.lastLogin = new Date();
      if (userInfo.picture && user.googleAvatar !== userInfo.picture) {
        user.googleAvatar = userInfo.picture;
      }
      await user.save();
    }

    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Login Successful</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: #f5f5f5;
          }
          .success { color: #4CAF50; }
          .loading { color: #666; }
        </style>
      </head>
      <body>
        <h1 class="loading">Setting up your account...</h1>
        <p>Please wait while we complete your sign in.</p>
        <script>
          const userData = ${JSON.stringify({
            id: user.id,
            name: user.firstName + ' ' + user.lastName,
            email: user.email,
            avatar: user.googleAvatar || userInfo.picture,
            isGoogleUser: true,
            isActive: user.isActive
          })};
          
          const token = '${token}';
          
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'GOOGLE_AUTH_SUCCESS', 
              user: userData,
              token: token
            }, '*');
            setTimeout(() => window.close(), 1000);
          } else if (window.parent !== window) {
            window.parent.postMessage({ 
              type: 'GOOGLE_AUTH_SUCCESS', 
              user: userData,
              token: token
            }, '*');
            setTimeout(() => window.close(), 1000);
          } else {
            const frontendUrl = '${process.env.FRONTEND_URL || 'http://localhost:5173'}';
            window.location.href = frontendUrl + '?auth=success&token=' + token;
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Failed</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: #f5f5f5;
          }
          .error { color: #f44336; }
        </style>
      </head>
      <body>
        <h1 class="error">Authentication Failed</h1>
        <p>${error.message}</p>
        <button onclick="window.close()">Close</button>
        <script>
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'GOOGLE_AUTH_ERROR', 
              error: '${error.message}' 
            }, '*');
          } else {
            alert('Authentication failed: ${error.message}');
          }
        </script>
      </body>
      </html>
    `);
  }
});

// Get current user (requires authentication)
router.get('/me', auth, AuthController.getMe);

// Logout
router.post('/logout', auth, AuthController.logout);

module.exports = router;

