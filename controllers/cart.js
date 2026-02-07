const bcrypt = require('bcrypt');

const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");

const auth = require("../auth");

module.exports.addToCart = async (req, res) => {
  const userId = req.user.id;
  
  const cartItems = req.body; // Modified to accept an array of products with quantities

  try {
    let userCart = await Cart.findOne({ userId });

    // If user's cart doesn't exist, create a new cart
    if (!userCart) {
      userCart = new Cart({
        userId,
        cartItems: [],
        totalPrice: 0,
      });
    }

    for (const cartItem of cartItems) {
      const { productId, quantity } = cartItem;

      // Find the product details
      const product = await Product.findById(productId);

      // If product doesn't exist or is inactive, return an error
      if (!product || !product.isActive) {
        return res.status(404).json({ message: "Product not found or inactive" });
      }

      // Calculate subtotal for the product
      let subtotal = product.price * quantity;

      // Find the product in the cartItems array
      const productIndex = userCart.cartItems.findIndex(
        (item) => item.productId === productId
      );

      if (productIndex !== -1) {
        // If the product already exists in the cart, update quantity and subtotal
        userCart.cartItems[productIndex].quantity += quantity;
        userCart.cartItems[productIndex].subtotal += subtotal;
      } else {
        // If the product doesn't exist in the cart, add it
        userCart.cartItems.push({
          productId,
          quantity,
          subtotal,
        });
      }

      // Update totalPrice
      userCart.totalPrice += subtotal;
    }

    // Save the updated cart
    await userCart.save();

    res
      .status(201)
      .json({ message: "Products added to cart successfully", cart: userCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getUserCart = (req, res) => {
  // const userId = req.body.userId;
  try {
    return Cart.find({ userId : req.user.id })
      .then((userCart) => {
        if (userCart.length > 0) {
          return res.status(200).send({ userCart });
        } else {
          return res.status(404).send({
            message: "The user's cart does not exists at the moment.",
          });
        }
      })
      .catch((err) => {
        console.error("Error in finding  the cart", err);

        return res
          .status(500)
          .send({ error: "Error finding the cart of the user " });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.updateCartQuantity = async (req, res) => {
  const userId = req.user.id;
  const updatedCartItems = req.body;

  try {
    // Find the user's cart
    let userCart = await Cart.findOne({ userId });

    // If user's cart doesn't exist, return an error
    if (!userCart) {
      return res.status(404).json({ message: "User's cart not found" });
    }

    for (const updatedCartItem of updatedCartItems) {
      const { productId, quantity } = updatedCartItem;

      // Find the product details
      const product = await Product.findById(productId);

      // If product doesn't exist or is inactive, return an error
      if (!product || !product.isActive) {
        return res.status(404).json({ message: `Product with ID ${productId} not found or inactive` });
      }

      // Calculate new subtotal for the product
      const newSubtotal = product.price * quantity;

      // Find the product in the cartItems array
      const productIndex = userCart.cartItems.findIndex(
        (item) => item.productId === productId
      );

      // If the product is not found in the cart, return an error
      if (productIndex === -1) {
        return res.status(404).json({ message: `Product with ID ${productId} not found in the cart` });
      }

      // Update quantity and subtotal in the cart
      userCart.cartItems[productIndex].quantity = quantity;
      userCart.cartItems[productIndex].subtotal = newSubtotal;
    }

    // Update totalPrice
    userCart.totalPrice = userCart.cartItems.reduce((total, item) => total + item.subtotal, 0);

    // Save the updated cart
    await userCart.save();

    res.status(200).json({ message: "Cart item quantities updated successfully", cart: userCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.removeProductsFromCart = async (req, res) => {
  try {
    const { productId } = req.params; // Modified to accept an array of productIds
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });

    // Filter out products with matching productIds
    cart.cartItems = cart.cartItems.filter(
      (item) => !productId.includes(item.productId)
    );

    // Recalculate totalPrice
    cart.totalPrice = cart.cartItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while removing products from the cart.");
  }
};

module.exports.clearCart = async (req, res) => {
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    cart.cartItems = []; // Emptying the cart items array
    cart.totalPrice = 0; // Resetting the total price
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
