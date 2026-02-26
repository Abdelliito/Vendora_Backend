import mongoose from 'mongoose';

// ── Order item sub-document ───────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Product',
      required: true,
    },
    vendorId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    // Snapshot fields — copied at time of purchase so historic orders
    // are never affected by future product edits / deletions
    name:     { type: String, required: true },
    image:    { type: String, required: true },
    price:    { type: Number, required: true },   // unit price in PKR
    qty:      { type: Number, required: true, min: 1 },

    // Commission breakdown per line item (calculated on payment)
    itemRevenue:   { type: Number, default: 0 },  // price × qty
    platformFee:   { type: Number, default: 0 },  // itemRevenue × commissionRate
    vendorPayout:  { type: Number, default: 0 },  // itemRevenue - platformFee

    // Fulfillment status per vendor
    itemStatus: {
      type:    String,
      enum:    ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { _id: false }
);

// ── Shipping address sub-document ─────────────────────────────────────────────
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone:    { type: String, required: true },
    street:   { type: String, required: true },
    city:     { type: String, required: true },
    province: { type: String, required: true },
    zip:      { type: String },
    country:  { type: String, default: 'Pakistan' },
  },
  { _id: false }
);

// ── Order schema ──────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    customer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    items: {
      type:     [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 1,
        message:   'Order must contain at least one item',
      },
    },

    shippingAddress: {
      type:     shippingAddressSchema,
      required: true,
    },

    // Financials (all in PKR)
    subtotal:        { type: Number, required: true },   // sum of all itemRevenue
    platformFeeTotal:{ type: Number, default: 0 },       // sum of all platformFee (multi-vendor)
    shippingCost:    { type: Number, default: 0 },
    total:           { type: Number, required: true },   // subtotal + shippingCost

    commissionRate: {
      type:    Number,
      default: 0.10,
    },

    // Payment
    paymentMethod:    { type: String, default: 'stripe' },
    stripeSessionId:  { type: String },
    stripePaymentIntentId: { type: String },

    // Order lifecycle
    status: {
      type:    String,
      enum:    ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
      default: 'Pending',
    },

    isPaid:    { type: Boolean, default: false },
    paidAt:    { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },

    // Admin / support notes
    notes: { type: String, maxlength: 500 },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ 'items.vendorId': 1, createdAt: -1 });   // vendor sales queries
orderSchema.index({ status: 1 });
orderSchema.index({ stripeSessionId: 1 });

// ── Pre-save: calculate all financial totals ──────────────────────────────────
orderSchema.pre('save', function (next) {
  const rate = this.commissionRate || parseFloat(process.env.PLATFORM_COMMISSION_RATE) || 0.10;

  let subtotal = 0;
  let platformFeeTotal = 0;

  this.items = this.items.map((item) => {
    const itemRevenue  = item.price * item.qty;
    const platformFee  = parseFloat((itemRevenue * rate).toFixed(2));
    const vendorPayout = parseFloat((itemRevenue - platformFee).toFixed(2));

    subtotal        += itemRevenue;
    platformFeeTotal+= platformFee;

    return { ...item, itemRevenue, platformFee, vendorPayout };
  });

  this.subtotal         = parseFloat(subtotal.toFixed(2));
  this.platformFeeTotal = parseFloat(platformFeeTotal.toFixed(2));
  this.total            = parseFloat((subtotal + (this.shippingCost || 0)).toFixed(2));

  next();
});

// ── Virtual: unique vendor IDs in this order ──────────────────────────────────
orderSchema.virtual('involvedVendors').get(function () {
  return [...new Set(this.items.map((i) => i.vendorId.toString()))];
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
