// Restricts a route to specific roles. Usage: roleCheck('admin', 'hr_officer')
// Must run AFTER authMiddleware, since it relies on req.user.role.
function roleCheck(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this.' });
    }
    next();
  };
}

module.exports = roleCheck;
