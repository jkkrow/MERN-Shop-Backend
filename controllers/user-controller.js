const Product = require("../models/Product");
const User = require("../models/User");
const HttpError = require("../models/HttpError");

exports.getProducts = async (req, res, next) => {
  let products;
  try {
    products = await Product.find();
    if (!products.length) {
      return next(new HttpError("No Product Found.", 404));
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ products });
};

exports.getProductDetail = async (req, res, next) => {
  const { productId } = req.params;
  let product;
  try {
    product = await Product.findById(productId);
    if (!product) {
      return next(new HttpError("No Product Found.", 404));
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ product });
};

exports.getCart = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userData.userId).populate("cart.product");
    const filteredCart = user.cart.filter((item) => item.product !== null);
    user.cart = filteredCart;
    await user.save();
    if (!user) {
      return next(new HttpError("Failed to find current user.", 404));
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ cart: user.cart });
};

exports.moveItems = async (req, res, next) => {
  const { cart } = req.body;
  let newCart;
  try {
    const user = await User.findById(req.userData.userId).populate(
      "cart.product"
    );
    const items = user.cart;
    newCart = [...items];
    for (let item of cart) {
      const index = items.findIndex(
        (i) => i.product._id.toString() === item.product._id.toString()
      );
      if (index !== -1) {
        const newQuantity = items[index].quantity + item.quantity;
        newCart[index].quantity = newQuantity;
      } else {
        newCart.push({ product: item.product, quantity: item.quantity });
      }
    }
    await User.findByIdAndUpdate(req.userData.userId, { cart: newCart });
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ cart: newCart });
};

exports.addToCart = async (req, res, next) => {
  const { item, quantity } = req.body;
  let user;
  try {
    user = await User.findById(req.userData.userId).populate("cart.product");
    const items = user.cart;
    let newCart = [...items];
    const index = items.findIndex(
      (i) => i.product._id.toString() === item._id.toString()
    );
    if (index !== -1) {
      const newQuantity = items[index].quantity + quantity;
      newCart[index].quantity = newQuantity;
    } else {
      newCart.push({ product: item, quantity });
    }
    user.cart = newCart;
    await user.save();
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ cart: user.cart });
};

exports.changeQuantity = async (req, res, next) => {
  const { productId, quantity } = req.body;
  let user;
  try {
    user = await User.findById(req.userData.userId).populate("cart.product");
    const updatedCart = [...user.cart];
    const updatedItemIndex = updatedCart.findIndex(
      (item) => item.product._id.toString() === productId.toString()
    );
    updatedCart[updatedItemIndex].quantity = quantity;
    user.cart = updatedCart;
    await user.save();
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ cart: user.cart });
};

exports.removeFromCart = async (req, res, next) => {
  const { productId } = req.params;
  let user;
  try {
    user = await User.findById(req.userData.userId).populate("cart.product");
    const newCart = user.cart.filter(
      (item) => item.product._id.toString() !== productId.toString()
    );
    user.cart = newCart;
    await user.save();
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ cart: user.cart });
};

exports.getCheckout = async (req, res, next) => {};

exports.order = async (req, res, next) => {};

exports.getOrders = async (req, res, next) => {};

exports.postReview = async (req, res, next) => {};

exports.getMessages = async (req, res, next) => {};

exports.sendMessageToSeller = async (req, res, next) => {};
