const express = require("express");
const { check } = require("express-validator");

const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const sellerController = require("../controllers/seller-controller");

const router = express.Router();

router.use(checkAuth);

router.post(
  "/add-product",
  fileUpload.array("images", 10),
  [
    check("title").trim().not().isEmpty(),
    check("price").trim().not().isEmpty(),
    check("description").trim().not().isEmpty(),
    check("category").custom((value) => value !== "undefined"),
    check("images").custom((value, { req }) => req.files.length > 0),
  ],
  sellerController.addProduct
);

router.get("/my-products", sellerController.getProductsById);

module.exports = router;
