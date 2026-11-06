import prisma from '../config/database.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const getOrCreateWishlist = async (userId) => {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              inventory: { select: { quantity: true } },
              category: { select: { name: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: { items: true },
    })
  }
  return wishlist
}

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user.id)
  return successResponse(res, 'Wishlist fetched successfully', wishlist)
})

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body
  if (!productId) return errorResponse(res, 'Product ID is required', 400)

  const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } })
  if (!product) return errorResponse(res, 'Product not found', 404)

  let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.id } })
  if (!wishlist) wishlist = await prisma.wishlist.create({ data: { userId: req.user.id } })

  const existing = await prisma.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  })
  if (existing) return errorResponse(res, 'Product already in wishlist', 409)

  await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } })
  const updated = await getOrCreateWishlist(req.user.id)
  return successResponse(res, 'Added to wishlist', updated, 201)
})

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { id } = req.params
  const wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.id } })
  if (!wishlist) return errorResponse(res, 'Wishlist not found', 404)

  const item = await prisma.wishlistItem.findFirst({
    where: { OR: [{ id }, { productId: id, wishlistId: wishlist.id }] },
  })
  if (!item || item.wishlistId !== wishlist.id) return errorResponse(res, 'Item not in your wishlist', 404)

  await prisma.wishlistItem.delete({ where: { id: item.id } })
  const updated = await getOrCreateWishlist(req.user.id)
  return successResponse(res, 'Removed from wishlist', updated)
})
