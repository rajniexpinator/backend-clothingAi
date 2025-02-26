const express = require("express");
const {
  UsersignUp,
  verifyOtp,
} = require("../../controllers/userControllers/signUpController");
const UsersignIn = require("../../controllers/userControllers/signInController");
const router = express.Router();

// Routes for User controllers
router.post("/signUp", UsersignUp);
router.post("/verify-otp", verifyOtp);

router.post("/signIn", UsersignIn.authenticateUser);

module.exports = router;
