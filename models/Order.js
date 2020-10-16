const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    orderItems: [
      {
        title: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        quantity: { type: Number, required: true },
        product: {
          type: mongoose.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    payment: {
      id: { type: String, required: true },
      method: { type: String, required: true },
      status: { type: String, required: true },
      email_address: { type: String, required: true },
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    tax: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
