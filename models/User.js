const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String },
  cart: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      quantity: { type: Number, required: true },
    },
  ],
  products: [{ type: mongoose.Types.ObjectId, required: true, ref: "Product" }],
  messages: [{ type: Object, ref: "Message" }],
});

module.exports = mongoose.model("User", UserSchema);
