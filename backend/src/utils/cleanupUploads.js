const path = require('path');
const fs = require('fs');
const { Review } = require('../models');

const getUploadsDir = () => process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');

/**
 * Removes orphaned image files from uploads directory that are no longer referenced in any review.
 * @param {number} gracePeriodMs Minimum age in ms for a file to be eligible for deletion (default: 15 mins).
 */
const cleanupOrphanedUploads = async (gracePeriodMs = 15 * 60 * 1000) => {
  const uploadsDir = getUploadsDir();
  if (!fs.existsSync(uploadsDir)) {
    return { deletedCount: 0, freedBytes: 0, deletedFiles: [] };
  }

  const filesOnDisk = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
  if (filesOnDisk.length === 0) {
    return { deletedCount: 0, freedBytes: 0, deletedFiles: [] };
  }

  const reviews = await Review.findAll({
    attributes: ['coverImage', 'content']
  });

  const usedFiles = new Set();

  for (const review of reviews) {
    if (review.coverImage) {
      const match = review.coverImage.match(/uploads\/([^?#]+)/);
      if (match && match[1]) {
        usedFiles.add(path.basename(match[1]));
      } else if (!review.coverImage.startsWith('http')) {
        usedFiles.add(path.basename(review.coverImage));
      }
    }

    if (review.content) {
      const regex = /\/uploads\/([a-zA-Z0-9_\.\-]+)/g;
      let match;
      while ((match = regex.exec(review.content)) !== null) {
        if (match[1]) {
          usedFiles.add(path.basename(match[1]));
        }
      }
    }
  }

  const now = Date.now();
  const deletedFiles = [];
  let freedBytes = 0;

  for (const file of filesOnDisk) {
    if (!usedFiles.has(file)) {
      const filePath = path.join(uploadsDir, file);
      try {
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > gracePeriodMs) {
          freedBytes += stats.size;
          fs.unlinkSync(filePath);
          deletedFiles.push(file);
        }
      } catch (err) {
        console.error(`[Cleanup] Error checking/deleting file ${file}:`, err);
      }
    }
  }

  return {
    deletedCount: deletedFiles.length,
    freedBytes,
    freedMb: (freedBytes / (1024 * 1024)).toFixed(2),
    deletedFiles
  };
};

module.exports = {
  cleanupOrphanedUploads,
  getUploadsDir
};
