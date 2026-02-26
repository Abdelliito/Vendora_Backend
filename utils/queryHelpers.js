/**
 * buildProductQuery — parses req.query and returns a Mongoose filter object
 *
 * Supported query params:
 *   ?keyword=soap        → full-text search
 *   ?category=Clothing   → category filter
 *   ?minPrice=100        → price range (PKR)
 *   ?maxPrice=5000
 *   ?inStock=true        → only products with stock > 0
 *   ?vendorId=<id>       → products by a specific vendor
 *   ?page=2&limit=12     → pagination
 *   ?sort=price_asc|price_desc|newest|rating
 */
export const buildProductQuery = (query) => {
  const filter = { isActive: true };

  if (query.keyword) {
    filter.$text = { $search: query.keyword };
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.inStock === 'true') {
    filter.stock = { $gt: 0 };
  }

  if (query.vendorId) {
    filter.vendorId = query.vendorId;
  }

  return filter;
};

/**
 * buildSortOption — converts sort query param to Mongoose sort object
 */
export const buildSortOption = (sort) => {
  switch (sort) {
    case 'price_asc':  return { price: 1 };
    case 'price_desc': return { price: -1 };
    case 'rating':     return { rating: -1 };
    case 'newest':
    default:           return { createdAt: -1 };
  }
};

/**
 * paginate — returns skip, limit, and pagination metadata
 */
export const paginate = (query, total) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(50, parseInt(query.limit) || 12);
  const skip  = (page - 1) * limit;
  const pages = Math.ceil(total / limit);

  return { page, limit, skip, pages, total };
};
