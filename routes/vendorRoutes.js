import express from 'express';
import { getAllVendors, getVendorProfile, getVendorDashboard } from '../controllers/vendorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { vendorOnly } from '../middleware/roleMiddleware.js';
import { validateMongoId, validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/',           getAllVendors);
router.get('/dashboard',  protect, vendorOnly, getVendorDashboard);
router.get('/:id',        validateMongoId, validate, getVendorProfile);

export default router;
