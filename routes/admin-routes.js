const express = require("express");
const { check } = require("express-validator");

const adminController = require("../controllers/admin-controller");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");
const checkAdmin = require("../middleware/check-admin");
const HttpError = require("../models/HttpError");

const router = express.Router();
const upload = fileUpload.array("images", 10);

router.use(checkAuth);
router.use(checkAdmin);

// Product
router.get("/products", adminController.getProducts);

router.post(
  "/add-product",
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return next(new HttpError("Maximum file number exceeded.", 500));
      }
      next();
    });
  },
  [
    check("title").trim().not().isEmpty(),
    check("price").trim().not().isEmpty(),
    check("description").trim().not().isEmpty(),
    check("category").custom((value) => value !== "undefined"),
    check("images").custom((value, { req }) => req.files.length > 0),
  ],
  adminController.addProduct
);

router.patch(
  "/:productId",
  [
    check("title").trim().not().isEmpty(),
    check("price").trim().not().isEmpty(),
    check("description").trim().not().isEmpty(),
    check("category").custom((value) => value !== "undefined"),
  ],
  adminController.updateProduct
);

router.delete("/:productId", adminController.deleteProduct);

// User

router.get("/users", adminController.getUsers);
router.delete("/delete-user/:userId", adminController.deleteUser);

module.exports = router;
