const response = require("../../helpers/response");
const UserModel = require("../../models/userModels");
const SavedSuit = require("../../models/savedSuitModel");
const { default: mongoose } = require("mongoose");

// CREATE: Add a new savedSuit entry for a specific user
exports.createSavedSuit = async (req, res) => {
  try {
    const { stars, title, description, tags, image, note } = req.body;
    const userId = req.user.userId;

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new savedSuit and associate with user
    const savedSuit = new SavedSuit({
      stars,
      title,
      description,
      tags,
      image,
      note,
      userId: userId,
    });
    await savedSuit.save();
    res
      .status(201)
      .json(response.success(201, "SavedSuit created successfully", savedSuit));
  } catch (err) {
    console.log(err);

    res.status(500).json(response.error(500, "Error creating savedSuit", err));
  }
};

exports.createSavedSuitByURI = async (req, res) => {
  try {
    const { image } = req.body;
    const userId = req.user.userId;

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const alreadyExists = await SavedSuit.findOne({
      image: image,
      userId: userId,
    });
    if (alreadyExists) {
      return res
        .status(400)
        .json(response.error(400, "SavedSuit already exists"));
    }
    // Create new savedSuit and associate with user
    const savedSuit = new SavedSuit({
      image,
      userId: userId,
    });
    await savedSuit.save();
    res
      .status(201)
      .json(response.success(201, "SavedSuit created successfully", savedSuit));
  } catch (err) {
    console.log(err);

    res.status(500).json(response.error(500, "Error creating savedSuit", err));
  }
};
// UPDATE: Edit a savedSuit entry by ID and userId
// UPDATE: Edit a savedSuit entry by ID and userId (supports partial update)
exports.editSavedSuit = async (req, res) => {
  try {
    const { id } = req.params; // SavedSuit ID
    const userId = req.user.userId;
    const updateFields = req.body; // Contains only the fields to update

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json(response.error(400, "No fields to update"));
    }

    // Update only the fields present in request body
    const savedSuit = await SavedSuit.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!savedSuit) {
      return res.status(404).json(response.error(404, "SavedSuit not found"));
    }

    res.status(200).json(response.success(200, "SavedSuit updated", savedSuit));
  } catch (err) {
    res.status(500).json(response.error(500, "Error updating savedSuit", err));
  }
};

// READ: Get all savedSuit entries for a specific user
exports.getAllSavedSuits = async (req, res) => {
  try {
    const userId = req.user.userId; // Get user from params

    // Find all savedSuits for the specific user
    const savedSuits = await SavedSuit.find({ userId: userId });
    res
      .status(200)
      .json(response.success(200, "SavedSuits fetched", savedSuits));
  } catch (err) {
    res.status(500).json(response.error(500, "Error fetching savedSuits", err));
  }
};

// READ: Get a specific savedSuit entry by ID and userId
exports.getSavedSuitById = async (req, res) => {
  try {
    const { id } = req.params; // Get id and userId from params
    const userId = req.user.userId;
    console.log(id, userId);

    // Find savedSuit by ID and ensure it belongs to the user
    const savedSuit = await SavedSuit.findOne({ _id: id, userId: userId });
    if (!savedSuit) {
      return res.status(404).json(response.error(404, "SavedSuit not found"));
    }
    res.status(200).json(response.success(200, "SavedSuit fetched", savedSuit));
  } catch (err) {
    console.log(err);

    res.status(500).json(response.error(500, "Error fetching savedSuit", err));
  }
};

// DELETE: Delete a savedSuit entry by ID and userId
exports.deleteSavedSuit = async (req, res) => {
  try {
    const { id } = req.params; // Get id and userId from params
    const userId = req.user.userId;
    // Delete savedSuit only if it belongs to the user
    const savedSuit = await SavedSuit.findOneAndDelete({
      _id: id,
      userId: userId,
    });
    if (!savedSuit) {
      return res.status(404).json(response.error(404, "SavedSuit not found"));
    }
    res.status(200).json(response.success(200, "SavedSuit deleted", savedSuit));
  } catch (err) {
    res.status(500).json(response.error(500, "Error deleting savedSuit", err));
  }
};

exports.createMultipleSavedSuits = async (req, res) => {
  try {
    // console.log(req.body);

    const suits = JSON.parse(req.body.suits);
    const userId = req.user.userId;

    if (!Array.isArray(suits)) {
      return res
        .status(400)
        .json(response.error(400, "Request body must be an array"));
    }

    // Validate user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json(response.error(404, "User not found"));
    }

    // Add userId to each suit and create
    const suitsWithUserId = suits.map((suit) => ({ image: suit, userId }));
    console.log(suitsWithUserId);

    const createdSuits = await SavedSuit.insertMany(suitsWithUserId);

    res
      .status(201)
      .json(
        response.success(
          201,
          `${createdSuits.length} saved suits created successfully`,
          createdSuits
        )
      );
  } catch (err) {
    res
      .status(500)
      .json(response.error(500, "Failed to create saved suits", err.message));
  }
};

exports.deleteMultipleSavedSuits = async (req, res) => {
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

    const result = await SavedSuit.deleteMany({ _id: { $in: ids } });

    res.status(200).json(response.success(200, "SavedSuits deleted", result));
  } catch (err) {
    console.log(err);
    res.status(500).json(response.error(500, "Error deleting savedSuits", err));
  }
};
