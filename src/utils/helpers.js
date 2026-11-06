/**
 * Generate URL-friendly slug from a string
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Calculate discounted price
 */
export const calculateDiscountedPrice = (price, discountPercent) => {
  const discounted = parseFloat(price) * (1 - parseFloat(discountPercent) / 100)
  return Math.round(discounted * 100) / 100
}

/**
 * Parse pagination params
 */
export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '12', 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

/**
 * Build pagination meta
 */
export const buildPaginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  }
}

