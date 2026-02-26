import express from 'express';
import { stripeWebhook } from '../controllers/orderController.js';

const router = express.Router();

// NOTE: Raw body parsing is applied in index.js BEFORE this route
// so that Stripe signature verification works correctly.
router.post('/', stripeWebhook);

export default router;
