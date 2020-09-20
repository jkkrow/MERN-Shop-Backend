const express = require("express");
const { check } = require("express-validator");

const sellerController = require("../controllers/seller-controller");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");
const HttpError = require("../models/HttpError");

const router = express.Router();
const upload = fileUpload.array("images", 10);

router.use(checkAuth);

router.get("/my-products", sellerController.getMyProducts);

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
  sellerController.addProduct
);

router.patch(
  "/:productId",
  [
    check("title").trim().not().isEmpty(),
    check("price").trim().not().isEmpty(),
    check("description").trim().not().isEmpty(),
    check("category").custom((value) => value !== "undefined"),
  ],
  sellerController.updateProduct
);

router.delete("/:productId", sellerController.deleteProduct);

module.exports = router;
