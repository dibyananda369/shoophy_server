import prisma from '../config/database.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from '../validators/coupon.validator.js'

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = validateCouponSchema.parse(req.body)

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (!coupon || !coupon.isActive) return errorResponse(res, 'Invalid or inactive coupon', 400)
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return errorResponse(res, 'Coupon has expired', 400)
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return errorResponse(res, 'Coupon usage limit reached', 400)
  if (orderTotal < parseFloat(coupon.minOrderValue)) {
    return errorResponse(res, `Minimum order value is ₹${coupon.minOrderValue}`, 400)
  }

  let discountAmount =
    coupon.discountType === 'PERCENTAGE'
      ? (orderTotal * parseFloat(coupon.discountValue)) / 100
      : parseFloat(coupon.discountValue)

  if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount))
  discountAmount = Math.min(discountAmount, orderTotal)

  return successResponse(res, 'Coupon applied successfully', {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: Math.round(discountAmount * 100) / 100,
    description: coupon.description,
  })
})

export const createCoupon = asyncHandler(async (req, res) => {
  const data = createCouponSchema.parse(req.body)
  const coupon = await prisma.coupon.create({ data })
  return successResponse(res, 'Coupon created successfully', coupon, 201)
})

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return successResponse(res, 'Coupons fetched', coupons)
})

export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = updateCouponSchema.parse(req.body)
  const coupon = await prisma.coupon.update({ where: { id }, data })
  return successResponse(res, 'Coupon updated', coupon)
})

export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params
  await prisma.coupon.delete({ where: { id } })
  return successResponse(res, 'Coupon deleted')
})

