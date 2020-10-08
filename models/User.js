const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: Number, required: true },
  country: { type: String, required: true },
});

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
  addresses: [AddressSchema],
  products: [{ type: mongoose.Types.ObjectId, required: true, ref: "Product" }],
  messages: [{ type: Object, ref: "Message" }],
});

module.exports = mongoose.model("User", UserSchema);
