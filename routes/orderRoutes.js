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
// Admin: update global order status
router.put('/:id/status',   protect, adminOnly, validateMongoId, validateOrderStatus, validate, updateOrderStatus);

// Vendor: update status of their own item in an order
router.patch('/:orderId/items/:itemId/status',
  protect,
  vendorOnly,
  validateMongoId,
  validateOrderStatus,
  validate,
  require('../controllers/orderController.js').updateOrderItemStatus
);

export default router;
