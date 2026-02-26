import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validate,
} from '../middleware/validate.js';

const router = express.Router();

router.post('/register', authLimiter, validateRegister,     validate, register);
router.post('/login',    authLimiter, validateLogin,        validate, login);
router.get('/profile',   protect,                                     getProfile);
router.put('/profile',   protect,    validateUpdateProfile, validate, updateProfile);

export default router;
