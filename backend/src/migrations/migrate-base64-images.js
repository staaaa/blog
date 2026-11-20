/**
 * One-time / on-startup migration: Converts all base64 images stored inside Review.content
 * into real image files in uploadsDir, replacing data URIs with /uploads/<filename>.
 * 
 * This reduces database size, prevents giant API payloads (like Moldrise 36MB),
 * and speeds up page load dramatically.
 * 
 * Idempotent: Only processes reviews where content LIKE '%data:image/%'.
 */

const { Op } = require('sequelize');
const { Review, sequelize } = require('../models');
const { extractAndSaveBase64Images } = require('../utils/base64Helper');

const migrateBase64Images = async () => {
  try {
    const reviewsWithBase64 = await Review.findAll({
      where: {
        content: {
          [Op.like]: '%data:image/%'
        }
      }
    });

    if (reviewsWithBase64.length === 0) {
      console.log('ℹ️  [Base64 Migration] No reviews with base64 images found in database.');
      return;
    }

    console.log(`🔄 [Base64 Migration] Found ${reviewsWithBase64.length} review(s) with base64 images. Starting conversion...`);

    let totalImages = 0;
    let totalBytesSaved = 0;

    for (const review of reviewsWithBase64) {
      const { content: newContent, convertedCount, bytesSaved } = await extractAndSaveBase64Images(review.content);

      if (convertedCount > 0) {
        await review.update({ content: newContent });
        totalImages += convertedCount;
        totalBytesSaved += bytesSaved;
        console.log(`✅ [Base64 Migration] Review #${review.id} ("${review.title}"): converted ${convertedCount} image(s), saved ${(bytesSaved / (1024 * 1024)).toFixed(2)} MB`);
      }
    }

    console.log(`🎉 [Base64 Migration] Complete! Total images converted: ${totalImages}, Total data reduced: ${(totalBytesSaved / (1024 * 1024)).toFixed(2)} MB`);
  } catch (error) {
    console.error('❌ [Base64 Migration] Error running base64 migration:', error);
  }
};

// Allow running standalone from CLI (e.g. node src/migrations/migrate-base64-images.js)
if (require.main === module) {
  migrateBase64Images().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = migrateBase64Images;
