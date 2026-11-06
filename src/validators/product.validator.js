import { z } from 'zod'
import { boolish } from './common.js'

// Field rules without defaults. Zod 4 applies .default() even inside .partial(),
// so update schemas must be built from these, not from the create schema.
const productFields = {
  name: z.string().min(2).max(200),
  categoryId: z.string().uuid('Invalid category ID'),
  description: z.string().min(10),
  price: z.coerce.number().positive('Price must be positive'),
  discount: z.coerce.number().min(0).max(100),
  brand: z.string().optional(),
  sku: z.string().min(1),
  isFeatured: boolish(),
  isTrending: boolish(),
  stock: z.coerce.number().int().min(0),
  lowStockAt: z.coerce.number().int().min(0),
}

export const createProductSchema = z.object({
  ...productFields,
  discount: productFields.discount.optional().default(0),
  isFeatured: productFields.isFeatured.optional().default(false),
  isTrending: productFields.isTrending.optional().default(false),
  stock: productFields.stock.optional().default(0),
  lowStockAt: productFields.lowStockAt.optional().default(10),
})

// Only the fields actually sent are returned, so a partial edit never resets the rest
export const updateProductSchema = z.object(productFields).partial()

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  brand: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'popular']).optional().default('newest'),
  featured: boolish().optional(),
  trending: boolish().optional(),
})
