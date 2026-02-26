import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const storeInfoSchema = new mongoose.Schema(
  {
    name:        { type: String, trim: true, maxlength: 80 },
    description: { type: String, maxlength: 500 },
    logo:        { type: String },           // Cloudinary URL
    banner:      { type: String },           // Cloudinary URL
    address:     { type: String, maxlength: 200 },
    phone:       { type: String, maxlength: 20 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false,   // never returned in queries by default
    },

    role: {
      type:    String,
      enum:    ['Admin', 'Vendor', 'Customer'],
      default: 'Customer',
    },

    // Vendor-specific store details (only populated when role = Vendor)
    storeInfo: {
      type:    storeInfoSchema,
      default: null,
    },

    // Profile avatar (optional)
    avatar: { type: String },

    isActive: {
      type:    Boolean,
      default: true,
    },

    // Track last login for security audits
    lastLogin: { type: Date },
  },
  {
    timestamps: true,   // adds createdAt + updatedAt
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });

// ── Pre-save hook: hash password before saving ────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare plain password with hash ────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ── Strip sensitive fields from JSON output ───────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
