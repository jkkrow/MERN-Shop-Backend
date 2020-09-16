const express = require("express");

const userController = require("../controllers/user-controller");

const router = express.Router();

router.get("/products", userController.getProducts);

router.get("/product-detail/:productId", userController.getProductDetail);

module.exports = router;
