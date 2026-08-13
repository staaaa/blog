const jwt = require('jsonwebtoken');

const authOptionalMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Ignore token errors, treat as guest/anonymous
    }
  }
  
  next();
};

module.exports = authOptionalMiddleware;
