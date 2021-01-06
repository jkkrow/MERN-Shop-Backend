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

router.post(
  "/send-recovery-email",
  [check("email").normalizeEmail().isEmail()],
  authController.sendRecoveryEmail
);

router.get("/reset-password", authController.resetPassword);

router.patch(
  "/update-password",
  [check("password").isLength({ min: 7 })],
  authController.updatePassword
);

module.exports = router;
