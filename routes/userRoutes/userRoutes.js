const express = require("express");
const {
  UsersignUp,
  verifyOtp,
  updateUser,
  resendOtp,
  imageUpdate,
  getUser,
  forgotPassword,
} = require("../../controllers/userControllers/signUpController");
const UsersignIn = require("../../controllers/userControllers/signInController");

const {
  ChangePassword,
} = require("../../controllers/userControllers/changePassword");
const { userAuthenticate } = require("../../middlewares/userAuthenticate");
const { instantTryOn } = require("../../controllers/virtualTryOn/instantTryOn");
const upload = require("../../middlewares/uploadMiddleware");
const checkAndDeductToken = require("../../middlewares/checkAndDeductToken");
const { getUserToken } = require("../../controllers/tokenController");
const {
  getHistoryByUserId,
} = require("../../controllers/historyControler/getHistory");
const {
  uploadClothsByUser,
  getUploadedClothsByUser,
  deleteMultipleClothes,
} = require("../../controllers/userControllers/uploadedCloths");
const historyModal = require("../../models/historyModal");
const { default: mongoose } = require("mongoose");
const {
  createSavedSuitByURI,
} = require("../../controllers/savedSuitController/savedSuitController");
const response = require("../../helpers/response");

const router = express.Router();

// Routes for User controllers
router.post("/signUp", UsersignUp);
router.put("/update-user", userAuthenticate, updateUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/signin-social", UsersignIn.authenticateUseSocial);
router.post("/signIn", UsersignIn.authenticateUser);
router.put("/change-password", userAuthenticate, ChangePassword);
router.put("/image/:type", upload.any(), userAuthenticate, imageUpdate);
router.get("/details", userAuthenticate, getUser);
router.post("/forgot-password", forgotPassword);
router.post(
  "/upload-cloth",
  userAuthenticate,
  upload.any(),
  uploadClothsByUser
);
router.get("/my-cloths", userAuthenticate, getUploadedClothsByUser);
router.post(
  "/delete-multiple-clothes",
  userAuthenticate,
  deleteMultipleClothes
);
router.post("/save-image", userAuthenticate, createSavedSuitByURI);
router.get("/get-token", userAuthenticate, getUserToken);
router.get("/history", userAuthenticate, getHistoryByUserId);
router.delete("/delete", userAuthenticate, UsersignIn.deleteUser);

router.post("/history-delete", userAuthenticate, async (req, res) => {
  try {
    const { ids } = req.body;
    console.log(ids);

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json(response.error(400, "Invalid input"));
    }

    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res
        .status(400)
        .json(response.error(400, "Invalid put on item IDs"));
    }

    const result = await historyModal.deleteMany({
      _id: { $in: ids },
      userId: req.user.userId,
    });

    res.status(200).json(response.success(200, "Cart put on deleted", result));
  } catch (err) {
    res
      .status(500)
      .json(response.error(500, "Error deleting put on items", err));
  }
});

router.post(
  "/instent/try-on",
  userAuthenticate,
  checkAndDeductToken,
  upload.fields([
    { name: "human_image", maxCount: 1 },
    { name: "cloth_image", maxCount: 1 },
  ]),
  instantTryOn
);
module.exports = router;
