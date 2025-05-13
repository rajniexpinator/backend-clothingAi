const mongoose = require("mongoose");

const shoppingCartModel = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("shoppingCartModel", shoppingCartModel);

module.exports = Product;
