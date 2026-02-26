import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Only allow Customer and Vendor self-registration
  const allowedRoles = ['Customer', 'Vendor'];
  const assignedRole = allowedRoles.includes(role) ? role : 'Customer';

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: assignedRole,
    storeInfo: assignedRole === 'Vendor' ? {} : undefined,
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    token,
    user: {
      _id:       user._id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      storeInfo: user.storeInfo,
      isActive:  user.isActive,
      createdAt: user.createdAt,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  // .select('+password') because password has select:false on schema
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Account deactivated — contact support');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    token,
    user: {
      _id:       user._id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      storeInfo: user.storeInfo,
      avatar:    user.avatar,
      isActive:  user.isActive,
      lastLogin: user.lastLogin,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json({ success: true, user });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update profile (name, password, storeInfo)
// @route   PUT /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.body.name)      user.name   = req.body.name;
  if (req.body.avatar)    user.avatar = req.body.avatar;

  // Password update requires current password verification
  if (req.body.newPassword) {
    if (!req.body.currentPassword) {
      res.status(400);
      throw new Error('Current password is required to set a new password');
    }
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }
    user.password = req.body.newPassword;
  }

  // Vendor can update their store info
  if (req.body.storeInfo && user.role === 'Vendor') {
    user.storeInfo = { ...user.storeInfo?.toObject(), ...req.body.storeInfo };
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    user: updatedUser,
    ...(req.body.newPassword && { token: generateToken(updatedUser._id, updatedUser.role) }),
  });
});
