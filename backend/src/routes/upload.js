const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { cleanupOrphanedUploads } = require('../utils/cleanupUploads');

// Upload single image (any authenticated user)
router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nie przesłano pliku' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Błąd podczas przesyłania pliku' });
  }
});

// Cleanup unused images endpoint (admin only)
router.post('/cleanup', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const result = await cleanupOrphanedUploads(15 * 60 * 1000); // 15 mins grace period
    res.json(result);
  } catch (error) {
    console.error('Upload cleanup route error:', error);
    res.status(500).json({ error: 'Błąd podczas czyszczenia plików' });
  }
});

module.exports = router;
