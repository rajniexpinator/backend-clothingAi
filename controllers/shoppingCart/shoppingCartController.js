const ShoppingCart = require("../../models/shoppingCartModel");
const UserModel = require("../../models/userModels");
const response = require("../../helpers/response");
const mongoose = require("mongoose");

// CREATE: Add item to shopping cart
exports.createCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json(response.error(404, "User not found"));
    }

    const cartItem = new ShoppingCart({ ...req.body, userId });
    await cartItem.save();

    res.status(201).json(response.success(201, "Cart item added", cartItem));
  } catch (err) {
    res.status(500).json(response.error(500, "Error adding to cart", err));
  }
};

// READ: Get all shopping cart items for user
exports.getAllCartItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cartItems = await ShoppingCart.find({ userId });

    res
      .status(200)
      .json(response.success(200, "Cart items fetched", cartItems));
  } catch (err) {
    res.status(500).json(response.error(500, "Error fetching cart items", err));
  }
};

// READ: Get single cart item by ID and user
exports.getCartItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const cartItem = await ShoppingCart.findOne({ _id: id, userId });
    if (!cartItem) {
      return res.status(404).json(response.error(404, "Cart item not found"));
    }

    res.status(200).json(response.success(200, "Cart item fetched", cartItem));
  } catch (err) {
    res.status(500).json(response.error(500, "Error fetching cart item", err));
  }
};

// UPDATE: Update cart item by ID and userId
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateFields = req.body;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json(response.error(400, "No fields to update"));
    }

    const updatedCartItem = await ShoppingCart.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    console.log(updateFields);

    if (!updatedCartItem) {
      return res.status(404).json(response.error(404, "Cart item not found"));
    }

    res
      .status(200)
      .json(response.success(200, "Cart item updated", updatedCartItem));
  } catch (err) {
    res.status(500).json(response.error(500, "Error updating cart item", err));
  }
};

// DELETE: Remove cart item by ID and user
exports.deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const deletedCartItem = await ShoppingCart.findOneAndDelete({
      _id: id,
      userId,
    });
    if (!deletedCartItem) {
      return res.status(404).json(response.error(404, "Cart item not found"));
    }

    res
      .status(200)
      .json(response.success(200, "Cart item deleted", deletedCartItem));
  } catch (err) {
    res.status(500).json(response.error(500, "Error deleting cart item", err));
  }
};

// DELETE MULTIPLE: Remove multiple cart items by IDs and user
exports.deleteMultipleCartItems = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json(response.error(400, "Invalid input"));
    }

    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json(response.error(400, "Invalid cart item IDs"));
    }

    const result = await ShoppingCart.deleteMany({
      _id: { $in: ids },
      userId: req.user.userId,
    });

    res.status(200).json(response.success(200, "Cart items deleted", result));
  } catch (err) {
    res.status(500).json(response.error(500, "Error deleting cart items", err));
  }
};
