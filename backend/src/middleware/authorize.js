const { User } = require('../models');

/**
 * Role-based authorization middleware.
 * Must be used after auth middleware (req.user must be defined).
 * Queries the database directly to ensure the user still exists and hasn't been demoted/banned.
 * 
 * Hierarchy: admin > reviewer > reader
 * 
 * Usage:
 *   authorize('admin')    -> only admin
 *   authorize('reviewer') -> reviewer or admin
 *   authorize('reader')   -> reader, reviewer, or admin
 */
const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Wymagane logowanie' });
    }

    try {
      // Query database to ensure account still exists and verify active role
      const dbUser = await User.findByPk(req.user.id, {
        attributes: ['id', 'username', 'role']
      });

      if (!dbUser) {
        return res.status(401).json({ error: 'Konto użytkownika nie istnieje lub zostało usunięte' });
      }

      const userRole = dbUser.role || 'reader';
      req.user.role = userRole;

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
    } catch (error) {
      console.error('Authorize error:', error);
      return res.status(500).json({ error: 'Błąd weryfikacji uprawnień' });
    }
  };
};

module.exports = authorize;
