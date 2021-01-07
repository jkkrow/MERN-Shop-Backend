const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { v1: uuidv1 } = require("uuid");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");
const HttpError = require("../models/HttpError");
const { reset } = require("nodemon");

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
      name: user.name,
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
      name: user.name,
      image: user.image,
    },
  });
};

exports.sendRecoveryEmail = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Please enter valid inputs.", 422));
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new HttpError("No User found with given E-mail!", 404));
    }

    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${process.env.HOST_EMAIL}`,
        pass: `${process.env.HOST_PASSWORD}`,
      },
    });

    const mailOptions = {
      from: "MERN Shop",
      to: `${user.email}`,
      subject: "Link to Reset Password",
      text: `Your are receiving this because you have requested the reset of the password for your account.\nPlease click the following link to complete the process within one hour.\n\n${process.env.CLIENT_URL}/reset-password/${token}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.log(err);
        return next(err);
      }
    });
  } catch (err) {
    return next(new HttpError("Something went wrong, please try again.", 500));
  }

  res.json({ message: "Recovery Email has sent." });
};

exports.resetPassword = async (req, res, next) => {
  const { resetPasswordToken } = req.query;

  let user;
  try {
    user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new HttpError("This recovery link is invalid or has expired.", 403)
      );
    }
  } catch (err) {
    return next(new HttpError("Server error! Please try again", 500));
  }

  res.json({ userId: user._id });
};

exports.updatePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Please enter valid inputs.", 422));
  }

  const { userId, password } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(new HttpError("User not found.", 404));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  } catch (err) {
    return next(
      new HttpError("Updating password failed, please try again.", 500)
    );
  }

  res.json({ message: "Changed password successfully!" });
};

exports.deleteAccount = async (req, res, next) => {};
