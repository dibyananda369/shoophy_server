import prisma from '../config/database.js'
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { slugify, getPaginationParams, buildPaginationMeta } from '../utils/helpers.js'
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validators/product.validator.js'

export const getProducts = asyncHandler(async (req, res) => {
  const query = productQuerySchema.parse(req.query)
  const { page, limit, skip } = getPaginationParams(query)

  const where = { isActive: true }
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { brand: { contains: query.search } },
      { description: { contains: query.search } },
    ]
  }
  if (query.category) {
    const cat = await prisma.category.findFirst({ where: { slug: query.category } })
    if (cat) where.categoryId = cat.id
  }
  if (query.brand) where.brand = { contains: query.brand }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {}
    if (query.minPrice !== undefined) where.price.gte = query.minPrice
    if (query.maxPrice !== undefined) where.price.lte = query.maxPrice
  }
  if (query.minRating !== undefined) where.rating = { gte: query.minRating }
  if (query.featured !== undefined) where.isFeatured = query.featured
  if (query.trending !== undefined) where.isTrending = query.trending

  const orderBy = {
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    newest: { createdAt: 'desc' },
    rating: { rating: 'desc' },
    popular: { reviewCount: 'desc' },
  }[query.sortBy] || { createdAt: 'desc' }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        inventory: { select: { quantity: true } },
      },
    }),
  ])

  return paginatedResponse(res, 'Products fetched successfully', products, buildPaginationMeta(total, page, limit))
})

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }], isActive: true },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } },
      inventory: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
  if (!product) return errorResponse(res, 'Product not found', 404)
  return successResponse(res, 'Product fetched successfully', product)
})

export const createProduct = asyncHandler(async (req, res) => {
  const data = createProductSchema.parse(req.body)
  const slug = slugify(data.name)

  const existing = await prisma.product.findUnique({ where: { slug } })
  if (existing) return errorResponse(res, 'Product with this name already exists', 409)

  const skuExists = await prisma.product.findUnique({ where: { sku: data.sku } })
  if (skuExists) return errorResponse(res, 'SKU already exists', 409)

  const { stock, lowStockAt, ...productData } = data

  const product = await prisma.$transaction(async (tx) => {
    const p = await tx.product.create({ data: { ...productData, slug } })
    await tx.inventory.create({
      data: { productId: p.id, quantity: stock || 0, lowStockAt: lowStockAt || 10 },
    })
    if (req.files?.length > 0) {
      await tx.productImage.createMany({
        data: req.files.map((f, i) => ({
          productId: p.id,
          url: `/uploads/products/${f.filename}`,
          isPrimary: i === 0,
          order: i,
        })),
      })
    }
    return tx.product.findUnique({
      where: { id: p.id },
      include: { images: true, inventory: true, category: true },
    })
  })

  return successResponse(res, 'Product created successfully', product, 201)
})

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = updateProductSchema.parse(req.body)

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) return errorResponse(res, 'Product not found', 404)

  const { stock, lowStockAt, ...productData } = data
  if (productData.name) productData.slug = slugify(productData.name)

  const product = await prisma.$transaction(async (tx) => {
    if (stock !== undefined) {
      await tx.inventory.upsert({
        where: { productId: id },
        update: { quantity: stock, ...(lowStockAt !== undefined ? { lowStockAt } : {}) },
        create: { productId: id, quantity: stock, lowStockAt: lowStockAt || 10 },
      })
    }
    if (req.files?.length > 0) {
      await tx.productImage.createMany({
        data: req.files.map((f, i) => ({
          productId: id,
          url: `/uploads/products/${f.filename}`,
          isPrimary: false,
          order: i + 100,
        })),
      })
    }
    return tx.product.update({
      where: { id },
      data: productData,
      include: { images: true, inventory: true, category: true },
    })
  })

  return successResponse(res, 'Product updated successfully', product)
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params
  await prisma.product.update({ where: { id }, data: { isActive: false } })
  return successResponse(res, 'Product deleted successfully')
})

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 8,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      inventory: { select: { quantity: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return successResponse(res, 'Featured products fetched', products)
})

export const getTrendingProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true, isTrending: true },
    take: 8,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      inventory: { select: { quantity: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { rating: 'desc' },
  })
  return successResponse(res, 'Trending products fetched', products)
})

export const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 8,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      inventory: { select: { quantity: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return successResponse(res, 'New arrivals fetched', products)
})

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params
  const product = await prisma.product.findUnique({ where: { id }, select: { categoryId: true } })
  if (!product) return errorResponse(res, 'Product not found', 404)

  const related = await prisma.product.findMany({
    where: { isActive: true, categoryId: product.categoryId, id: { not: id } },
    take: 6,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      inventory: { select: { quantity: true } },
    },
    orderBy: { rating: 'desc' },
  })
  return successResponse(res, 'Related products fetched', related)
})
