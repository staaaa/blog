const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All admin routes require admin role
router.use(authMiddleware, authorize('admin'));

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
