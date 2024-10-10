const jwt = require('jsonwebtoken');
const { encrypt, decrypt, verifyPassword } = require('../utils/encryption');
const { User } = require('../models/User');
const { logEvent } = require('../utils/logger');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '1h';

// Validate JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('Invalid JWT_SECRET. It must be at least 32 characters long.');
}

/**
 * Generates a JWT token for a user
 * @param {Object} user - User object
 * @returns {string} JWT token
 * @throws {Error} If token generation fails
 */
const generateToken = (user) => {
  try {
    if (!user || !user.id || !user.phoneNumber) {
      throw new Error('Invalid user object');
    }

    const payload = {
      id: user.id,
      phoneNumber: encrypt(user.phoneNumber)
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
  } catch (error) {
    logEvent('error', 'Failed to generate token', { userId: user?.id, error: error.message }, false);
    throw new Error('Token generation failed');
  }
};

/**
 * Verifies a JWT token and returns the decoded payload
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token verification fails
 */
const verifyToken = (token) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    logEvent('error', 'Token verification failed', { error: error.message }, false);
    throw new Error('Invalid token');
  }
};

/**
 * Middleware function to authenticate requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid authorization header format' });
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Decrypt the phone number from the token and compare with the user's phone number
    const decryptedPhoneNumber = decrypt(decoded.phoneNumber);
    if (decryptedPhoneNumber !== user.phoneNumber) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    logEvent('error', 'Authentication failed', { error: error.message }, true);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = {
  generateToken,
  authenticate
};

// Security considerations addressed:
// 1. Input validation for JWT_SECRET
// 2. Proper error handling and logging
// 3. Secure token generation and verification
// 4. Phone number encryption in token payload
// 5. Thorough token and user validation in authenticate middleware
// 6. Use of environment variables for sensitive data
// 7. Proper use of HTTP status codes
// 8. Clear and informative error messages