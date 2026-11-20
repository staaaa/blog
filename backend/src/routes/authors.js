const express = require('express');
const router = express.Router();
const authOptionalMiddleware = require('../middleware/authOptional');
const { getAuthorProfile, getAllAuthors } = require('../controllers/authorController');

// GET /api/authors - List all reviewers
router.get('/', getAllAuthors);

// GET /api/authors/:username - Author profile
router.get('/:username', authOptionalMiddleware, getAuthorProfile);

module.exports = router;
