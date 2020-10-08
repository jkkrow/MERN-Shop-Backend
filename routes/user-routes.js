const express = require("express");

const userController = require("../controllers/user-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/products", userController.getProducts);
router.get("/detail/:productId", userController.getProductDetail);

// Need an authorization
router.use(checkAuth);

// cart
router.get("/cart", userController.getCart);
router.post("/move-items", userController.moveItems);
router.post("/add-to-cart", userController.addToCart);
router.patch("/change-quantity", userController.changeQuantity);
router.delete("/remove-from-cart/:productId", userController.removeFromCart);

// address
router.get("/addresses", userController.getAddresses);
router.post("/add-address", userController.addAddress);
router.patch("/edit-address/:addressId", userController.editAddress);
router.delete("/delete-address/:addressId", userController.deleteAddress);

module.exports = router;
