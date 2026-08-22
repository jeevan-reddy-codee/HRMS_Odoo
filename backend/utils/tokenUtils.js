// Small wrapper around jsonwebtoken so controllers don't repeat sign/verify logic.
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/config');

function generateToken(payload) {
  // payload should be small, e.g. { userId, role }
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret); // throws if invalid/expired
}

module.exports = { generateToken, verifyToken };
