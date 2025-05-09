// routes/wardrobeRoutes.js
const express = require("express");
const router = express.Router();
const savedSuitController = require("../../controllers/savedSuitController/savedSuitController");
const { userAuthenticate } = require("../../middlewares/userAuthenticate");

// CREATE: Add a newsavedSuit entry for a specific user
router.post("/", userAuthenticate, savedSuitController.createSavedSuit);

// READ: Get allsavedSuit entries for a specific user
router.get("/", userAuthenticate, savedSuitController.getAllSavedSuits);
router.put("/:id", userAuthenticate, savedSuitController.editSavedSuit);

// READ: Get a specificsavedSuit entry by ID and userId
router.get("/:id", userAuthenticate, savedSuitController.getSavedSuitById);

// DELETE: Delete asavedSuit entry by ID and userId
router.delete("/:id", userAuthenticate, savedSuitController.deleteSavedSuit);
router.post(
  "/delete-multiple",
  userAuthenticate,
  savedSuitController.deleteMultipleSavedSuits
);

module.exports = router;
