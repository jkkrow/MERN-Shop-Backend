const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    products: [
      {
        product: { type: Object, required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
