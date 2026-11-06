import prisma from '../config/database.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { slugify } from '../utils/helpers.js'
import { categorySchema, updateCategorySchema } from '../validators/category.validator.js'

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })
  return successResponse(res, 'Categories fetched successfully', categories)
})

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })
  return successResponse(res, 'All categories fetched', categories)
})

export const createCategory = asyncHandler(async (req, res) => {
  const data = categorySchema.parse(req.body)
  const slug = slugify(data.name)

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) return errorResponse(res, 'Category with this name already exists', 409)

  let image = null
  if (req.file) image = `/uploads/categories/${req.file.filename}`

  const category = await prisma.category.create({
    data: { ...data, slug, image },
  })
  return successResponse(res, 'Category created successfully', category, 201)
})

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = updateCategorySchema.parse(req.body)

  let updateData = { ...data }
  if (data.name) updateData.slug = slugify(data.name)
  if (req.file) updateData.image = `/uploads/categories/${req.file.filename}`

  const category = await prisma.category.update({ where: { id }, data: updateData })
  return successResponse(res, 'Category updated successfully', category)
})

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const productCount = await prisma.product.count({ where: { categoryId: id } })
  if (productCount > 0) {
    return errorResponse(res, 'Cannot delete category with existing products', 400)
  }
  await prisma.category.delete({ where: { id } })
  return successResponse(res, 'Category deleted successfully')
})
