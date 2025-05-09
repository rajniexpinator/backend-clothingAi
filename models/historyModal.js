
const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tryOnImageUrl: { type: String, required: true },
  details: { type: String },
},{timestamps: true});

 const historyModal = mongoose.model("History", HistorySchema);



module.exports = historyModal