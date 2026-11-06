import prisma from '../config/database.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getBanners = asyncHandler(async (req, res) => {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  return successResponse(res, 'Banners fetched', banners)
})

export const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await prisma.banner.findMany({ orderBy: { order: 'asc' } })
  return successResponse(res, 'All banners fetched', banners)
})

export const createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, link, buttonText, order } = req.body
  const image = req.file ? `/uploads/banners/${req.file.filename}` : req.body.image
  if (!image) return errorResponse(res, 'Banner image is required', 400)

  const banner = await prisma.banner.create({
    data: {
      title,
      subtitle,
      image,
      link,
      buttonText,
      order: order ? parseInt(order, 10) : 0,
    },
  })
  return successResponse(res, 'Banner created', banner, 201)
})

export const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { title, subtitle, link, buttonText, order, isActive } = req.body

  const updateData = { title, subtitle, link, buttonText }
  if (order !== undefined) updateData.order = parseInt(order, 10)
  if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true
  if (req.file) updateData.image = `/uploads/banners/${req.file.filename}`
  else if (req.body.image) updateData.image = req.body.image

  const banner = await prisma.banner.update({ where: { id }, data: updateData })
  return successResponse(res, 'Banner updated', banner)
})

export const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params
  await prisma.banner.delete({ where: { id } })
  return successResponse(res, 'Banner deleted')
})

