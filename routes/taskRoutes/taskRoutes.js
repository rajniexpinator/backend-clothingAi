const express = require("express");
const {
  addTask,
  getUserTasks,
  taskByDate,
  addTaskFromProductDetails,
} = require("../../controllers/userControllers/taskController");
const { userAuthenticate } = require("../../middlewares/userAuthenticate");
const upload = require("../../middlewares/uploadMiddleware");
const checkAndDeductToken = require("../../middlewares/checkAndDeductToken");

const router = express.Router();

router.post(
  "/add",
  userAuthenticate,
  checkAndDeductToken,
  upload.any(),
  addTask
);
router.get("/my-tasks", userAuthenticate, getUserTasks);
router.post("/get-by-date", userAuthenticate, taskByDate);
router.post(
  "/add/product-details",
  userAuthenticate,
  addTaskFromProductDetails
);

module.exports = router;
