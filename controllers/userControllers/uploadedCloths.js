const { default: mongoose } = require("mongoose");
const { uploadToS3Bucket } = require("../../config/S3ImageUpload");
const response = require("../../helpers/response");
const uploadedClothsModal = require("../../models/uploadedClothsModal");

const uploadClothsByUser = async (req, res) => {
  try {
    console.log("caleed");
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
const deleteMultipleClothes = async (req, res) => {
  try {
    const { ids } = req.body;
    console.log(ids);

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json(response.error(400, "Invalid input"));
    }

    // Optional: Validate that all are valid MongoDB ObjectIds
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json(response.error(400, "Invalid IDs"));
    }

    const result = await uploadedClothsModal.deleteMany({ _id: { $in: ids } });

    res.status(200).json(response.success(200, "SavedSuits deleted", result));
  } catch (err) {
    console.log(err);
    res.status(500).json(response.error(500, "Error deleting savedSuits", err));
  }
};

module.exports = {
  uploadClothsByUser,
  getUploadedClothsByUser,
  deleteMultipleClothes,
};
