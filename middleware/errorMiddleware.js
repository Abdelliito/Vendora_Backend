/**
 * notFound — catch-all for unmatched routes
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * errorHandler — centralised error response formatter
 * Converts thrown errors into consistent JSON responses
 */
export const errorHandler = (err, req, res, _next) => {
  // Fallback to 500 if status is still 200 (uncaught throw)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: `Invalid ID format: ${err.value}`,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    return;
  }

  // Mongoose duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    res.status(400).json({
      success: false,
      message: `${field} already exists`,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    return;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({
      success: false,
      message: messages.join(', '),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Token expired — please login again' });
    return;
  }

  // Default
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
