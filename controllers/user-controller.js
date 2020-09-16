const Product = require("../models/Product");
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

exports.getCart = async (req, res, next) => {};

exports.getCheckout = async (req, res, next) => {};

exports.order = async (req, res, next) => {};

exports.getOrders = async (req, res, next) => {};

exports.postReview = async (req, res, next) => {};

exports.getMessages = async (req, res, next) => {};

exports.sendMessageToSeller = async (req, res, next) => {};
