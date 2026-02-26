import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  addReview,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { vendorOnly } from '../middleware/roleMiddleware.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateReview,
  validateMongoId,
  validateProductQuery,
  validate,
} from '../middleware/validate.js';

const router = express.Router();

// Public
router.get('/',    validateProductQuery, validate, getProducts);
router.get('/:id', validateMongoId,      validate, getProductById);

// Vendor/Admin only
router.get('/vendor/mine', protect, vendorOnly, getMyProducts);
router.post('/',           protect, vendorOnly, validateCreateProduct, validate, createProduct);
router.put('/:id',         protect, vendorOnly, validateMongoId, validateUpdateProduct, validate, updateProduct);
router.delete('/:id',      protect, vendorOnly, validateMongoId, validate, deleteProduct);

// Customer — add review
router.post('/:id/reviews', protect, validateMongoId, validateReview, validate, addReview);

export default router;
