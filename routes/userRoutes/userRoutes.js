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

router.get("/get-token", userAuthenticate, getUserToken);
router.get("/history", userAuthenticate, getHistoryByUserId);
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
