import { z } from 'zod'

// Field rules without defaults (Zod 4 applies defaults even inside .partial())
const couponFields = {
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.coerce.number().positive(),
  minOrderValue: z.coerce.number().min(0),
  maxDiscount: z.coerce.number().positive().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
}

export const createCouponSchema = z.object({
  ...couponFields,
  minOrderValue: couponFields.minOrderValue.optional().default(0),
})

export const updateCouponSchema = z.object(couponFields).partial()

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  orderTotal: z.coerce.number().positive(),
})
