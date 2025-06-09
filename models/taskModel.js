const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: String },
  title: { type: String },
  note: { type: String },
  human_image: { type: String },
  cloth_image: { type: String },
});

module.exports = mongoose.model("Task", TaskSchema);
