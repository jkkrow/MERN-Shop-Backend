const mongoose = require("mongoose");

const Product = require("../models/Product");
const User = require("../models/User");
const { validationResult } = require("express-validator");

const HttpError = require("../models/HttpError");

exports.addProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid input passed, please check your data.", 422)
    );
  }

  const { title, price, description, category } = req.body;

  const productImages = [];
  req.files.forEach((image) =>
    productImages.push(
      process.env.SERVER_URL + "/" + image.path.replace("\\", "/")
    )
  );

  // Create product
  const product = new Product({
    title,
    price,
    description,
    category,
    images: productImages,
    seller: req.userData.userId,
    reviews: [],
  });

  try {
    // Fetch user
    const user = await User.findById(req.userData.userId);
    if (!user) {
      return next(new HttpError("Failed to find current user.", 404));
    }

    // Transaction with user model
    const session = await mongoose.startSession();
    session.startTransaction();
    await product.save({ session });
    user.products.push(product);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    return next(err);
  }

  res.status(201).json({ product });
};

exports.getProductsById = async (req, res, next) => {
  let userWithProducts;
  try {
    userWithProducts = await User.findById(req.userData.userId).populate(
      "products"
    );
  } catch (err) {
    return next(err);
  }

  res.json({ products: userWithProducts.products });
};

exports.updateProduct = async (req, res, next) => {};

exports.deleteProduct = async (req, res, next) => {};

exports.sendMessageToCustomer = async (req, res, next) => {};
