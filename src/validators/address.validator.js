import { z } from 'zod'
import { boolish } from './common.js'

// Field rules without defaults (Zod 4 applies defaults even inside .partial())
const addressFields = {
  fullName: z.string().min(2),
  phone: z.string().min(10).max(15),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4).max(10),
  country: z.string(),
  isDefault: boolish(),
}

export const addressSchema = z.object({
  ...addressFields,
  country: addressFields.country.optional().default('India'),
  isDefault: addressFields.isDefault.optional().default(false),
})

export const updateAddressSchema = z.object(addressFields).partial()
