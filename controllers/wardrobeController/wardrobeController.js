const { default: mongoose } = require("mongoose");
const response = require("../../helpers/response");
const UserModel = require("../../models/userModels");
const Wardrobe = require("../../models/wardrobeModal");

// CREATE: Add a new wardrobe entry for a specific user
exports.createWardrobe = async (req, res) => {
  try {
    const { stars, title, description, tags, image, note } = req.body;
    const userId = req.user.userId;

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new wardrobe and associate with user
    const wardrobe = new Wardrobe({
      stars,
      title,
      description,
      tags,
      image,
      note,
      userId: userId,
    });
    await wardrobe.save();
    res
      .status(201)
      .json(response.success(201, "Wardrobe created successfully", wardrobe));
  } catch (err) {
    res.status(500).json(response.error(500, "Error creating wardrobe", err));
  }
};
// UPDATE: Edit a wardrobe entry by ID and userId
// UPDATE: Edit a wardrobe entry by ID and userId (supports partial update)
exports.editWardrobe = async (req, res) => {
  try {
    const { id } = req.params; // Wardrobe ID
    const userId = req.user.userId;
    const updateFields = req.body; // Contains only the fields to update
    console.log(updateFields);

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json(response.error(400, "No fields to update"));
    }

    // Update only the fields present in request body
    const wardrobe = await Wardrobe.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!wardrobe) {
      return res.status(404).json(response.error(404, "Wardrobe not found"));
    }

    res.status(200).json(response.success(200, "Wardrobe updated", wardrobe));
  } catch (err) {
    res.status(500).json(response.error(500, "Error updating wardrobe", err));
  }
};

// READ: Get all wardrobe entries for a specific user
exports.getAllWardrobes = async (req, res) => {
  try {
    const userId = req.user.userId; // Get user from params

    // Find all wardrobes for the specific user
    const wardrobes = await Wardrobe.find({ userId: userId });
    res.status(200).json(response.success(200, "Wardrobes fetched", wardrobes));
  } catch (err) {
    res.status(500).json(response.error(500, "Error fetching wardrobes", err));
  }
};

// READ: Get a specific wardrobe entry by ID and userId
exports.getWardrobeById = async (req, res) => {
  try {
    const { id } = req.params; // Get id and userId from params
    const userId = req.user.userId;
    console.log(id, userId);

    // Find wardrobe by ID and ensure it belongs to the user
    const wardrobe = await Wardrobe.findOne({ _id: id, userId: userId });
    if (!wardrobe) {
      return res.status(404).json(response.error(404, "Wardrobe not found"));
    }
    res.status(200).json(response.success(200, "Wardrobe fetched", wardrobe));
  } catch (err) {
    console.log(err);

    res.status(500).json(response.error(500, "Error fetching wardrobe", err));
  }
};

// DELETE: Delete a wardrobe entry by ID and userId
exports.deleteWardrobe = async (req, res) => {
  try {
    const { id } = req.params; // Get id and userId from params
    const userId = req.user.userId;
    // Delete wardrobe only if it belongs to the user
    const wardrobe = await Wardrobe.findOneAndDelete({
      _id: id,
      userId: userId,
    });
    if (!wardrobe) {
      return res.status(404).json(response.error(404, "Wardrobe not found"));
    }
    res.status(200).json(response.success(200, "Wardrobe deleted", wardrobe));
  } catch (err) {
    res.status(500).json(response.error(500, "Error deleting wardrobe", err));
  }
};

exports.deleteMultipleWardrobe = async (req, res) => {
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

    const result = await Wardrobe.deleteMany({ _id: { $in: ids } });

    res.status(200).json(response.success(200, "Wardrobe deleted", result));
  } catch (err) {
    console.log(err);
    res.status(500).json(response.error(500, "Error deleting Wardrobe", err));
  }
};
