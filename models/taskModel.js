const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  title: { type: String, required: true },
  note: { type: String },
  human_image: { type: String, required: true },
  cloth_image: { type: String, required: true },
});

module.exports = mongoose.model("Task", TaskSchema);
