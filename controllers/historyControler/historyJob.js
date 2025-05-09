const Agenda = require("agenda");
const axios = require('axios');
const mime = require('mime-types');
const path = require('path');
const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY, 
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const s3 = new AWS.S3();
require('dotenv').config();

const historyModal = require("../../models/historyModal");


const agenda = new Agenda({ db: { address: process.env.MongoDb_URI } });

agenda.define("saveHistory", async (job) => {
    try {
        const { userId, tryOnImageUrl } = job.attrs.data;

        const image = await  uploadImageFromUrlToS3(tryOnImageUrl);
        console.log(image,24)
        const history = new historyModal({ userId, tryOnImageUrl:image.url });
        await history.save();
    } catch (err) {
        console.error("Error saving history:", err);
    }
});

// Start processing jobs
(async function () {
    await agenda.start();
})();

module.exports = agenda;

const uploadImageFromUrlToS3 = async (imageUrl) => {
  try {

    // 1. Download the image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    const buffer = Buffer.from(response.data, 'binary');

    // 2. Extract file name and MIME type
    const fileName = path.basename(imageUrl);
    const mimeType = mime.lookup(fileName) || 'application/octet-stream';

    // 3. Set S3 params
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${Date.now()}_${fileName}`,
      Body: buffer,
      ContentType: mimeType,
    };

    // 4. Upload to S3
    const s3Response = await s3.upload(params).promise();

    return {
      url: s3Response.Location,
      key: s3Response.Key,
    };

  } catch (err) {
    console.error("❌ Error uploading image from URL to S3:", err);
    throw err;
  }
};