const mongoose = require("mongoose");

const shoppingCartModel = new mongoose.Schema(
  {
    stars: { type: Number, default: 5 },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    tags: { type: [String], default: [] },
    note: { type: String, default: "" },
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
