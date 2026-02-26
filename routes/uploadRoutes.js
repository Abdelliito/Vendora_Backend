import express from 'express';
import { getUploadSignature } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { vendorOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, vendorOnly, getUploadSignature);

export default router;
