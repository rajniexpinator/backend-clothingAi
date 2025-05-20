const {
  uploadToS3Bucket,
  deleteFromS3Bucket,
} = require("../../config/S3ImageUpload");
const response = require("../../helpers/response");
const imageTryOnService = require("../../servcices/imageTryOn.service");
const saveHistory = require("../historyControler/historyJob");

const isImage = (file) => {
  return file && file.mimetype && file.mimetype.startsWith("image/");
};

exports.instantTryOn = async (req, res) => {
  const { human_image, cloth_image } = req.body;

  try {
    // const humanFile = req.files["human_image"]?.[0];
    // const clothFile = req.files["cloth_image"]?.[0];

    // // Validate image types
    // if (!isImage(humanFile) || !isImage(clothFile)) {
    //   return res
    //     .status(400)
    //     .json(response.error(400, "Only image files are allowed."));
    // }

    // const human_image = await uploadToS3Bucket(humanFile);
    // const cloth_image = await uploadToS3Bucket(clothFile);

    const aiResponce = await imageTryOnService({
      human_image: human_image,
      cloth_image: cloth_image,
    });

    res.json(
      response.success(200, "Image Merge Successfully", {
        tryOnImageUrl: aiResponce?.data?.task_result?.images[0]?.url,
      })
    );

    await saveHistory.now("saveHistory", {
      userId: req.user.userId,
      tryOnImageUrl: aiResponce?.data?.task_result?.images[0]?.url,
    });

    // await deleteFromS3Bucket(human_image.key);
    // await deleteFromS3Bucket(cloth_image.key);
  } catch (error) {
    console.log(error);
    res.send(response.error(500, "Internal Server Error", error.message));
  }
};
