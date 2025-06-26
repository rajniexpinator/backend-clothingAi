// routes/wardrobeRoutes.js
const express = require("express");
const router = express.Router();
const wardrobeController = require("../../controllers/wardrobeController/wardrobeController");
const { userAuthenticate } = require("../../middlewares/userAuthenticate");
const upload = require("../../middlewares/uploadMiddleware");
// CREATE: Add a new wardrobe entry for a specific user
router.post("/", userAuthenticate, wardrobeController.createWardrobe);

// READ: Get all wardrobe entries for a specific user
router.get("/", userAuthenticate, wardrobeController.getAllWardrobes);
router.put("/:id", userAuthenticate, wardrobeController.editWardrobe);

// READ: Get a specific wardrobe entry by ID and userId
router.get("/:id", userAuthenticate, wardrobeController.getWardrobeById);

// DELETE: Delete a wardrobe entry by ID and userId
router.delete("/:id", userAuthenticate, wardrobeController.deleteWardrobe);
router.post(
  "/upload-secondaryImage",
  userAuthenticate,
  upload.any(),
  wardrobeController.secondaryImageUpload
);
router.post(
  "/delete-multiple",
  userAuthenticate,
  wardrobeController.deleteMultipleWardrobe
);
router.put(
  "/update-tags-multiple",
  userAuthenticate,
  wardrobeController.addTagMultipleWardrobe
);

module.exports = router;
