const mongoose = require("mongoose");
const fs = require("fs");

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

exports.deleteProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId).populate("seller");

    if (!product) {
      return next(new HttpError("Failed to find product.", 404));
    }
    
    if (product.seller._id.toString() !== req.userData.userId.toString()) {
      return next(new HttpError("Not allowed access.", 401));
    }

    const productImages = product.images;

    // Delete product from user
    const session = await mongoose.startSession();
    session.startTransaction();
    await product.remove({ session });
    product.seller.products.pull(product);
    await product.seller.save({ session });
    await session.commitTransaction();

    // Delete product from cart

    // Delete images
    productImages.forEach((image) => {
      const imagePath = image.split(process.env.SERVER_URL + "/")[1];
      fs.unlink(imagePath, (err) => console.log(err));
    });
  } catch (err) {
    return next(err);
  }

  res.json({ message: "Product deleted." });
};

exports.sendMessageToCustomer = async (req, res, next) => {};
