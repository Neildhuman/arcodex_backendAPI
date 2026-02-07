const express = require("express");

const cartController = require("../controllers/cart");

const { verify, verifyAdmin, /*isLoggedIn*/ } = require("../auth");

const router = express.Router();

router.get("/", verify, cartController.getUserCart);

router.post("/addToCart", verify, cartController.addToCart);

router.patch("/updateQuantity", verify, cartController.updateCartQuantity);

router.delete("/:productId/removeFromCart", verify, cartController.removeProductsFromCart);

router.delete("/clearCart", verify, cartController.clearCart);

module.exports = router;

