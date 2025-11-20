const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const publicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL; // e.g., https://your-bucket.s3.ap-south-1.amazonaws.com

let s3 = null;
try {
  if (bucket && region && accessKeyId && secretAccessKey) {
    s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey }
    });
  }
} catch (e) {
  console.error('S3 client init failed:', e);
  s3 = null;
}

const isS3Configured = () => !!s3;

const buildPublicUrl = (key) => {
  if (publicBaseUrl) return `${publicBaseUrl}/${key}`;
  // Generic AWS S3 virtual-hosted–style URL
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

async function uploadProfileImage(buffer, contentType, key) {
  if (!s3) throw new Error('S3 not configured');
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType
  });
  await s3.send(command);
  return buildPublicUrl(key);
}

module.exports = { isS3Configured, uploadProfileImage };