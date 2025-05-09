const mongoose = require("mongoose");

const wardrobeSchema = new mongoose.Schema(
  {
    stars: { type: Number, default: 5 },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    tags: { type: [String], default: [] },
    image: { type: String, default: "" },
    note: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Eshera reference to User
  },
  { timestamps: true, strict: false }
);

const Wardrobe = mongoose.model("Wardrobe", wardrobeSchema);

module.exports = Wardrobe;
