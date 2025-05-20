const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', {
        id: decoded.id,
        role: decoded.role,
        iat: decoded.iat,
        tokenStructure: Object.keys(decoded)
    }); // Log token structure without sensitive data
    req.user = decoded;
    next();
  } catch (ex) {
    console.error('Auth middleware error:', ex.message);
    res.status(401).json({ message: 'Invalid token.' });
  }
}

module.exports = auth;
