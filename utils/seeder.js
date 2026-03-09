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
      category:    'Jewellery & Handmade',
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
      category:    'Electronics & Gadgets',
    },
  },
  {
    name:     'Fatima Noor',
    email:    'vendor3@finalproject.com',
    password: 'Vendor@1234',
    role:     'Vendor',
    storeInfo: {
      name:        'StyleHub Fashion',
      description: 'Trendy clothing and fashion accessories for men and women.',
      category:    'Clothing & Fashion',
    },
  },
  {
    name:     'Hassan Ali',
    email:    'vendor4@finalproject.com',
    password: 'Vendor@1234',
    role:     'Vendor',
    storeInfo: {
      name:        'Natural Glow Beauty',
      description: 'Organic skincare and beauty products for healthy skin.',
      category:    'Health & Beauty',
    },
  },
  {
    name:     'Zara Malik',
    email:    'vendor5@finalproject.com',
    password: 'Vendor@1234',
    role:     'Vendor',
    storeInfo: {
      name:        'Artisan Home Decor',
      description: 'Unique handmade crafts and home decoration items.',
      category:    'Jewellery & Handmade',
    },
  },
  {
    name:     'Abdullah',
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
    const vendor3        = createdUsers.find((u) => u.email === 'vendor3@finalproject.com');
    const vendor4        = createdUsers.find((u) => u.email === 'vendor4@finalproject.com');
    const vendor5        = createdUsers.find((u) => u.email === 'vendor5@finalproject.com');

    const products = [
      // Electronics (Vendor 2)
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
        stock:       25,
        vendorId:    vendor2._id,
        tags:        ['earbuds', 'wireless', 'anc', 'audio'],
      },
      {
        name:        'Smart Watch Fitness Tracker',
        description: 'Water-resistant fitness tracker with heart rate monitor, sleep tracking, and 7-day battery life.',
        price:       3800,
        images:      ['https://via.placeholder.com/400x400?text=SmartWatch'],
        category:    'Electronics',
        stock:       40,
        vendorId:    vendor2._id,
        tags:        ['smartwatch', 'fitness', 'wearable', 'health'],
      },
      {
        name:        'Portable Power Bank 20000mAh',
        description: 'High-capacity power bank with dual USB ports and fast charging. Perfect for travel.',
        price:       2800,
        images:      ['https://via.placeholder.com/400x400?text=PowerBank'],
        category:    'Electronics',
        stock:       60,
        vendorId:    vendor2._id,
        tags:        ['powerbank', 'charger', 'portable', 'travel'],
      },
      {
        name:        'Bluetooth Speaker Waterproof',
        description: 'Portable bluetooth speaker with 360° sound, waterproof IPX7 rating, and 12-hour playtime.',
        price:       4200,
        images:      ['https://via.placeholder.com/400x400?text=Speaker'],
        category:    'Electronics',
        stock:       35,
        vendorId:    vendor2._id,
        tags:        ['speaker', 'bluetooth', 'waterproof', 'audio'],
      },
      {
        name:        'Wireless Mouse Ergonomic',
        description: 'Comfortable ergonomic wireless mouse with adjustable DPI and long battery life.',
        price:       1500,
        images:      ['https://via.placeholder.com/400x400?text=Mouse'],
        category:    'Electronics',
        stock:       45,
        vendorId:    vendor2._id,
        tags:        ['mouse', 'wireless', 'computer', 'accessories'],
      },

      // Jewellery & Accessories (Vendor 1)
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
        name:        'Gold Plated Pearl Necklace',
        description: 'Beautiful gold-plated necklace with freshwater pearls. Perfect for weddings and special occasions.',
        price:       3200,
        images:      ['https://via.placeholder.com/400x400?text=Necklace'],
        category:    'Jewellery & Accessories',
        stock:       20,
        vendorId:    vendor1._id,
        tags:        ['necklace', 'pearl', 'gold', 'bridal'],
      },
      {
        name:        'Kundan Bangles Set of 4',
        description: 'Traditional kundan bangles with intricate detailing. Set of 4 bangles in gold finish.',
        price:       2400,
        images:      ['https://via.placeholder.com/400x400?text=Bangles'],
        category:    'Jewellery & Accessories',
        stock:       18,
        vendorId:    vendor1._id,
        tags:        ['bangles', 'kundan', 'traditional', 'bridal'],
      },
      {
        name:        'Oxidized Silver Ring Set',
        description: 'Boho-style oxidized silver rings with unique patterns. Set of 3 adjustable rings.',
        price:       950,
        images:      ['https://via.placeholder.com/400x400?text=Rings'],
        category:    'Jewellery & Accessories',
        stock:       50,
        vendorId:    vendor1._id,
        tags:        ['rings', 'silver', 'bohemian', 'fashion'],
      },
      {
        name:        'Crystal Pendant Necklace',
        description: 'Elegant crystal pendant on sterling silver chain. Perfect everyday accessory.',
        price:       1650,
        images:      ['https://via.placeholder.com/400x400?text=Pendant'],
        category:    'Jewellery & Accessories',
        stock:       35,
        vendorId:    vendor1._id,
        tags:        ['pendant', 'crystal', 'necklace', 'daily-wear'],
      },
      {
        name:        'Leather Bracelet Brown',
        description: 'Handcrafted leather bracelet with metal clasp. Unisex casual accessory.',
        price:       850,
        images:      ['https://via.placeholder.com/400x400?text=Bracelet'],
        category:    'Jewellery & Accessories',
        stock:       60,
        vendorId:    vendor1._id,
        tags:        ['bracelet', 'leather', 'unisex', 'casual'],
      },

      // Handmade & Crafts (Vendor 1)
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
        name:        'Wooden Wall Art Calligraphy',
        description: 'Hand-carved wooden wall art with Arabic calligraphy. Premium finish for home decor.',
        price:       4500,
        images:      ['https://via.placeholder.com/400x400?text=WallArt'],
        category:    'Handmade & Crafts',
        stock:       10,
        vendorId:    vendor5._id,
        tags:        ['wall-art', 'wood', 'calligraphy', 'home-decor'],
      },
      {
        name:        'Handwoven Cotton Table Runner',
        description: 'Beautiful handwoven table runner in traditional patterns. 100% organic cotton.',
        price:       1800,
        images:      ['https://via.placeholder.com/400x400?text=TableRunner'],
        category:    'Handmade & Crafts',
        stock:       25,
        vendorId:    vendor5._id,
        tags:        ['table-runner', 'handwoven', 'cotton', 'home'],
      },
      {
        name:        'Ceramic Tea Set Hand Painted',
        description: 'Artisan ceramic tea set with hand-painted floral designs. Set includes teapot and 4 cups.',
        price:       3800,
        images:      ['https://via.placeholder.com/400x400?text=TeaSet'],
        category:    'Handmade & Crafts',
        stock:       12,
        vendorId:    vendor5._id,
        tags:        ['ceramic', 'tea-set', 'handpainted', 'kitchen'],
      },
      {
        name:        'Macrame Plant Hanger',
        description: 'Handmade macrame plant hanger in natural cotton. Bohemian style home decor.',
        price:       1200,
        images:      ['https://via.placeholder.com/400x400?text=Macrame'],
        category:    'Handmade & Crafts',
        stock:       30,
        vendorId:    vendor5._id,
        tags:        ['macrame', 'plant-hanger', 'boho', 'decor'],
      },
      {
        name:        'Handcrafted Leather Journal',
        description: 'Premium leather-bound journal with handmade paper. Perfect for writing and sketching.',
        price:       2200,
        images:      ['https://via.placeholder.com/400x400?text=Journal'],
        category:    'Handmade & Crafts',
        stock:       20,
        vendorId:    vendor1._id,
        tags:        ['journal', 'leather', 'notebook', 'stationery'],
      },

      // Clothing & Fashion (Vendor 2)
      {
        name:        'Cotton Lawn Suit 3-Piece',
        description: 'Elegant printed lawn suit with dupatta. Perfect for summer season.',
        price:       3500,
        images:      ['https://via.placeholder.com/400x400?text=LawnSuit'],
        category:    'Clothing & Fashion',
        stock:       28,
        vendorId:    vendor3._id,
        tags:        ['lawn', 'suit', 'women', 'summer'],
      },
      {
        name:        'Embroidered Pashmina Shawl',
        description: 'Luxurious pashmina shawl with delicate embroidery. Soft and warm.',
        price:       5200,
        images:      ['https://via.placeholder.com/400x400?text=Shawl'],
        category:    'Clothing & Fashion',
        stock:       15,
        vendorId:    vendor3._id,
        tags:        ['shawl', 'pashmina', 'winter', 'luxury'],
      },
      {
        name:        'Men\'s Kameez Shalwar White',
        description: 'Classic white kameez shalwar in premium cotton. Perfect for formal occasions.',
        price:       2800,
        images:      ['https://via.placeholder.com/400x400?text=KameezShalwar'],
        category:    'Clothing & Fashion',
        stock:       35,
        vendorId:    vendor3._id,
        tags:        ['men', 'kameez', 'shalwar', 'formal'],
      },
      {
        name:        'Women\'s Silk Kurti',
        description: 'Elegant silk kurti with modern cut and traditional embroidery.',
        price:       3200,
        images:      ['https://via.placeholder.com/400x400?text=Kurti'],
        category:    'Clothing & Fashion',
        stock:       22,
        vendorId:    vendor3._id,
        tags:        ['kurti', 'silk', 'women', 'ethnic'],
      },
      {
        name:        'Cotton T-Shirt Pack of 3',
        description: 'Premium quality cotton t-shirts in basic colors. Pack of 3.',
        price:       1500,
        images:      ['https://via.placeholder.com/400x400?text=TShirts'],
        category:    'Clothing & Fashion',
        stock:       50,
        vendorId:    vendor3._id,
        tags:        ['tshirt', 'cotton', 'casual', 'basics'],
      },
      {
        name:        'Denim Jacket Blue',
        description: 'Classic blue denim jacket with modern fit. Unisex style.',
        price:       4800,
        images:      ['https://via.placeholder.com/400x400?text=DenimJacket'],
        category:    'Clothing & Fashion',
        stock:       18,
        vendorId:    vendor3._id,
        tags:        ['jacket', 'denim', 'casual', 'unisex'],
      },

      // Health & Beauty (Vendor 1)
      {
        name:        'Organic Rose Water 200ml',
        description: 'Pure organic rose water for skin toning and refreshment. Natural and alcohol-free.',
        price:       650,
        images:      ['https://via.placeholder.com/400x400?text=RoseWater'],
        category:    'Health & Beauty',
        stock:       80,
        vendorId:    vendor4._id,
        tags:        ['skincare', 'organic', 'rose-water', 'natural'],
      },
      {
        name:        'Himalayan Pink Salt Scrub',
        description: 'Exfoliating body scrub with Himalayan pink salt and essential oils.',
        price:       1200,
        images:      ['https://via.placeholder.com/400x400?text=Scrub'],
        category:    'Health & Beauty',
        stock:       40,
        vendorId:    vendor4._id,
        tags:        ['scrub', 'exfoliation', 'himalayan-salt', 'spa'],
      },
      {
        name:        'Herbal Hair Oil 100ml',
        description: 'Traditional herbal hair oil with amla, bhringraj, and coconut oil for healthy hair growth.',
        price:       850,
        images:      ['https://via.placeholder.com/400x400?text=HairOil'],
        category:    'Health & Beauty',
        stock:       60,
        vendorId:    vendor4._id,
        tags:        ['hair-oil', 'herbal', 'natural', 'hair-care'],
      },
      {
        name:        'Turmeric Face Mask',
        description: 'Brightening face mask with turmeric and honey. Suitable for all skin types.',
        price:       950,
        images:      ['https://via.placeholder.com/400x400?text=FaceMask'],
        category:    'Health & Beauty',
        stock:       55,
        vendorId:    vendor4._id,
        tags:        ['face-mask', 'turmeric', 'brightening', 'skincare'],
      },
      {
        name:        'Natural Lip Balm Set of 3',
        description: 'Moisturizing lip balms in rose, mint, and honey flavors. Made with beeswax and shea butter.',
        price:       750,
        images:      ['https://via.placeholder.com/400x400?text=LipBalm'],
        category:    'Health & Beauty',
        stock:       70,
        vendorId:    vendor4._id,
        tags:        ['lip-balm', 'natural', 'moisturizing', 'skincare'],
      },
      {
        name:        'Aloe Vera Gel Pure 150ml',
        description: '99% pure aloe vera gel for skin hydration and healing. Multi-purpose skin care.',
        price:       580,
        images:      ['https://via.placeholder.com/400x400?text=AloeGel'],
        category:    'Health & Beauty',
        stock:       90,
        vendorId:    vendor4._id,
        tags:        ['aloe-vera', 'gel', 'natural', 'hydrating'],
      },
      {
        name:        'Linen Co-Ord Set',
        description: 'Breathable linen co-ord set with relaxed fit for everyday summer wear.',
        price:       4100,
        images:      ['https://via.placeholder.com/400x400?text=CoordSet'],
        category:    'Clothing & Fashion',
        stock:       24,
        vendorId:    vendor3._id,
        tags:        ['linen', 'coord-set', 'women', 'summer'],
      },
      {
        name:        'Vitamin C Face Serum 30ml',
        description: 'Brightening vitamin C serum with hyaluronic acid for daily skincare routine.',
        price:       1450,
        images:      ['https://via.placeholder.com/400x400?text=Serum'],
        category:    'Health & Beauty',
        stock:       48,
        vendorId:    vendor4._id,
        tags:        ['serum', 'vitamin-c', 'skincare', 'brightening'],
      },
      {
        name:        'Hand-Painted Terracotta Vase',
        description: 'Decorative terracotta vase with traditional hand-painted motifs for living spaces.',
        price:       1950,
        images:      ['https://via.placeholder.com/400x400?text=Vase'],
        category:    'Handmade & Crafts',
        stock:       16,
        vendorId:    vendor5._id,
        tags:        ['terracotta', 'vase', 'hand-painted', 'home-decor'],
      },
    ];

    await Product.create(products);

    console.log('✅  Data seeded successfully!');
    console.log('─────────────────────────────────────');
    console.log('Admin    → admin@finalproject.com    / Admin@1234');
    console.log('Vendor 1 → vendor1@finalproject.com / Vendor@1234');
    console.log('Vendor 2 → vendor2@finalproject.com / Vendor@1234');
      console.log('Vendor 3 → vendor3@finalproject.com / Vendor@1234');
      console.log('Vendor 4 → vendor4@finalproject.com / Vendor@1234');
      console.log('Vendor 5 → vendor5@finalproject.com / Vendor@1234');
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
