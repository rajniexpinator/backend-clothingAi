const mongoose = require("mongoose");

const uploadedClothsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("uploadedCloths", uploadedClothsSchema);
