import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean database
  console.log('Cleaning existing records...')
  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.shipment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.banner.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Users
  console.log('Seeding users...')
  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const customerPassword = await bcrypt.hash('Customer@123', 12)

  const admin = await prisma.user.create({
    data: {
      name: 'Shoophy Admin',
      email: 'admin@shoophy.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+91 9876543210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  })

  const customer1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '+91 9876543211',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    },
  })

  const customer2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '+91 9876543212',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  })

  const customer3 = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '+91 9876543213',
    },
  })

  // 2. Addresses
  console.log('Seeding addresses...')
  const addr1 = await prisma.address.create({
    data: {
      userId: customer1.id,
      fullName: 'John Doe',
      phone: '+91 9876543211',
      addressLine1: '402 Sunrise Heights, MG Road',
      addressLine2: 'Near Central Mall',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
      isDefault: true,
    },
  })

  await prisma.address.create({
    data: {
      userId: customer2.id,
      fullName: 'Jane Smith',
      phone: '+91 9876543212',
      addressLine1: '12B Silver Oak Apartments, Park Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      isDefault: true,
    },
  })

  // 3. Categories (8 categories)
  console.log('Seeding categories...')
  const categoriesData = [
    {
      name: 'Electronics & Gadgets',
      slug: 'electronics',
      description: 'Smartphones, laptops, smart audio and cutting-edge accessories.',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
    },
    {
      name: 'Men Fashion',
      slug: 'men-fashion',
      description: 'Premium apparel, shoes, watches and everyday essentials for men.',
      image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600',
    },
    {
      name: 'Women Fashion',
      slug: 'women-fashion',
      description: 'Chic dresses, ethnic wear, footwear and statement accessories.',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600',
    },
    {
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Modern cookware, aesthetic decor, organizers and appliances.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600',
    },
    {
      name: 'Beauty & Personal Care',
      slug: 'beauty-personal-care',
      description: 'Skincare, haircare, fragrances and grooming essentials.',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
    },
    {
      name: 'Sports & Fitness',
      slug: 'sports-fitness',
      description: 'Activewear, gym equipment, yoga gear and outdoor accessories.',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
    },
    {
      name: 'Books & Stationery',
      slug: 'books-stationery',
      description: 'Bestselling novels, journals, art supplies and office items.',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Sneakers, formal shoes, boots and casual slippers for all.',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    },
  ]

  const categories = {}
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({ data: cat })
  }

  // 4. Products (32 products across all 8 categories)
  console.log('Seeding products...')
  const rawProducts = [
    // Electronics
    {
      categorySlug: 'electronics',
      name: 'AeroPulse Wireless Noise-Cancelling Headphones',
      slug: 'aeropulse-wireless-headphones',
      description: 'Industry-leading hybrid active noise cancellation with 40-hour battery life, high-res audio certification, and ultra-plush memory foam earcups.',
      price: 14999,
      discount: 20,
      brand: 'AeroSound',
      sku: 'ELEC-AP-001',
      stock: 45,
      isFeatured: true,
      isTrending: true,
      rating: 4.8,
      reviewCount: 38,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
      ],
    },
    {
      categorySlug: 'electronics',
      name: 'UltraVision Pro 4K Curved Gaming Monitor 32"',
      slug: 'ultravision-pro-4k-curved-monitor',
      description: 'Immersive 1500R curvature with 165Hz refresh rate, 1ms response time, HDR600 support, and USB-C connectivity with 90W power delivery.',
      price: 38999,
      discount: 15,
      brand: 'VisionTech',
      sku: 'ELEC-UV-002',
      stock: 18,
      isFeatured: true,
      isTrending: false,
      rating: 4.7,
      reviewCount: 22,
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
      ],
    },
    {
      categorySlug: 'electronics',
      name: 'NovaFit Horizon Smartwatch with AMOLED Display',
      slug: 'novafit-horizon-smartwatch',
      description: 'Brilliant 1.43" AMOLED always-on display, optical heart rate & SpO2 tracking, GPS navigation, and up to 14 days of battery on a single charge.',
      price: 7499,
      discount: 25,
      brand: 'NovaFit',
      sku: 'ELEC-NF-003',
      stock: 60,
      isFeatured: false,
      isTrending: true,
      rating: 4.6,
      reviewCount: 54,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800',
      ],
    },
    {
      categorySlug: 'electronics',
      name: 'MagCharge 3-in-1 Foldable Wireless Charging Station',
      slug: 'magcharge-3-in-1-charging-station',
      description: 'Simultaneously fast-charge iPhone, Apple Watch, and AirPods with seamless magnetic snap alignment. Ultra-compact foldable travel design.',
      price: 3299,
      discount: 10,
      brand: 'Ankerix',
      sku: 'ELEC-MC-004',
      stock: 75,
      isFeatured: false,
      isTrending: true,
      rating: 4.5,
      reviewCount: 19,
      images: [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800',
      ],
    },

    // Men Fashion
    {
      categorySlug: 'men-fashion',
      name: 'Oxford Tailored Slim Fit Linen Shirt',
      slug: 'oxford-tailored-slim-fit-linen-shirt',
      description: 'Crafted from 100% breathable organic European flax linen. Tailored modern fit suitable for formal boardroom meetings and relaxed weekend brunches.',
      price: 2499,
      discount: 15,
      brand: 'UrbanGent',
      sku: 'MEN-SL-101',
      stock: 50,
      isFeatured: true,
      isTrending: true,
      rating: 4.7,
      reviewCount: 42,
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
      ],
    },
    {
      categorySlug: 'men-fashion',
      name: 'Classic Vintage Aviator Leather Bomber Jacket',
      slug: 'vintage-aviator-leather-bomber-jacket',
      description: 'Supple full-grain lambskin leather with cozy shearling collar, heavy-duty antique brass zippers, and dual interior security pockets.',
      price: 11999,
      discount: 30,
      brand: 'Heritage Co',
      sku: 'MEN-LJ-102',
      stock: 12,
      isFeatured: true,
      isTrending: false,
      rating: 4.9,
      reviewCount: 16,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      ],
    },
    {
      categorySlug: 'men-fashion',
      name: 'Comfort Flex Performance Stretch Chino Trousers',
      slug: 'comfort-flex-stretch-chino-trousers',
      description: '4-way stretch twill fabric with wrinkle-resistant finish and hidden elastic waistband. All-day ease for everyday commuters.',
      price: 1899,
      discount: 10,
      brand: 'UrbanGent',
      sku: 'MEN-CH-103',
      stock: 40,
      isFeatured: false,
      isTrending: true,
      rating: 4.4,
      reviewCount: 29,
      images: [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
      ],
    },
    {
      categorySlug: 'men-fashion',
      name: 'Chronograph Midnight Black Stainless Steel Watch',
      slug: 'chronograph-midnight-black-watch',
      description: 'Precision Japanese quartz movement with triple sub-dials, scratch-resistant sapphire crystal glass, and 50m water resistance.',
      price: 6499,
      discount: 20,
      brand: 'Vanguard',
      sku: 'MEN-WT-104',
      stock: 25,
      isFeatured: false,
      isTrending: false,
      rating: 4.8,
      reviewCount: 31,
      images: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800',
      ],
    },

    // Women Fashion
    {
      categorySlug: 'women-fashion',
      name: 'Aurelia Floral Print Georgette Maxi Dress',
      slug: 'aurelia-floral-print-maxi-dress',
      description: 'Flowing tiered silhouette with a flattering V-neckline and tie waist. Hand-block botanical motifs printed on featherlight georgette fabric.',
      price: 3499,
      discount: 25,
      brand: 'Aurelia Lane',
      sku: 'WOM-MD-201',
      stock: 35,
      isFeatured: true,
      isTrending: true,
      rating: 4.8,
      reviewCount: 45,
      images: [
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
      ],
    },
    {
      categorySlug: 'women-fashion',
      name: 'Structured Vegan Leather Tote Bag with Clutch',
      slug: 'structured-vegan-leather-tote-bag',
      description: 'Premium scratch-resistant vegan saffiano leather, fits 14" laptop with dedicated padded sleeve, includes removable matching pouch.',
      price: 2999,
      discount: 15,
      brand: 'Bellisima',
      sku: 'WOM-TB-202',
      stock: 45,
      isFeatured: false,
      isTrending: true,
      rating: 4.7,
      reviewCount: 33,
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
      ],
    },
    {
      categorySlug: 'women-fashion',
      name: 'Cashmere Blend Oversized Knitted Cardigan',
      slug: 'cashmere-blend-oversized-cardigan',
      description: 'Buttery-soft plush knit with ribbed cuffs and tortoiseshell horn buttons. Cozy layering staple for cool autumn and winter days.',
      price: 4299,
      discount: 10,
      brand: 'NordicWarm',
      sku: 'WOM-CD-203',
      stock: 20,
      isFeatured: true,
      isTrending: false,
      rating: 4.6,
      reviewCount: 18,
      images: [
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
      ],
    },
    {
      categorySlug: 'women-fashion',
      name: 'Minimalist 18K Gold Plated Layered Necklace',
      slug: 'minimalist-18k-gold-layered-necklace',
      description: 'Tarnish-free stainless steel coated in 18k thick yellow gold dipping. Hypoallergenic double chain with celestial pendant accent.',
      price: 1499,
      discount: 30,
      brand: 'Lumiere Jewels',
      sku: 'WOM-JW-204',
      stock: 60,
      isFeatured: false,
      isTrending: true,
      rating: 4.9,
      reviewCount: 60,
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
      ],
    },

    // Home & Kitchen
    {
      categorySlug: 'home-kitchen',
      name: 'Artisan Barista Precision Espresso Machine',
      slug: 'artisan-barista-espresso-machine',
      description: '15-bar Italian pump with PID temperature control and commercial-style steam wand for silky microfoam latte art in your own kitchen.',
      price: 21999,
      discount: 18,
      brand: 'CafféBella',
      sku: 'HK-EM-301',
      stock: 14,
      isFeatured: true,
      isTrending: true,
      rating: 4.9,
      reviewCount: 28,
      images: [
        'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800',
      ],
    },
    {
      categorySlug: 'home-kitchen',
      name: 'Non-Stick Ceramic Coated 10-Piece Cookware Set',
      slug: 'ceramic-coated-cookware-set-10pc',
      description: 'Toxin-free non-toxic mineral ceramic coating (PTFE, PFOA & lead free). Induction compatible with ergonomic stay-cool wood-finish handles.',
      price: 8999,
      discount: 25,
      brand: 'PureKitchen',
      sku: 'HK-CS-302',
      stock: 22,
      isFeatured: false,
      isTrending: false,
      rating: 4.7,
      reviewCount: 39,
      images: [
        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800',
      ],
    },
    {
      categorySlug: 'home-kitchen',
      name: 'Nordic Ceramic Minimalist Vase Set (Set of 3)',
      slug: 'nordic-ceramic-minimalist-vase-set',
      description: 'Handcrafted matte unglazed ceramic pottery vases in warm neutral tones. Ideal decorative centerpiece for dried flowers and pampas grass.',
      price: 1999,
      discount: 15,
      brand: 'Studio Terra',
      sku: 'HK-VS-303',
      stock: 40,
      isFeatured: false,
      isTrending: true,
      rating: 4.5,
      reviewCount: 22,
      images: [
        'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800',
      ],
    },
    {
      categorySlug: 'home-kitchen',
      name: 'Smart HEPA Air Purifier with PM2.5 Monitor',
      slug: 'smart-hepa-air-purifier-pm25',
      description: 'True HEPA H13 filtration removes 99.97% of airborne allergens, pollen, dust, and odors. Whispering quiet sleep mode at 24dB.',
      price: 10499,
      discount: 20,
      brand: 'AeroCleanse',
      sku: 'HK-AP-304',
      stock: 30,
      isFeatured: true,
      isTrending: false,
      rating: 4.8,
      reviewCount: 47,
      images: [
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
      ],
    },

    // Beauty & Personal Care
    {
      categorySlug: 'beauty-personal-care',
      name: 'HydraGlow Vitamin C & Hyaluronic Acid Serum 50ml',
      slug: 'hydraglow-vitamin-c-hyaluronic-serum',
      description: 'Potent 20% ethyl ascorbic acid stabilized with ferulic acid. Fades dark spots, evens skin tone, and deeply hydrates for an unmistakable radiant glow.',
      price: 1299,
      discount: 10,
      brand: 'GlowRx',
      sku: 'BPC-VS-401',
      stock: 85,
      isFeatured: true,
      isTrending: true,
      rating: 4.9,
      reviewCount: 76,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
      ],
    },
    {
      categorySlug: 'beauty-personal-care',
      name: 'Maison Velvet Oud Eau De Parfum 100ml',
      slug: 'maison-velvet-oud-eau-de-parfum',
      description: 'An intoxicating blend of smoky Cambodian agarwood, Damascus rose petals, warm amber, and golden vanilla. High-sillage 16-hour longevity.',
      price: 4999,
      discount: 20,
      brand: 'Maison Olfactive',
      sku: 'BPC-VO-402',
      stock: 28,
      isFeatured: true,
      isTrending: false,
      rating: 4.8,
      reviewCount: 34,
      images: [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800',
      ],
    },
    {
      categorySlug: 'beauty-personal-care',
      name: 'Professional Ionic Hair Dryer with Diffuser',
      slug: 'professional-ionic-hair-dryer',
      description: 'Brushless 110,000 RPM high-speed digital motor dries hair in 3 minutes without thermal heat damage. Generates 200 million negative ions.',
      price: 6999,
      discount: 30,
      brand: 'LuxeStyler',
      sku: 'BPC-HD-403',
      stock: 35,
      isFeatured: false,
      isTrending: true,
      rating: 4.7,
      reviewCount: 51,
      images: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
      ],
    },
    {
      categorySlug: 'beauty-personal-care',
      name: 'Organic Botanical Cold-Pressed Argan Hair Oil 100ml',
      slug: 'organic-cold-pressed-argan-oil',
      description: '100% certified pure Moroccan argan oil. Tames frizzy strands, seals split ends, and nourishes flaky scalp with essential fatty acids.',
      price: 899,
      discount: 15,
      brand: 'Botanica',
      sku: 'BPC-AO-404',
      stock: 90,
      isFeatured: false,
      isTrending: false,
      rating: 4.6,
      reviewCount: 40,
      images: [
        'https://images.unsplash.com/photo-1608248597359-2e652d80c355?w=800',
      ],
    },

    // Sports & Fitness
    {
      categorySlug: 'sports-fitness',
      name: 'CoreFlex Adjustable Dumbbell Set (5kg to 25kg)',
      slug: 'coreflex-adjustable-dumbbell-set',
      description: 'Quick-turn dial mechanism replaces 10 separate sets of dumbbells. Heavy-duty cast iron weight plates with anti-slip knurled grip bars.',
      price: 15999,
      discount: 15,
      brand: 'CoreFlex',
      sku: 'SF-DB-501',
      stock: 15,
      isFeatured: true,
      isTrending: true,
      rating: 4.9,
      reviewCount: 32,
      images: [
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
      ],
    },
    {
      categorySlug: 'sports-fitness',
      name: 'EcoGrip Pro Natural Cork Yoga Mat 6mm',
      slug: 'ecogrip-pro-cork-yoga-mat',
      description: 'Antimicrobial sustainably harvested cork surface gets grippier with sweat. Backed by high-density recyclable TPE cushion for joint support.',
      price: 2499,
      discount: 20,
      brand: 'PranaLife',
      sku: 'SF-YM-502',
      stock: 45,
      isFeatured: false,
      isTrending: true,
      rating: 4.8,
      reviewCount: 41,
      images: [
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800',
      ],
    },
    {
      categorySlug: 'sports-fitness',
      name: 'HydroShield Insulated Stainless Steel Gym Bottle 1L',
      slug: 'hydroshield-insulated-bottle-1l',
      description: 'Double-wall vacuum insulation keeps iced drinks frosty for 24 hours or steaming hot for 12 hours. Leakproof chug cap with silicone bumper.',
      price: 1199,
      discount: 10,
      brand: 'HydroShield',
      sku: 'SF-WB-503',
      stock: 100,
      isFeatured: false,
      isTrending: false,
      rating: 4.7,
      reviewCount: 58,
      images: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
      ],
    },
    {
      categorySlug: 'sports-fitness',
      name: 'HyperSpeed Resistance Bands Set (5 Resistance Levels)',
      slug: 'hyperspeed-resistance-bands-set',
      description: '100% natural Malaysian latex with heavy-duty carabiners, door anchor, padded ankle straps, and waterproof travel carry pouch.',
      price: 999,
      discount: 25,
      brand: 'CoreFlex',
      sku: 'SF-RB-504',
      stock: 70,
      isFeatured: false,
      isTrending: true,
      rating: 4.5,
      reviewCount: 27,
      images: [
        'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800',
      ],
    },

    // Books & Stationery
    {
      categorySlug: 'books-stationery',
      name: 'Atomic Habits by James Clear (Hardcover Collector Edition)',
      slug: 'atomic-habits-james-clear-hardcover',
      description: 'The legendary #1 New York Times bestseller on building good habits, breaking bad ones, and mastering tiny behaviors that lead to remarkable results.',
      price: 899,
      discount: 10,
      brand: 'Penguin Random House',
      sku: 'BK-AH-601',
      stock: 80,
      isFeatured: true,
      isTrending: true,
      rating: 5.0,
      reviewCount: 110,
      images: [
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
      ],
    },
    {
      categorySlug: 'books-stationery',
      name: 'Leatherbound Refillable Bullet Journal with 160gsm Paper',
      slug: 'leatherbound-bullet-journal-160gsm',
      description: 'Ultra-thick 160gsm bamboo paper guarantees zero ghosting and bleed-through for fountain pens, watercolors, and fine liners.',
      price: 1499,
      discount: 20,
      brand: 'ScribeArt',
      sku: 'BK-BJ-602',
      stock: 50,
      isFeatured: false,
      isTrending: true,
      rating: 4.8,
      reviewCount: 36,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
      ],
    },
    {
      categorySlug: 'books-stationery',
      name: 'Executive Brass Fountain Pen with Dual Nib Set',
      slug: 'executive-brass-fountain-pen',
      description: 'Solid machined brass construction with raw vintage patina that ages gracefully with each signature. Includes medium and fine iridium nibs.',
      price: 2499,
      discount: 15,
      brand: 'ScribeArt',
      sku: 'BK-FP-603',
      stock: 35,
      isFeatured: false,
      isTrending: false,
      rating: 4.7,
      reviewCount: 19,
      images: [
        'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800',
      ],
    },
    {
      categorySlug: 'books-stationery',
      name: 'Psychology of Money by Morgan Housel',
      slug: 'psychology-of-money-morgan-housel',
      description: 'Timeless lessons on wealth, greed, and happiness. Doing well with money isn’t necessarily about what you know. It’s about how you behave.',
      price: 499,
      discount: 10,
      brand: 'Harriman House',
      sku: 'BK-PM-604',
      stock: 90,
      isFeatured: true,
      isTrending: true,
      rating: 4.9,
      reviewCount: 88,
      images: [
        'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800',
      ],
    },

    // Footwear
    {
      categorySlug: 'footwear',
      name: 'ApexStride Carbon Cushion Running Sneakers',
      slug: 'apexstride-carbon-cushion-running-sneakers',
      description: 'Full-length carbon fiber propulsion plate sandwiched between nitrogen-infused superfoam. Ultra-lightweight engineered jacquard mesh upper.',
      price: 8999,
      discount: 20,
      brand: 'ApexStride',
      sku: 'FT-CR-701',
      stock: 40,
      isFeatured: true,
      isTrending: true,
      rating: 4.9,
      reviewCount: 52,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800',
      ],
    },
    {
      categorySlug: 'footwear',
      name: 'Oxford Goodyear Welted Full-Grain Leather Brogues',
      slug: 'oxford-goodyear-welted-leather-brogues',
      description: 'Handcrafted Italian calfskin leather with traditional wingtip perforations. Resoleable Goodyear-welted construction engineered to last decades.',
      price: 7499,
      discount: 15,
      brand: 'Heritage Co',
      sku: 'FT-OB-702',
      stock: 20,
      isFeatured: false,
      isTrending: false,
      rating: 4.8,
      reviewCount: 24,
      images: [
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800',
      ],
    },
    {
      categorySlug: 'footwear',
      name: 'Cloudfoam Everyday Minimalist Canvas Sneakers',
      slug: 'cloudfoam-everyday-canvas-sneakers',
      description: 'Zero-drop ergonomic footbed with memory foam cushioning and breathable organic cotton canvas. Machine washable and versatile for daily styling.',
      price: 2299,
      discount: 25,
      brand: 'ApexStride',
      sku: 'FT-CS-703',
      stock: 65,
      isFeatured: false,
      isTrending: true,
      rating: 4.6,
      reviewCount: 44,
      images: [
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
      ],
    },
    {
      categorySlug: 'footwear',
      name: 'Chelsea Ankle Boots in Oiled Nubuck Leather',
      slug: 'chelsea-ankle-boots-oiled-nubuck',
      description: 'Weather-resistant oiled nubuck leather with elastic side gussets and heavy-traction rubber lug soles. Effortless pull-on everyday styling.',
      price: 5999,
      discount: 18,
      brand: 'UrbanGent',
      sku: 'FT-CB-704',
      stock: 28,
      isFeatured: true,
      isTrending: false,
      rating: 4.7,
      reviewCount: 30,
      images: [
        'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800',
      ],
    },
  ]

  const seededProducts = []
  for (const p of rawProducts) {
    const { categorySlug, images, stock, ...productData } = p
    const category = categories[categorySlug]

    const product = await prisma.product.create({
      data: {
        ...productData,
        categoryId: category.id,
      },
    })

    // Inventory
    await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity: stock,
        lowStockAt: 10,
      },
    })

    // Product Images
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: images[i],
          isPrimary: i === 0,
          order: i,
        },
      })
    }

    seededProducts.push(product)
  }

  // 5. Coupons
  console.log('Seeding coupons...')
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: 'Get 10% OFF on your first purchase above ₹999',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 999,
        maxDiscount: 500,
        usageLimit: 1000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'FLAT200',
        description: 'Flat ₹200 OFF on orders above ₹1,999',
        discountType: 'FIXED',
        discountValue: 200,
        minOrderValue: 1999,
        usageLimit: 500,
        isActive: true,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'SUPERFESTIVE',
        description: 'Mega 25% OFF on premium collection above ₹4,999',
        discountType: 'PERCENTAGE',
        discountValue: 25,
        minOrderValue: 4999,
        maxDiscount: 2000,
        usageLimit: 200,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  // 6. Promotional Banners
  console.log('Seeding banners...')
  await prisma.banner.createMany({
    data: [
      {
        title: 'Elevate Your Digital Life',
        subtitle: 'Up to 40% OFF on high-fidelity audio & premium monitors',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600',
        link: '/products?category=electronics',
        buttonText: 'Shop Electronics',
        order: 1,
        isActive: true,
      },
      {
        title: 'Summer Elegance Collection',
        subtitle: 'Pure linen shirts & tailored luxury for everyday wear',
        image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600',
        link: '/products?category=men-fashion',
        buttonText: 'Explore Men Fashion',
        order: 2,
        isActive: true,
      },
      {
        title: 'Artisan Living & Kitchen',
        subtitle: 'Transform your home with handcrafted ceramic essentials',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600',
        link: '/products?category=home-kitchen',
        buttonText: 'Discover Decor',
        order: 3,
        isActive: true,
      },
    ],
  })

  // 7. Sample Reviews
  console.log('Seeding sample reviews...')
  const sampleReviews = [
    {
      productIndex: 0,
      user: customer1,
      rating: 5,
      title: 'Incredible sound clarity and noise cancelling!',
      body: 'I use these daily during my train commute and in coffee shops. The ANC is shockingly good and blocks out all background chatter completely.',
    },
    {
      productIndex: 0,
      user: customer2,
      rating: 5,
      title: 'Worth every single rupee',
      body: 'The battery lasts more than a week without needing a recharge. Super comfortable even after 6 hours straight.',
    },
    {
      productIndex: 4,
      user: customer1,
      rating: 5,
      title: 'Premium linen feel',
      body: 'The fabric quality is top-notch. It washes well and breathes like a dream in warm humid weather.',
    },
    {
      productIndex: 8,
      user: customer2,
      rating: 5,
      title: 'Stunning dress! Got so many compliments',
      body: 'The botanical print is even more vibrant in real life. Fits true to size and the flare is gorgeous.',
    },
    {
      productIndex: 12,
      user: customer3,
      rating: 5,
      title: 'Café quality espresso at home',
      body: 'Takes some practice with grind size, but once dialed in, the crema and sweetness rival any local specialty café.',
    },
    {
      productIndex: 16,
      user: customer2,
      rating: 5,
      title: 'Holy grail skincare item',
      body: 'Faded my acne dark spots in less than 3 weeks. Does not sting or oxidize quickly.',
    },
    {
      productIndex: 28,
      user: customer1,
      rating: 5,
      title: 'Running feels effortless',
      body: 'The carbon plate provides tangible energy return. Shaved 45 seconds off my 5k personal record on the first run.',
    },
  ]

  for (const rev of sampleReviews) {
    const product = seededProducts[rev.productIndex]
    await prisma.review.create({
      data: {
        userId: rev.user.id,
        productId: product.id,
        rating: rev.rating,
        title: rev.title,
        body: rev.body,
        isApproved: true,
      },
    })
  }

  // 8. Sample Order for Demonstration
  console.log('Seeding demo order...')
  const demoProduct = seededProducts[0]
  const demoOrder = await prisma.order.create({
    data: {
      userId: customer1.id,
      addressId: addr1.id,
      status: 'DELIVERED',
      subtotal: 11999.20,
      discountAmount: 0,
      shippingCharge: 0,
      totalAmount: 11999.20,
      notes: 'Please leave at front door if unavailable',
      items: {
        create: [
          {
            productId: demoProduct.id,
            productName: demoProduct.name,
            productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
            price: demoProduct.price,
            discount: demoProduct.discount,
            quantity: 1,
            subtotal: 11999.20,
          },
        ],
      },
    },
  })

  await prisma.payment.create({
    data: {
      orderId: demoOrder.id,
      method: 'MOCK',
      status: 'PAID',
      amount: 11999.20,
      transactionId: 'TXN_' + Date.now(),
      paidAt: new Date(),
    },
  })

  await prisma.shipment.create({
    data: {
      orderId: demoOrder.id,
      trackingNumber: 'SV-DEL-894721',
      carrier: 'BlueDart Express',
      shippedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('\nDemo Credentials:')
  console.log('👑 Admin:    admin@shoophy.com / Admin@123')
  console.log('👤 Customer: john@example.com    / Customer@123')
  console.log('👤 Customer: jane@example.com    / Customer@123')
  console.log('👤 Customer: alex@example.com    / Customer@123\n')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

