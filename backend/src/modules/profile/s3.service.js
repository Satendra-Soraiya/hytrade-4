const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { config } = require('../../config/env');

let s3 = null;
if (config.awsS3Bucket && config.awsRegion && config.awsAccessKeyId && config.awsSecretAccessKey) {
  s3 = new S3Client({
    region: config.awsRegion,
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  });
}

const isS3Configured = () => !!s3;

function buildPublicUrl(key) {
  if (config.awsS3PublicBaseUrl) return `${config.awsS3PublicBaseUrl}/${key}`;
  return `https://${config.awsS3Bucket}.s3.${config.awsRegion}.amazonaws.com/${key}`;
}

async function uploadProfileImage(buffer, contentType, key) {
  if (!s3) throw new Error('S3 not configured');
  await s3.send(new PutObjectCommand({
    Bucket: config.awsS3Bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return buildPublicUrl(key);
}

module.exports = { isS3Configured, uploadProfileImage };
