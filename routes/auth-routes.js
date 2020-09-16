const express = require("express");
const { check } = require("express-validator");

const authController = require("../controllers/auth-controller");

const router = express.Router();

router.post(
  "/signup",
  [
    check("name").trim().not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 7 }),
  ],
  authController.signup
);

router.post(
  "/login",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 7 }),
  ],
  authController.login
);

router.post("/google-login", authController.googleLogin);

module.exports = router;
