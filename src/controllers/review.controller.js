import prisma from '../config/database.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { createReviewSchema } from '../validators/review.validator.js'
import { getPaginationParams, buildPaginationMeta } from '../utils/helpers.js'

export const getProductReviews = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { page, limit, skip } = getPaginationParams(req.query)

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where: { productId: id, isApproved: true } }),
    prisma.review.findMany({
      where: { productId: id, isApproved: true },
      skip,
      take: limit,
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return res.json({
    success: true,
    message: 'Reviews fetched',
    data: reviews,
    meta: buildPaginationMeta(total, page, limit),
  })
})

export const createReview = asyncHandler(async (req, res) => {
  const { id: productId } = req.params
  const data = createReviewSchema.parse(req.body)

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return errorResponse(res, 'Product not found', 404)

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } },
  })
  if (existing) return errorResponse(res, 'You have already reviewed this product', 409)

  const review = await prisma.$transaction(async (tx) => {
    const r = await tx.review.create({
      data: { userId: req.user.id, productId, ...data },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })

    // Recalculate product rating
    const stats = await tx.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await tx.product.update({
      where: { id: productId },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count.rating,
      },
    })

    return r
  })

  return successResponse(res, 'Review submitted successfully', review, 201)
})

export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return successResponse(res, 'All reviews fetched', reviews)
})

export const moderateReview = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { isApproved } = req.body
  if (typeof isApproved !== 'boolean') return errorResponse(res, 'isApproved must be true or false', 400)

  const review = await prisma.$transaction(async (tx) => {
    const r = await tx.review.update({
      where: { id },
      data: { isApproved },
    })

    // Recalculate on both approve and hide so the product rating never goes stale
    const stats = await tx.review.aggregate({
      where: { productId: r.productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    })
    await tx.product.update({
      where: { id: r.productId },
      data: { rating: stats._avg.rating || 0, reviewCount: stats._count.rating },
    })

    return r
  })

  return successResponse(res, 'Review moderated', review)
})

