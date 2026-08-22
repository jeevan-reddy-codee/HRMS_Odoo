// Checks that a request carries a valid JWT before letting it reach the route.
// Attaches the decoded { userId, role } to req.user for downstream use.
const { verifyToken } = require('../utils/tokenUtils');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = verifyToken(token); // { userId, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid. Please sign in again.' });
  }
}

module.exports = authMiddleware;
