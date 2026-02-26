import asyncHandler from 'express-async-handler';
import Product, { PRODUCT_CATEGORIES } from '../models/Product.js';
import { buildProductQuery, buildSortOption, paginate } from '../utils/queryHelpers.js';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all active products (public, with search / filter / pagination)
// @route   GET /api/products
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getProducts = asyncHandler(async (req, res) => {
  const filter = buildProductQuery(req.query);
  const sort   = buildSortOption(req.query.sort);

  const total      = await Product.countDocuments(filter);
  const pagination = paginate(req.query, total);

  const products = await Product.find(filter)
    .populate('vendorId', 'name storeInfo.name storeInfo.logo')
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .lean();

  res.status(200).json({
    success: true,
    count:   products.length,
    pagination,
    categories: PRODUCT_CATEGORIES,
    products,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('vendorId', 'name email storeInfo avatar')
    .populate('reviews.user', 'name avatar');

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({ success: true, product });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new product
// @route   POST /api/products
// @access  Private — Vendor, Admin
// ─────────────────────────────────────────────────────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, images, category, stock, tags, variants } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    images,
    category,
    stock,
    tags,
    variants,
    vendorId: req.user._id,
  });

  res.status(201).json({ success: true, product });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a product (owner vendor or admin only)
// @route   PUT /api/products/:id
// @access  Private — Vendor (own), Admin
// ─────────────────────────────────────────────────────────────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Ownership check (Admin bypasses)
  if (req.user.role !== 'Admin' && product.vendorId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorised — you can only edit your own products');
  }

  const updatable = ['name', 'description', 'price', 'images', 'category', 'stock', 'tags', 'variants'];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  const updatedProduct = await product.save();
  res.status(200).json({ success: true, product: updatedProduct });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Soft-delete a product
// @route   DELETE /api/products/:id
// @access  Private — Vendor (own), Admin
// ─────────────────────────────────────────────────────────────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (req.user.role !== 'Admin' && product.vendorId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorised — you can only delete your own products');
  }

  product.isActive = false;
  await product.save();

  res.status(200).json({ success: true, message: 'Product removed' });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get logged-in vendor's products
// @route   GET /api/products/vendor/mine
// @access  Private — Vendor
// ─────────────────────────────────────────────────────────────────────────────
export const getMyProducts = asyncHandler(async (req, res) => {
  const filter = { vendorId: req.user._id };

  // Vendor can see their inactive products too (for management)
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: products.length, products });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Add a review to a product
// @route   POST /api/products/:id/reviews
// @access  Private — Customer
// ─────────────────────────────────────────────────────────────────────────────
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
  product.recalculateRating();
  await product.save();

  res.status(201).json({ success: true, message: 'Review added' });
});
