const express = require("express");

const userController = require("../controllers/user-controller");
const checkAuth = require("../middleware/check-auth");
const fileUpload = require("../middleware/file-upload");

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

// Profile
router.patch(
  "/change-profile",
  fileUpload.single("image"),
  userController.changeProfile
);

// Address
router.get("/addresses", userController.getAddresses);
router.post("/add-address", userController.addAddress);
router.patch("/update-address/:addressId", userController.editAddress);
router.delete("/delete-address/:addressId", userController.deleteAddress);

// Order
router.get("/orders", userController.getOrders);
router.post("/more-orders", userController.getMoreOrders);
router.get("/order-detail/:orderId", userController.getOrderDetail);
router.post("/create-order", userController.createOrder);

// Review
router.post("/review/:productId",(req, res, next) => {
    fileUpload.array("images", 5)(req, res, (err) => {
      if (err) {
        return next(new HttpError("Maximum file number exceeded.", 500));
      }
      next();
    });
  }, userController.createReview);

module.exports = router;
