// routes/wardrobeRoutes.js
const express = require("express");
const router = express.Router();
const wardrobeController = require("../../controllers/wardrobeController/wardrobeController");
const { userAuthenticate } = require("../../middlewares/userAuthenticate");

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
  "/delete-multiple",
  userAuthenticate,
  wardrobeController.deleteMultipleWardrobe
);

module.exports = router;
