const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const HttpError = require("../models/HttpError");

// Product

exports.getProducts = async (req, res, next) => {
  const perPage = 3;
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
  let orders;
  try {
    orders = await Order.find({ user: req.user.userId });
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json({ orders });
};

exports.getOrderDetail = async (req, res, next) => {
  const { orderId } = req.params;

  let order;
  try {
    order = await Order.findById(orderId);
    if (!order) {
      return next(new HttpError("No Order Found.", 404));
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
