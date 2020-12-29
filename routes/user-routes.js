const express = require("express");

const userController = require("../controllers/user-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

// Product
router.get("/products", userController.getProducts);
router.get("/detail/:productId", userController.getProductDetail);

// Need an authorization
router.use(checkAuth);

// Cart
router.get("/cart", userController.getCart);
router.post("/move-items", userController.moveItems);
router.post("/add-to-cart", userController.addToCart);
router.patch("/change-quantity", userController.changeQuantity);
router.delete("/remove-from-cart/:productId", userController.removeFromCart);
router.post("/start-checkout", userController.startCheckout);

// Address
router.get("/addresses", userController.getAddresses);
router.post("/add-address", userController.addAddress);
router.patch("/update-address/:addressId", userController.editAddress);
router.delete("/delete-address/:addressId", userController.deleteAddress);

// Order
router.get("/orders", userController.getOrders);
router.get("/order-detail/:orderId", userController.getOrderDetail);
router.post("/create-order", userController.createOrder);

// Review
router.post("/review/:productId", userController.createReview);

module.exports = router;
