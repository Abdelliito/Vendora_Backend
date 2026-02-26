import mongoose from 'mongoose';

// ── Predefined categories (Multi-vendor marketplace) ─────────────────────────
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing & Fashion',
  'Food & Beverages',
  'Handmade & Crafts',
  'Home & Living',
  'Books & Stationery',
  'Health & Beauty',
  'Sports & Outdoors',
  'Toys & Kids',
  'Digital Products',
  'Jewellery & Accessories',
  'Art & Collectibles',
  'Automotive',
  'Other',
];

// ── Review sub-document ───────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// ── Product schema ────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Product name is required'],
      trim:      true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },

    description: {
      type:      String,
      required:  [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    price: {
      type:    Number,
      required:[true, 'Price is required'],
      min:     [0, 'Price cannot be negative'],
      // Stored in PKR (whole rupees)
    },

    images: {
      type:     [String],           // Array of Cloudinary URLs
      required: [true, 'At least one image is required'],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 5,
        message:   'Product must have 1–5 images',
      },
    },

    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum:     {
        values:  PRODUCT_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },

    stock: {
      type:    Number,
      required:[true, 'Stock quantity is required'],
      default: 0,
      min:     [0, 'Stock cannot be negative'],
    },

    // Multi-vendor: every product belongs to a Vendor
    vendorId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Vendor reference is required'],
    },

    reviews:    [reviewSchema],
    rating:     { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    // Optional variant fields (stretch)
    variants: [
      {
        label: { type: String },          // e.g. "Size", "Colour"
        options: [{ type: String }],      // e.g. ["S", "M", "L"]
        _id: false,
      },
    ],

    // Soft delete — product stays in DB for order history
    isActive: { type: Boolean, default: true },

    // SEO / search
    tags: [{ type: String, lowercase: true, trim: true }],
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ vendorId: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // full-text search
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });   // for low-stock alerts

// ── Virtual: stockStatus ──────────────────────────────────────────────────────
productSchema.virtual('stockStatus').get(function () {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= 5) return 'low_stock';
  return 'in_stock';
});

// ── Method: recalculate average rating after a new review ────────────────────
productSchema.methods.recalculateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.numReviews = this.reviews.length;
    this.rating =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.numReviews;
  }
};

const Product = mongoose.model('Product', productSchema);
export default Product;
