const fs = require('fs');
const path = require('path');

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');

/**
 * Ensures the uploads directory exists.
 */
const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

/**
 * Maps MIME type or format string to appropriate file extension.
 */
const getExtension = (mimeOrFormat) => {
  const clean = (mimeOrFormat || '').toLowerCase();
  if (clean.includes('png')) return '.png';
  if (clean.includes('jpeg') || clean.includes('jpg')) return '.jpg';
  if (clean.includes('webp')) return '.webp';
  if (clean.includes('gif')) return '.gif';
  if (clean.includes('svg')) return '.svg';
  return '.png';
};

/**
 * Detects all base64 images in HTML content, writes them to disk in uploads directory,
 * and replaces the data URI src with /uploads/<filename>.
 * 
 * @param {string} htmlContent - Review HTML content
 * @returns {Promise<{ content: string, convertedCount: number, bytesSaved: number }>}
 */
const extractAndSaveBase64Images = async (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return { content: htmlContent, convertedCount: 0, bytesSaved: 0 };
  }

  // Regex matching data:image URIs in src attributes
  // src="data:image/png;base64,iVBORw..." or src='data:image/jpeg;base64,...'
  const base64Regex = /src=["'](data:image\/([a-zA-Z0-9+.-]+);base64,([^"']+))["']/gi;

  if (!htmlContent.match(base64Regex)) {
    return { content: htmlContent, convertedCount: 0, bytesSaved: 0 };
  }

  ensureUploadsDir();

  let convertedCount = 0;
  let bytesSaved = 0;

  // Replace each match asynchronously
  const matches = [];
  let match;
  while ((match = base64Regex.exec(htmlContent)) !== null) {
    matches.push({
      fullMatch: match[0],
      dataUri: match[1],
      mimeType: match[2],
      base64Data: match[3]
    });
  }

  let updatedContent = htmlContent;

  for (const item of matches) {
    try {
      const ext = getExtension(item.mimeType);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `${uniqueSuffix}${ext}`;
      const filePath = path.join(uploadsDir, filename);

      const buffer = Buffer.from(item.base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);

      const newUrl = `/uploads/${filename}`;
      // Replace only this exact occurrence
      updatedContent = updatedContent.replace(item.dataUri, newUrl);

      convertedCount++;
      bytesSaved += item.base64Data.length;
      console.log(`🖼️ [Base64Converter] Extracted image to ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error('❌ [Base64Converter] Error saving base64 image:', err);
    }
  }

  return { content: updatedContent, convertedCount, bytesSaved };
};

module.exports = {
  extractAndSaveBase64Images,
  ensureUploadsDir
};
