import prisma from '../config/database.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              inventory: { select: { quantity: true } },
            },
          },
        },
      },
    },
  })
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
                inventory: { select: { quantity: true } },
              },
            },
          },
        },
      },
    })
  }
  return cart
}

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id)
  return successResponse(res, 'Cart fetched successfully', cart)
})

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body
  if (!productId) return errorResponse(res, 'Product ID is required', 400)

  const product = await prisma.product.findUnique({
    where: { id: productId, isActive: true },
    include: { inventory: true },
  })
  if (!product) return errorResponse(res, 'Product not found', 404)
  if (!product.inventory || product.inventory.quantity < quantity) {
    return errorResponse(res, 'Insufficient stock', 400)
  }

  let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } })
  if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id } })

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  })

  let cartItem
  if (existingItem) {
    const newQty = existingItem.quantity + quantity
    if (product.inventory.quantity < newQty) {
      return errorResponse(res, 'Cannot add more than available stock', 400)
    }
    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
    })
  } else {
    cartItem = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    })
  }

  const updatedCart = await getOrCreateCart(req.user.id)
  return successResponse(res, 'Item added to cart', updatedCart, 201)
})

export const updateCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { quantity } = req.body

  if (!quantity || quantity < 1) return errorResponse(res, 'Invalid quantity', 400)

  const item = await prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true, product: { include: { inventory: true } } },
  })
  if (!item || item.cart.userId !== req.user.id) return errorResponse(res, 'Cart item not found', 404)

  if (item.product.inventory.quantity < quantity) {
    return errorResponse(res, 'Insufficient stock', 400)
  }

  await prisma.cartItem.update({ where: { id }, data: { quantity } })
  const cart = await getOrCreateCart(req.user.id)
  return successResponse(res, 'Cart updated', cart)
})

export const removeCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params
  const item = await prisma.cartItem.findUnique({ where: { id }, include: { cart: true } })
  if (!item || item.cart.userId !== req.user.id) return errorResponse(res, 'Cart item not found', 404)

  await prisma.cartItem.delete({ where: { id } })
  const cart = await getOrCreateCart(req.user.id)
  return successResponse(res, 'Item removed from cart', cart)
})

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } })
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  }
  return successResponse(res, 'Cart cleared')
})
