const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v1: uuidv1 } = require("uuid");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");
const HttpError = require("../models/HttpError");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Please enter valid inputs.", 422));
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new HttpError("E-mail already exists.", 422));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      cart: [],
      products: [],
    });

    await newUser.save();
  } catch (err) {
    return next(new HttpError("Signing up failed, please try again.", 500));
  }

  res.status(201).json({ message: "Signed up!" });
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Please enter valid inputs.", 422));
  }

  const { email, password } = req.body;

  let user, token;

  try {
    user = await User.findOne({ email });
    if (!user) {
      return next(new HttpError("Invalid email or password.", 403));
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      return next(new HttpError("Invalid email or password.", 403));
    }

    token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_KEY
    );
  } catch (err) {
    return next(new HttpError("Logging in failed, please try again.", 500));
  }

  res.json({
    token: token,
    user: {
      userId: user._id,
      isAdmin: user.isAdmin,
      email: user.email,
      image: user.image,
    },
  });
};

exports.googleLogin = async (req, res, next) => {
  const { tokenId } = req.body;

  let user, token;

  try {
    const result = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email_verified, email, name, picture } = result.payload;

    if (!email_verified) {
      throw new Error("Google login failed.");
    }

    user = await User.findOne({ email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(
        uuidv1() + new Date().valueOf(),
        12
      );

      user = new User({
        email,
        password: hashedPassword,
        name,
        image: picture,
        cart: [],
      });
      await user.save();
      res.status(201);
    }

    token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_KEY
    );
  } catch (err) {
    return next(new HttpError("Google login failed, please try again.", 500));
  }

  res.json({
    token: token,
    user: {
      userId: user._id,
      isAdmin: user.isAdmin,
      email: user.email,
      image: user.image,
    },
  });
};

exports.newPassword = async (req, res, next) => {};

exports.deleteAccount = async (req, res, next) => {};
