import express from 'express';
import {
  createOrder,
  getMyOrders,
  getVendorSales,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly, vendorOnly } from '../middleware/roleMiddleware.js';
import {
  validateCreateOrder,
  validateOrderStatus,
  validateMongoId,
  validate,
} from '../middleware/validate.js';

const router = express.Router();

router.post('/',            protect,             validateCreateOrder,  validate, createOrder);
router.get('/mine',         protect,             getMyOrders);
router.get('/vendor/sales', protect, vendorOnly, getVendorSales);
router.get('/',             protect, adminOnly,  getAllOrders);
router.get('/:id',          protect, validateMongoId, validate,       getOrderById);
router.put('/:id/status',   protect, vendorOnly, validateMongoId, validateOrderStatus, validate, updateOrderStatus);

export default router;
