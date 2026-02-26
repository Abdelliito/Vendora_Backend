import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    List all active vendors (public)
// @route   GET /api/vendors
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getAllVendors = asyncHandler(async (req, res) => {
  const vendors = await User.find({ role: 'Vendor', isActive: true })
    .select('name storeInfo avatar createdAt')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: vendors.length, vendors });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get vendor public profile + their products
// @route   GET /api/vendors/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await User.findOne({ _id: req.params.id, role: 'Vendor', isActive: true })
    .select('name storeInfo avatar createdAt');

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  const products = await Product.find({ vendorId: vendor._id, isActive: true })
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({ success: true, vendor, products });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get vendor dashboard stats
// @route   GET /api/vendors/dashboard
// @access  Private — Vendor
// ─────────────────────────────────────────────────────────────────────────────
export const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;

  // Month boundaries
  const now       = new Date();
  const monthStart= new Date(now.getFullYear(), now.getMonth(), 1);

  // All paid orders containing this vendor's items
  const orders = await Order.find({
    'items.vendorId': vendorId,
    status:           { $in: ['Paid', 'Processing', 'Shipped', 'Delivered'] },
  }).lean();

  let totalRevenue = 0, totalFees = 0, netEarnings = 0;
  let ordersThisMonth = 0;
  const productSales = {};   // productId → { name, qty, revenue }

  orders.forEach((order) => {
    const myItems = order.items.filter(
      (item) => item.vendorId.toString() === vendorId.toString()
    );

    myItems.forEach((item) => {
      totalRevenue += item.itemRevenue  || 0;
      totalFees    += item.platformFee  || 0;
      netEarnings  += item.vendorPayout || 0;

      if (order.createdAt >= monthStart) ordersThisMonth++;

      // Aggregate top products
      const pid = item.product.toString();
      if (!productSales[pid]) {
        productSales[pid] = { name: item.name, qty: 0, revenue: 0 };
      }
      productSales[pid].qty     += item.qty;
      productSales[pid].revenue += item.itemRevenue || 0;
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([id, data]) => ({ productId: id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Stock alerts (stock <= 5)
  const lowStockProducts = await Product.find({
    vendorId: vendorId,
    isActive: true,
    stock:    { $lte: 5 },
  }).select('name stock images');

  // Total product count
  const totalProducts = await Product.countDocuments({ vendorId, isActive: true });

  res.status(200).json({
    success: true,
    currency: process.env.CURRENCY || 'PKR',
    stats: {
      totalRevenue:   parseFloat(totalRevenue.toFixed(2)),
      totalFees:      parseFloat(totalFees.toFixed(2)),
      netEarnings:    parseFloat(netEarnings.toFixed(2)),
      ordersThisMonth,
      totalOrders:    orders.length,
      totalProducts,
    },
    topProducts,
    lowStockProducts,
  });
});
