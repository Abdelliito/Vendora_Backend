import { body, param, query, validationResult } from 'express-validator';
import { PRODUCT_CATEGORIES } from '../models/Product.js';

/**
 * validate — runs after any chain of express-validator checks.
 * If errors exist, responds 400 with all messages. Otherwise calls next().
 *
 * Usage:
 *   router.post('/route', [...rules], validate, controller)
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('role')
    .optional()
    .isIn(['Customer', 'Vendor']).withMessage('Role must be Customer or Vendor'),
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),

  body('currentPassword')
    .if(body('newPassword').exists())
    .notEmpty().withMessage('Current password is required when setting a new password'),

  body('newPassword')
    .optional()
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number'),

  body('storeInfo.name')
    .optional()
    .trim()
    .isLength({ max: 80 }).withMessage('Store name cannot exceed 80 characters'),

  body('storeInfo.description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Store description cannot exceed 500 characters'),
];

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 120 }).withMessage('Product name cannot exceed 120 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10–2000 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number')
    .toFloat(),

  body('images')
    .isArray({ min: 1, max: 5 }).withMessage('Provide 1–5 product image URLs'),

  body('images.*')
    .isURL().withMessage('Each image must be a valid URL'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(PRODUCT_CATEGORIES).withMessage(`Category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`),

  body('stock')
    .notEmpty().withMessage('Stock quantity is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
    .toInt(),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage('Each tag cannot exceed 30 characters'),
];

export const validateUpdateProduct = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 120 }).withMessage('Product name cannot exceed 120 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10–2000 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number')
    .toFloat(),

  body('images')
    .optional()
    .isArray({ min: 1, max: 5 }).withMessage('Provide 1–5 product image URLs'),

  body('images.*')
    .optional()
    .isURL().withMessage('Each image must be a valid URL'),

  body('category')
    .optional()
    .isIn(PRODUCT_CATEGORIES).withMessage(`Category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
    .toInt(),
];

export const validateReview = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
    .toInt(),

  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 5, max: 1000 }).withMessage('Comment must be 5–1000 characters'),
];

// ─────────────────────────────────────────────────────────────────────────────
// ORDER VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const validateCreateOrder = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),

  body('items.*.productId')
    .notEmpty().withMessage('Each item must have a productId')
    .isMongoId().withMessage('Invalid productId format'),

  body('items.*.qty')
    .notEmpty().withMessage('Each item must have a quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    .toInt(),

  body('shippingAddress.fullName')
    .trim()
    .notEmpty().withMessage('Full name is required'),

  body('shippingAddress.phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^(\+92|0)[0-9]{9,10}$/).withMessage('Enter a valid Pakistani phone number'),

  body('shippingAddress.street')
    .trim()
    .notEmpty().withMessage('Street address is required'),

  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('shippingAddress.province')
    .trim()
    .notEmpty().withMessage('Province is required'),

  body('shippingCost')
    .optional()
    .isFloat({ min: 0 }).withMessage('Shipping cost must be a positive number')
    .toFloat(),
];

export const validateOrderStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'])
    .withMessage('Invalid order status'),
];

// ─────────────────────────────────────────────────────────────────────────────
// PARAM VALIDATORS (shared)
// ─────────────────────────────────────────────────────────────────────────────

export const validateMongoId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
];

// ─────────────────────────────────────────────────────────────────────────────
// QUERY VALIDATORS (product listing)
// ─────────────────────────────────────────────────────────────────────────────

export const validateProductQuery = [
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('minPrice must be a positive number'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('maxPrice must be a positive number'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),

  query('sort')
    .optional()
    .isIn(['newest', 'price_asc', 'price_desc', 'rating'])
    .withMessage('Invalid sort option'),
];
