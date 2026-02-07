const bcrypt = require('bcrypt');
const auth = require("../auth");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");

module.exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  try {

    const user = await User.findById(userId);
    if (user.isAdmin) {
      return res.status(403).json({ message: "Admins are not allowed to make a checkout" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const orderedProducts = new Order({
      userId: userId,
      productsOrdered: cart.cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      totalPrice: cart.totalPrice,
    });

    const checkout = await orderedProducts.save();

    res.status(201).json({ message: "Order created successfully", checkout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.retrievedByAdmin = async (req, res) => {
  try {

    const orders = await Order.find({});

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }
    res.status(200).json({ message: "Orders retrieved successfully", orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.retrievedByAuthUser = async (req, res) => {
  console.log(req.user.id);
  const userId = req.user.id;
  try {
    if (req.user.isAdmin) {
      return res.status(403).send({ message: "Admin Access is Not Allowed" });
    } else {

      const orders = await Order.find({ userId });

      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: "No orders found" });
      }

      res.status(200).json({ message: "Order retrieved successfully", orders });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
