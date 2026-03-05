import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Get current user's cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  res.status(200).json({ success: true, cart });
});

// Add or update item in cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }
  const idx = cart.items.findIndex(item => item.product.toString() === productId);
  if (idx !== -1) {
    cart.items[idx].qty = qty;
  } else {
    cart.items.push({ product: productId, qty });
  }
  cart.updatedAt = new Date();
  await cart.save();
  res.status(200).json({ success: true, cart });
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  cart.updatedAt = new Date();
  await cart.save();
  res.status(200).json({ success: true, cart });
});

// Clear cart
export const clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  cart.items = [];
  cart.updatedAt = new Date();
  await cart.save();
  res.status(200).json({ success: true, cart });
});
