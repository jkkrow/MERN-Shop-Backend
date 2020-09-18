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
    return next(err);
  }

  res.json({ product });
};

exports.addToCart = async (req, res, next) => {};

exports.getCart = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userData.userId).populate("cart");
    if (!user) {
      return next(new HttpError("Failed to find current user.", 404));
    }
  } catch (err) {
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
