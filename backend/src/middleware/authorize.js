/**
 * Role-based authorization middleware.
 * Must be used after auth middleware (req.user must be defined).
 * 
 * Hierarchy: admin > reviewer > reader
 * 
 * Usage:
 *   authorize('admin')    -> only admin
 *   authorize('reviewer') -> reviewer or admin
 *   authorize('reader')   -> reader, reviewer, or admin
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Wymagane logowanie' });
    }

    const userRole = req.user.role || 'reader';

    // Admin has access to everything
    if (userRole === 'admin') {
      return next();
    }

    // Reviewer has access if allowedRoles includes 'reviewer' or 'reader'
    if (userRole === 'reviewer' && (allowedRoles.includes('reviewer') || allowedRoles.includes('reader'))) {
      return next();
    }

    // Reader has access if allowedRoles includes 'reader'
    if (userRole === 'reader' && allowedRoles.includes('reader')) {
      return next();
    }

    // Explicit role match check
    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ error: 'Brak uprawnień do wykonania tej akcji' });
  };
};

module.exports = authorize;
