/**
 * Seeder — populates DB with sample Admin, Vendors, and Products
 * Usage:
 *   node utils/seeder.js          → seed data
 *   node utils/seeder.js destroy  → wipe all data
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

dotenv.config();
connectDB();

const users = [
  {
    name:     'Super Admin',
    email:    'admin@finalproject.com',
    password: 'Admin@1234',
    role:     'Admin',
  },
  {
    name:     'Ayesha Khan',
    email:    'vendor1@finalproject.com',
    password: 'Vendor@1234',
    role:     'Vendor',
    storeInfo: {
      name:        'Ayesha Crafts',
      description: 'Handmade jewellery and accessories made with love in Lahore.',
    },
  },
  {
    name:     'Bilal Ahmed',
    email:    'vendor2@finalproject.com',
    password: 'Vendor@1234',
    role:     'Vendor',
    storeInfo: {
      name:        'TechBazar PK',
      description: 'Affordable electronics and accessories — original products only.',
    },
  },
  {
    name:     'Sana Mirza',
    email:    'customer@finalproject.com',
    password: 'Customer@1234',
    role:     'Customer',
  },
];

const seedData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers   = await User.create(users);
    const vendor1        = createdUsers.find((u) => u.email === 'vendor1@finalproject.com');
    const vendor2        = createdUsers.find((u) => u.email === 'vendor2@finalproject.com');

    const products = [
      {
        name:        'Handmade Silver Jhumkas',
        description: 'Elegant silver-tone jhumka earrings, handcrafted with semi-precious stones. Lightweight and hypoallergenic.',
        price:       1800,
        images:      ['https://via.placeholder.com/400x400?text=Jhumkas'],
        category:    'Jewellery & Accessories',
        stock:       30,
        vendorId:    vendor1._id,
        tags:        ['earrings', 'silver', 'handmade', 'jewellery'],
      },
      {
        name:        'Embroidered Clutch Bag',
        description: 'Vibrant hand-embroidered clutch bag — perfect for weddings and formal events. 100% handmade.',
        price:       2500,
        images:      ['https://via.placeholder.com/400x400?text=Clutch'],
        category:    'Handmade & Crafts',
        stock:       15,
        vendorId:    vendor1._id,
        tags:        ['bag', 'clutch', 'embroidery', 'handmade'],
      },
      {
        name:        'USB-C Fast Charger 65W',
        description: 'GaN 65W USB-C charger compatible with laptops, tablets, and smartphones. Compact travel-friendly design.',
        price:       2200,
        images:      ['https://via.placeholder.com/400x400?text=Charger'],
        category:    'Electronics',
        stock:       50,
        vendorId:    vendor2._id,
        tags:        ['charger', 'usb-c', 'electronics', 'laptop'],
      },
      {
        name:        'Wireless Earbuds Pro',
        description: 'True wireless earbuds with active noise cancellation, 30hr battery life, and IPX5 water resistance.',
        price:       5500,
        images:      ['https://via.placeholder.com/400x400?text=Earbuds'],
        category:    'Electronics',
        stock:       3,   // low stock — will trigger alert
        vendorId:    vendor2._id,
        tags:        ['earbuds', 'wireless', 'anc', 'audio'],
      },
    ];

    await Product.create(products);

    console.log('✅  Data seeded successfully!');
    console.log('─────────────────────────────────────');
    console.log('Admin    → admin@finalproject.com    / Admin@1234');
    console.log('Vendor 1 → vendor1@finalproject.com / Vendor@1234');
    console.log('Vendor 2 → vendor2@finalproject.com / Vendor@1234');
    console.log('Customer → customer@finalproject.com / Customer@1234');
    process.exit(0);
  } catch (error) {
    console.error('❌  Seeding failed:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('🗑️   All data destroyed');
    process.exit(0);
  } catch (error) {
    console.error('❌  Destroy failed:', error);
    process.exit(1);
  }
};

if (process.argv[2] === 'destroy') {
  destroyData();
} else {
  seedData();
}
