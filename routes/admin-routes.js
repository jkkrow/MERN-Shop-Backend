const express = require("express");
const { check } = require("express-validator");

const adminController = require("../controllers/admin-controller");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");
const checkAdmin = require("../middleware/check-admin");
const HttpError = require("../models/HttpError");

const router = express.Router();

router.use(checkAuth);
router.use(checkAdmin);

// Product
router.get("/products", adminController.getProducts);

router.post(
  "/add-product",
  (req, res, next) => {
    fileUpload.array("images", 10)(req, res, (err) => {
      if (err) {
        return next(new HttpError("Maximum file number exceeded.", 500));
      }
      next();
    });
  },
  [
    check("title").trim().not().isEmpty(),
    check("brand").trim().not().isEmpty(),
    check("price").trim().not().isEmpty(),
    check("quantity").trim().not().isEmpty(),
    check("description").trim().not().isEmpty(),
    check("category").custom((value) => value !== "undefined"),
    check("images").custom((value, { req }) => req.files.length > 0),
  ],
  adminController.addProduct
);

router.patch(
  "/update-product/:productId",
  [
    check("title").trim().not().isEmpty(),
    check("brand").trim().not().isEmpty(),
    check("price").trim().not().isEmpty(),
    check("quantity").trim().not().isEmpty(),
    check("description").trim().not().isEmpty(),
    check("category").custom((value) => value !== "undefined"),
  ],
  adminController.updateProduct
);

router.delete("/delete-product/:productId", adminController.deleteProduct);

// User

router.get("/users", adminController.getUsers);
router.get("/user/:userId", adminController.getUser);
router.patch(
  "/update-user/:userId",
  [
    check("name").trim().not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
  ],
  adminController.updateUser
);
router.delete("/delete-user/:userId", adminController.deleteUser);

// Order

router.get("/orders", adminController.getOrders);
router.patch('/update-delivered/:orderId', adminController.updateDelivered)

module.exports = router;
