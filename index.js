require("dotenv").config()
const express = require("express");
const mongoose = require("mongoose");

const passport = require("passport");
const session = require("express-session");
require("./passport");
const cors = require("cors");

const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const cartRoutes = require("./routes/cart");

const port = 4000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : true }));

mongoose.connect("mongodb+srv://admin098:admin098@capstone2.yoqk1he.mongodb.net/E-Commerce-API?retryWrites=true&w=majority",
		{
			useNewUrlParser : true,
			useUnifiedTopology : true
		}
);

mongoose.connection.once("open", () => console.log("Now connected to MongoDB Atlas"));

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);

if(require.main === module){

	app.listen(process.env.PORT || port, () => {
		console.log(`API is now online on port ${ process.env.PORT || port }`)
	})

}

module.exports = { 	app, 
					mongoose };
