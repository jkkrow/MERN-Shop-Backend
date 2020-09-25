const express = require("express");

const userController = require("../controllers/user-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/products", userController.getProducts);
router.get("/detail/:productId", userController.getProductDetail);

// Need an authorization
router.use(checkAuth);

router.get("/cart", userController.getCart);
router.post("/add-to-cart", userController.addToCart);
router.post("/change-quantity", userController.changeQuantity);
router.delete("/remove-from-cart/:productId", userController.removeFromCart);

module.exports = router;
