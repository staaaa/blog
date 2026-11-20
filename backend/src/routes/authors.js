const express = require('express');
const router = express.Router();
const authOptionalMiddleware = require('../middleware/authOptional');
const { getAuthorProfile } = require('../controllers/authorController');

// GET /api/authors/:username
router.get('/:username', authOptionalMiddleware, getAuthorProfile);

module.exports = router;
