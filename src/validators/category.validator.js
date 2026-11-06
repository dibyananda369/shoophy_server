import { z } from 'zod'
import { boolish } from './common.js'

// Field rules without defaults (Zod 4 applies defaults even inside .partial())
const categoryFields = {
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  isActive: boolish(),
}

export const categorySchema = z.object({
  ...categoryFields,
  isActive: categoryFields.isActive.optional().default(true),
})

export const updateCategorySchema = z.object(categoryFields).partial()
