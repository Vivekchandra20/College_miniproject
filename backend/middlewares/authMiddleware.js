/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 * 
 * Expected header format: Authorization: Bearer <JWT_TOKEN>
 */

const jwt = require('jsonwebtoken');

/**
 * Verify JWT token and attach user to request
 * @middleware
 * @returns {void} Calls next() if token is valid, responds with 401 if invalid
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header
    // Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.error('[Auth] Missing Authorization header');
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided. Use format: Authorization: Bearer <token>',
      });
    }

    // Split header and extract token
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.error('[Auth] Invalid Authorization header format:', authHeader.substring(0, 10));
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Use: Authorization: Bearer <token>',
      });
    }

    const token = parts[1];

    if (!token) {
      console.error('[Auth] Token is empty in Authorization header');
      return res.status(401).json({
        success: false,
        message: 'Token is empty',
      });
    }

    // Verify JWT_SECRET is configured
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[Auth] JWT_SECRET is not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET not set',
      });
    }

    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtError) {
      console.error('[Auth] JWT verification failed:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: jwtError.message,
      });
    }

    // Validate decoded token structure
    if (!decoded.userId) {
      console.error('[Auth] Token payload missing userId');
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
      });
    }

    // Attach user info to request
    req.userId = decoded.userId;
    req.userData = decoded;
    
    console.log(`[Auth] User authenticated: ${req.userId} | Path: ${req.method} ${req.path}`);

    next();
  } catch (error) {
    console.error('[Auth] Unexpected middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
    });
  }
};

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  authMiddleware,
  protect: authMiddleware,
  generateToken,
};
