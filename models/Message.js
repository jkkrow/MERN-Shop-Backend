const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    detail: { type: String, required: true },
    messageType: { type: String, required: true },
    opponent: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
