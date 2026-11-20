const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Whitelist of allowed MIME types and their safe extensions
const MIME_EXTENSION_MAP = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Secure: determine extension from validated MIME type, NOT user-supplied originalname
    const safeExt = MIME_EXTENSION_MAP[file.mimetype] || '.png';
    cb(null, `${uniqueSuffix}${safeExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Reject dangerous extensions even if MIME was spoofed
  const originalExt = path.extname(file.originalname || '').toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  if (!MIME_EXTENSION_MAP[file.mimetype]) {
    return cb(new Error('Nieobsługiwany format pliku. Dozwolone: JPEG, PNG, GIF, WebP'), false);
  }

  if (originalExt && !allowedExtensions.includes(originalExt)) {
    return cb(new Error('Niedozwolone rozszerzenie pliku.'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;
