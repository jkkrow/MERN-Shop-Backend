const fs = require("fs");
const bcrypt = require("bcrypt");

const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const HttpError = require("../models/HttpError");

// Product

exports.getProducts = async (req, res, next) => {
  const perPage = 2;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? { title: { $regex: req.query.keyword, $options: "i" } }
    : {};

  let products, count;
  try {
    count = await Product.countDocuments({ ...keyword });
    products = await Product.find({ ...keyword })
      .limit(perPage)
      .skip(perPage * (page - 1));
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ products, page, pages: Math.ceil(count / perPage) });
};

exports.getProductDetail = async (req, res, next) => {
  const { productId } = req.params;
  let product;
  try {
    product = await Product.findById(productId).populate({
      path: "reviews.user",
      select: ["name", "image"],
    });
    if (!product) {
      return next(new HttpError("No Product Found.", 404));
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ product });
};

// Cart

exports.getCart = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.user.userId).populate("cart.product");
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
    const user = await User.findById(req.user.userId).populate("cart.product");
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
    await User.findByIdAndUpdate(req.user.userId, { cart: newCart });
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
    user = await User.findById(req.user.userId).populate("cart.product");
    const items = user.cart;
    let newCart = [...items];
    const index = items.findIndex(
      (i) => i.product._id.toString() === item._id.toString()
    );
    if (index !== -1) {
      let newQuantity;
      if (item.quantity < items[index].quantity + quantity) {
        newQuantity = item.quantity;
      } else {
        newQuantity = items[index].quantity + quantity;
      }
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
    user = await User.findById(req.user.userId).populate("cart.product");
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
    user = await User.findById(req.user.userId).populate("cart.product");
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

exports.startCheckout = async (req, res, next) => {
  const { cart } = req.body;

  for (let i = 0; i < cart.length; i++) {
    let stock = (await Product.findById(cart[i].product._id)).quantity;

    if (stock === 0 || cart[i].quantity > stock) {
      return next(
        new HttpError("Amount of chosen product exceeds current stocks.", 400)
      );
    }
  }

  res.json({ message: "All Clear!" });
};

// Profile

exports.changeProfile = async (req, res, next) => {
  const { name, password } = req.body;
  const image = req.file;

  let user;
  try {
    user = await User.findById(req.user.userId);

    if (name !== user.name) {
      user.name = name;
    }

    if (password) {
      if (password.length < 7) {
        return next(new HttpError("New Password is too short!", 422));
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      user.password = hashedPassword;
    }

    if (image) {
      if (user.image) {
        const imagePath = user.image.split(process.env.SERVER_URL + "/")[1];
        fs.unlink(imagePath, (err) => console.log(err));
      }

      user.image = process.env.SERVER_URL + "/" + image.path.replace("\\", "/");
    }

    await user.save();
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ user });
};

// Address

exports.getAddresses = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.user.userId);
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ addresses: user.addresses });
};

exports.addAddress = async (req, res, next) => {
  const { address, city, postalCode, country } = req.body;

  let user;
  try {
    user = await User.findById(req.user.userId);
    user.addresses.push({ address, city, postalCode, country });
    await user.save();
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.status(201).json({ addresses: user.addresses });
};

exports.editAddress = async (req, res, next) => {
  const { addressId } = req.params;
  const { address, city, postalCode, country } = req.body;

  let user;
  try {
    user = await User.findById(req.user.userId);
    const matchedAddress = user.addresses.find(
      (address) => address._id.toString() === addressId
    );
    matchedAddress.address = address;
    matchedAddress.city = city;
    matchedAddress.postalCode = postalCode;
    matchedAddress.country = country;

    await user.save();
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ addresses: user.addresses });
};

exports.deleteAddress = async (req, res, next) => {
  const { addressId } = req.params;

  let user;
  try {
    user = await User.findById(req.user.userId);
    user.addresses = user.addresses.filter(
      (address) => address._id.toString() !== addressId.toString()
    );
    await user.save();
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ addresses: user.addresses });
};

// Order

exports.getOrders = async (req, res, next) => {
  const { period } = req.query;

  const perPage = 3;
  let orders;
  try {
    count = await Order.countDocuments({
      user: req.user.userId,
      createdAt: {
        $gt: period,
      },
    });
    orders = await Order.find({
      user: req.user.userId,
      createdAt: {
        $gt: period,
      },
    })
      .sort({
        createdAt: -1,
      })
      .limit(perPage);
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ orders, remainder: count - perPage });
};

exports.getMoreOrders = async (req, res, next) => {
  const { period } = req.query;
  const { page } = req.body;

  const perPage = 3;
  let orders, count;
  try {
    count = await Order.countDocuments({
      user: req.user.userId,
      createdAt: {
        $gt: period,
      },
    });
    orders = await Order.find({
      user: req.user.userId,
      createdAt: {
        $gt: period,
      },
    })
      .sort({
        createdAt: -1,
      })
      .limit(perPage * (page + 1));
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ orders, remainder: count - (page + 1) * perPage });
};

exports.getOrderDetail = async (req, res, next) => {
  const { orderId } = req.params;

  let order;
  try {
    order = await Order.findById(orderId);
    if (!order) {
      return next(new HttpError("No Order Found.", 404));
    }

    if (
      !req.user.isAdmin &&
      order.user.toString() !== req.user.userId.toString()
    ) {
      return next(new HttpError("Unavailable access!", 400));
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ order });
};

exports.createOrder = async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    payment,
    itemsPrice,
    shippingPrice,
    tax,
    totalPrice,
  } = req.body;

  const order = new Order({
    user: req.user.userId,
    orderItems,
    shippingAddress,
    payment,
    itemsPrice,
    shippingPrice,
    tax,
    totalPrice,
  });
  try {
    await order.save();
    const user = await User.findById(req.user.userId);
    user.cart = [];
    await user.save();

    for (let i = 0; i < orderItems.length; i++) {
      let product = await Product.findById(orderItems[i].product);
      product.quantity -= 1;
      await product.save();
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.status(201).json({ message: "Ordered Successfully." });
};

// Review

exports.createReview = async (req, res, next) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  let product;
  try {
    const orders = await Order.find({ user: req.user.userId });
    const order = orders.find((order) =>
      order.orderItems.find(
        (item) => item.product.toString() === productId.toString()
      )
    );

    if (!order) {
      return next(
        new HttpError("This product is not in your order history!", 400)
      );
    }

    product = await Product.findById(productId);
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user.userId.toString()
    );

    if (alreadyReviewed) {
      return next(new HttpError("You've already reviewed this product.", 400));
    }

    if (!rating) {
      return next(new HttpError("Please check the rating."));
    }

    const review = {
      user: req.user.userId,
      rating,
      comment,
    };

    product.reviews.push(review);
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    product = await Product.findById(productId).populate({
      path: "reviews.user",
      select: ["name", "image"],
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.status(201).json({ product });
};

exports.getMessages = async (req, res, next) => {};

exports.sendMessageToadmin = async (req, res, next) => {};
