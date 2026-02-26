import rateLimit from 'express-rate-limit';

/**
 * apiLimiter — general API rate limit (100 req / 15 min per IP)
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please try again later' },
});

/**
 * authLimiter — stricter limit for login/register (10 req / 15 min per IP)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts — please try again in 15 minutes' },
});
