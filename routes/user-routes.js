const express = require("express");

const userController = require("../controllers/user-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/products", userController.getProducts);
router.get("/:productId", userController.getProductDetail);
router.get("/cart", userController.getCart);

// // Need an authorization
// router.use(checkAuth)


module.exports = router;
