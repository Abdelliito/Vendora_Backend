import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import stripe from '../config/stripe.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const CURRENCY      = 'pkr';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create order + initiate Stripe Checkout session
// @route   POST /api/orders
// @access  Private — Customer
// ─────────────────────────────────────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, shippingCost = 0 } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  // Validate each item against DB (ensure stock + active)
  const validatedItems = [];
  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Product not found: ${item.productId}`);
    }
    if (product.stock < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for "${product.name}" — only ${product.stock} left`);
    }

    validatedItems.push({
      product:  product._id,
      vendorId: product.vendorId,
      name:     product.name,
      image:    product.images[0],
      price:    product.price,
      qty:      item.qty,
    });
  }

  // Build the order (pre-save hook calculates totals + commissions)
  const order = new Order({
    customer:        req.user._id,
    items:           validatedItems,
    shippingAddress,
    shippingCost,
    subtotal:        0,   // calculated in pre-save
    total:           0,   // calculated in pre-save
  });
  await order.save();

  // Build Stripe line items (PKR amounts must be in paisa — smallest unit)
  const lineItems = validatedItems.map((item) => ({
    price_data: {
      currency:     CURRENCY,
      product_data: { name: item.name, images: [item.image] },
      unit_amount:  Math.round(item.price * 100),   // PKR → paisa
    },
    quantity: item.qty,
  }));

  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency:     CURRENCY,
        product_data: { name: 'Shipping' },
        unit_amount:  Math.round(shippingCost * 100),
      },
      quantity: 1,
    });
  }

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items:           lineItems,
    mode:                 'payment',
    success_url:          `${FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:           `${FRONTEND_URL}/cart`,
    metadata:             { orderId: order._id.toString() },
    customer_email:       req.user.email,
  });

  // Save session ID for webhook reconciliation
  order.stripeSessionId = session.id;
  await order.save({ validateBeforeSave: false });

  res.status(201).json({
    success:    true,
    orderId:    order._id,
    sessionUrl: session.url,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get logged-in customer's orders
// @route   GET /api/orders/mine
// @access  Private — Customer
// ─────────────────────────────────────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name images');

  res.status(200).json({ success: true, count: orders.length, orders });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get vendor's received orders (items where vendorId = me)
// @route   GET /api/orders/vendor/sales
// @access  Private — Vendor
// ─────────────────────────────────────────────────────────────────────────────
export const getVendorSales = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    'items.vendorId': req.user._id,
    status: { $ne: 'Pending' },   // only show paid+ orders to vendor
  })
    .sort({ createdAt: -1 })
    .populate('customer', 'name email')
    .lean();

  // Filter items to only this vendor's items per order
  const vendorOrders = orders.map((order) => ({
    ...order,
    items: order.items.filter(
      (item) => item.vendorId.toString() === req.user._id.toString()
    ),
  }));

  // Revenue summary
  const summary = vendorOrders.reduce(
    (acc, order) => {
      order.items.forEach((item) => {
        acc.totalRevenue  += item.itemRevenue  || 0;
        acc.totalFees     += item.platformFee  || 0;
        acc.netEarnings   += item.vendorPayout || 0;
        acc.totalOrders   += 1;
      });
      return acc;
    },
    { totalRevenue: 0, totalFees: 0, netEarnings: 0, totalOrders: 0 }
  );

  res.status(200).json({ success: true, summary, orders: vendorOrders });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private — Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};

  const total  = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('customer', 'name email');

  res.status(200).json({ success: true, total, page: Number(page), orders });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private — Owner customer or Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email')
    .populate('items.product', 'name images');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isOwner = order.customer._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'Admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorised to view this order');
  }

  res.status(200).json({ success: true, order });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private — Vendor (own items), Admin
// ─────────────────────────────────────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Vendors can only update orders that include their products
  if (req.user.role === 'Vendor') {
    const hasVendorItems = order.items.some(
      (item) => item.vendorId.toString() === req.user._id.toString()
    );
    if (!hasVendorItems) {
      res.status(403);
      throw new Error('Not authorised — this order contains none of your products');
    }
  }

  order.status = status;
  if (status === 'Delivered') {
    order.isDelivered  = true;
    order.deliveredAt  = new Date();
  }

  await order.save();
  res.status(200).json({ success: true, order });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Stripe webhook — confirms payment and fulfils order
// @route   POST /api/stripe/webhook
// @access  Stripe (raw body, signature verified)
// ─────────────────────────────────────────────────────────────────────────────
export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig    = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const order   = await Order.findOne({ stripeSessionId: session.id });

    if (!order) {
      console.error('Webhook: order not found for session', session.id);
      return res.status(200).json({ received: true });
    }

    // Mark as paid
    order.status               = 'Paid';
    order.isPaid               = true;
    order.paidAt               = new Date();
    order.stripePaymentIntentId= session.payment_intent;
    await order.save({ validateBeforeSave: false });

    // Decrement stock for each product
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
    }

    console.log(`✅  Order ${order._id} marked as Paid`);
  }

  res.status(200).json({ received: true });
});
