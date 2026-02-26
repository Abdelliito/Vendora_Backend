import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Platform-wide stats overview
// @route   GET /api/admin/stats
// @access  Private — Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getPlatformStats = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalVendors,
    totalProducts,
    totalOrders,
    paidOrders,
  ] = await Promise.all([
    User.countDocuments({ role: 'Customer' }),
    User.countDocuments({ role: 'Vendor' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.find({ status: { $in: ['Paid', 'Processing', 'Shipped', 'Delivered'] } })
      .select('total platformFeeTotal')
      .lean(),
  ]);

  const totalRevenue       = paidOrders.reduce((s, o) => s + o.total, 0);
  const totalPlatformFees  = paidOrders.reduce((s, o) => s + (o.platformFeeTotal || 0), 0);

  // Orders by status
  const statusAgg = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const ordersByStatus = statusAgg.reduce((acc, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  // Recent 5 orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('customer', 'name email');

  res.status(200).json({
    success: true,
    currency: process.env.CURRENCY || 'PKR',
    stats: {
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      paidOrdersCount: paidOrders.length,
      totalRevenue:      parseFloat(totalRevenue.toFixed(2)),
      totalPlatformFees: parseFloat(totalPlatformFees.toFixed(2)),
      ordersByStatus,
    },
    recentOrders,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all users (with optional role filter)
// @route   GET /api/admin/users
// @access  Private — Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role)     filter.role     = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ success: true, total, page: Number(page), users });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Toggle user active / deactivated status
// @route   PUT /api/admin/users/:id
// @access  Private — Admin
// ─────────────────────────────────────────────────────────────────────────────
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'Admin') {
    res.status(400);
    throw new Error('Cannot deactivate an Admin account');
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    user,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Commission summary — per vendor breakdown
// @route   GET /api/admin/commission
// @access  Private — Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getCommissionSummary = asyncHandler(async (req, res) => {
  const result = await Order.aggregate([
    { $match: { status: { $in: ['Paid', 'Processing', 'Shipped', 'Delivered'] } } },
    { $unwind: '$items' },
    {
      $group: {
        _id:          '$items.vendorId',
        totalRevenue: { $sum: '$items.itemRevenue' },
        totalFees:    { $sum: '$items.platformFee' },
        netEarnings:  { $sum: '$items.vendorPayout' },
        orderCount:   { $sum: 1 },
      },
    },
    {
      $lookup: {
        from:         'users',
        localField:   '_id',
        foreignField: '_id',
        as:           'vendor',
      },
    },
    { $unwind: '$vendor' },
    {
      $project: {
        vendorId:     '$_id',
        vendorName:   '$vendor.name',
        vendorEmail:  '$vendor.email',
        storeName:    '$vendor.storeInfo.name',
        totalRevenue: 1,
        totalFees:    1,
        netEarnings:  1,
        orderCount:   1,
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  const grandTotal = result.reduce(
    (acc, v) => {
      acc.revenue  += v.totalRevenue;
      acc.fees     += v.totalFees;
      acc.earnings += v.netEarnings;
      return acc;
    },
    { revenue: 0, fees: 0, earnings: 0 }
  );

  res.status(200).json({
    success: true,
    currency: process.env.CURRENCY || 'PKR',
    grandTotal,
    vendors: result,
  });
});
