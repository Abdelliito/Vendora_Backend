/**
 * authorise(...roles) — restricts route to specific roles
 * Must be used AFTER protect middleware
 *
 * Usage:
 *   router.post('/products', protect, authorise('Vendor', 'Admin'), createProduct)
 */
export const authorise = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied — role '${req.user.role}' is not authorised for this action`
      );
    }
    next();
  };
};

/**
 * Convenience role guards (shorthand for common patterns)
 */
export const adminOnly  = authorise('Admin');
export const vendorOnly = authorise('Vendor', 'Admin');
