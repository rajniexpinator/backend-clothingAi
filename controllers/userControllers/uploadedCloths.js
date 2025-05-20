const { uploadToS3Bucket } = require("../../config/S3ImageUpload");
const response = require("../../helpers/response");
const uploadedClothsModal = require("../../models/uploadedClothsModal");

const uploadClothsByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const image = await uploadToS3Bucket(req.files[0]);
    const uploadedCloth = new uploadedClothsModal({ userId, image: image.url });
    await uploadedCloth.save();
    res
      .status(200)
      .send(
        response.success(200, "Image uploaded successfully", uploadedCloth)
      );
  } catch (error) {
    console.log(error);
    res.status(500).send(response.error(500, "Internal server error"));
  }
};
const getUploadedClothsByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const uploadedCloths = await uploadedClothsModal
      .find({ userId })
      .sort({ createdAt: -1 });

    res
      .status(200)
      .send(
        response.success(
          200,
          "Uploaded cloths fetched successfully",
          uploadedCloths
        )
      );
  } catch (error) {
    console.error(error);
    res.status(500).send(response.error(500, "Internal server error"));
  }
};
module.exports = { uploadClothsByUser, getUploadedClothsByUser };
