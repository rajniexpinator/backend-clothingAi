const AWS = require("aws-sdk");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const s3 = new AWS.S3();

/**
 * Compresses and uploads a multer file buffer to S3.
 * @param {Object} file - Multer file object with `buffer`, `mimetype`, and `originalname`.
 * @returns {Promise<{url: string, key: string}>}
 */
const uploadToS3Bucket = async (file) => {
  try {
    if (!file || !file.buffer) {
      throw new Error("Invalid file input for S3 upload");
    }

    // Compress & resize image with sharp
    const compressedBuffer = await sharp(file.buffer)
      .resize({ width: 1024 }) // Resize to max width 1024px, maintain aspect ratio
      .jpeg({ quality: 75 }) // Convert to JPEG and compress quality (you can tweak)
      .toBuffer();

    // Use uuid for unique file name + .jpeg extension (since we convert to jpeg)
    const fileName = `${uuidv4()}.jpeg`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: compressedBuffer,
      ContentType: "image/jpeg",
    };

    const s3Response = await s3.upload(params).promise();

    return {
      url: s3Response.Location,
      key: s3Response.Key,
    };
  } catch (error) {
    console.error("Error in S3 upload:", error);
    throw error;
  }
};

/**
 * Deletes a file from S3 by its key.
 * @param {string} key - The S3 key of the file to delete
 * @returns {Promise<void>}
 */
const deleteFromS3Bucket = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();
    console.log(`✅ Deleted from S3: ${key}`);
  } catch (error) {
    console.error("❌ Failed to delete from S3:", key, error.message);
    throw error;
  }
};

/**
 * Uploads a base64 string to S3
 * @param {string} base64String - Full base64 string (e.g., data:image/jpeg;base64,...)
 * @returns {Promise<{ url: string, key: string }>}
 */
const uploadBase64ToS3Bucket = async (base64String) => {
  try {
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 string format");
    }

    const mimeType = matches[1];
    const data = Buffer.from(matches[2], "base64");
    const extension = mimeType.split("/")[1];
    const fileName = `${uuidv4()}.${extension}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: data,
      ContentEncoding: "base64",
      ContentType: mimeType,
    };

    const s3Response = await s3.upload(params).promise();

    return {
      url: s3Response.Location,
      key: s3Response.Key,
    };
  } catch (error) {
    console.error("Error uploading base64 to S3:", error);
    throw error;
  }
};

module.exports = {
  uploadToS3Bucket,
  uploadBase64ToS3Bucket,
  deleteFromS3Bucket,
};
