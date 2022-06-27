const express = require("express");
const route = express.Router();
const jwt = require("jsonwebtoken");
const authenticate = require('../../middleware/authentication')

//importing product schema
const Product = require("../../Models/Schemas/product");
const Cart = require("../../Models/Schemas/cart");
const { default: mongoose } = require("mongoose");


//routes
route.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ message: "Successfully found the products", success: true, products: products });
  } catch (err) {
    res.status(404).json({ message: "Error while loading the products", success: false });
  }
});

route.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json({ message: "Successfully found the products", success: true, product: product });
  } catch (err) {
    res.status(404).json({ message: "Error while loading the products", success: false });
  }
});

route.post("/addcart", authenticate, async (req, res) => {
  try {
    const decodedId = req.userId
    const userCart = await Cart.findById({ _id: decodedId });
    if (userCart) {
      userCart.items = req.body.items
      await userCart.save()
      res.status(200).json({ message: "Product Added to the cart", success: true, cart: userCart, })
    } else {
      const newCart = await Cart.create({
        userId: decodedId,
        items: req.body.items.map((i) => ({ item: mongoose.Types.ObjectId(i) })),
      })
      res.status(200).json({ message: "Product Added to the cart", success: true, cart: newCart, });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "Error while adding cart", success: false });
  }
});

route.get('/getcart', authenticate, async (req, res) => {
  try {
    const userCart = await Cart.findOne({ 'userId': req.userId })
    await userCart.populate('items.item')
    res.status(200).json({ cart: userCart.items })
  } catch (err) {
    console.log(err)
  }
})

module.exports = route;