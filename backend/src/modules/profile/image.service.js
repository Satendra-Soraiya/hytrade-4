const sharp = require('sharp');

const MAX_DIMENSION = 512;
const JPEG_QUALITY = 82;

async function processProfileImage(buffer) {
  const processed = await sharp(buffer)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  return {
    buffer: processed,
    contentType: 'image/jpeg',
    ext: '.jpg',
  };
}

module.exports = { processProfileImage };
