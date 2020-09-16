const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  rating: { type: Number, required: true },
  detail: { type: String },
});

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  category: { type: String, required: true },
  seller: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  reviews: [ReviewSchema],
});

module.exports = mongoose.model("Product", ProductSchema);
