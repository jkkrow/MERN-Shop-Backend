const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    rating: { type: Number, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  reviews: [ReviewSchema],
  rating: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("Product", ProductSchema);
