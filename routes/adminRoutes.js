import express from 'express';
import {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  getCommissionSummary,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';
import { validateMongoId, validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats',      getPlatformStats);
router.get('/users',      getAllUsers);
router.put('/users/:id',  validateMongoId, validate, toggleUserStatus);
router.get('/commission', getCommissionSummary);

export default router;
