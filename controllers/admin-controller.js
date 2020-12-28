const fs = require("fs");
const { validationResult } = require("express-validator");

const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const HttpError = require("../models/HttpError");

// Product

exports.getProducts = async (req, res, next) => {
  const perPage = 10;
  const page = Number(req.query.page) || 1;

  let products, count;
  try {
    count = await Product.countDocuments();
    products = await Product.find()
      .limit(perPage)
      .skip(perPage * (page - 1));
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ products, page, pages: Math.ceil(count / perPage) });
};

exports.addProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid input passed, please check your data.", 422)
    );
  }

  const { title, price, category, description } = req.body;

  const productImages = [];
  req.files.forEach((image) =>
    productImages.push(
      process.env.SERVER_URL + "/" + image.path.replace("\\", "/")
    )
  );

  // Add Product
  const product = new Product({
    title,
    price,
    description,
    category,
    images: productImages,
    reviews: [],
  });

  try {
    await product.save();
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.status(201).json({ message: "Product created." });
};

exports.updateProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid input passed, please check your data.", 422)
    );
  }
  const { productId } = req.params;
  const { title, price, category, description } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return next(new HttpError("Failed to find product.", 404));
    }

    product.title = title;
    product.price = price;
    product.category = category;
    product.description = description;

    await product.save();
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ message: "Product updated." });
};

exports.deleteProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return next(new HttpError("Failed to find product.", 404));
    }

    const productImages = product.images;

    await product.remove();

    // Delete images
    productImages.forEach((image) => {
      const imagePath = image.split(process.env.SERVER_URL + "/")[1];
      fs.unlink(imagePath, (err) => console.log(err));
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ message: "Product deleted." });
};

// User

exports.getUsers = async (req, res, next) => {
  const perPage = 2;
  const page = Number(req.query.page) || 1;

  let users, count;
  try {
    count = await User.countDocuments();
    users = await User.find()
      .limit(perPage)
      .skip(perPage * (page - 1));
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ users, page, pages: Math.ceil(count / perPage) });
};

exports.getUser = async (req, res, next) => {
  const { userId } = req.params;

  let user;
  try {
    user = await User.findById(userId);

    if (!user) {
      return next(new HttpError("Failed to find user.", 404));
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ user });
};

exports.updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Please enter valid inputs.", 422));
  }

  const { userId } = req.params;
  const { name, email, isAdmin } = req.body;
  try {
    const user = await User.findById(userId);
    user.name = name;
    user.email = email;
    user.isAdmin = isAdmin;

    await user.save();
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ message: "User updated." });
};

exports.deleteUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(new HttpError("Failed to find user.", 404));
    }

    await user.remove();
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ message: "User deleted." });
};

// Order

exports.getOrders = async (req, res, next) => {
  const perPage = 1;
  const page = Number(req.query.page) || 1;

  let orders, count;
  try {
    count = await Order.countDocuments();
    orders = await Order.find()
      .limit(perPage)
      .skip(perPage * (page - 1))
      .populate("user");
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ orders, page, pages: Math.ceil(count / perPage) });
};

exports.updateDelivered = async (req, res, next) => {
  const { orderId } = req.params;

  let order;
  try {
    order = await Order.findById(orderId);

    if (!order) {
      return next(new HttpError("Failed to find order.", 404));
    }

    if (order.isDelivered) {
      return next(new HttpError("Delivery state is already changed.", 400));
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    await order.save();
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ order });
};

exports.sendMessageToCustomer = async (req, res, next) => {};
