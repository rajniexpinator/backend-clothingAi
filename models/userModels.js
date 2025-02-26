const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePicture: { type: String, default: "N/A" },
    number: { type: String, default: "N/A" },
    otp: { type: Number },
    otpExpiry: { type: Date },
    role: { type: String, default: "user" },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
