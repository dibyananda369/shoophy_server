import prisma from '../config/database.js'
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator.js'
import { getPaginationParams, buildPaginationMeta } from '../utils/helpers.js'
import { config } from '../config/env.js'

const SHIPPING_CHARGE = 49
const FREE_SHIPPING_THRESHOLD = 499

export const createOrder = asyncHandler(async (req, res) => {
  const data = createOrderSchema.parse(req.body)
  if (data.paymentMethod === 'MOCK' && !config.isMockPayments) {
    return errorResponse(res, 'Mock payments are disabled', 400)
  }

  const [cart, address] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: { include: { inventory: true, images: { where: { isPrimary: true }, take: 1 } } },
          },
        },
      },
    }),
    prisma.address.findUnique({ where: { id: data.addressId, userId: req.user.id } }),
  ])

  if (!cart || cart.items.length === 0) return errorResponse(res, 'Cart is empty', 400)
  if (!address) return errorResponse(res, 'Shipping address not found', 404)

  const unavailable = cart.items.find((item) => !item.product.isActive)
  if (unavailable) {
    return errorResponse(res, `${unavailable.product.name} is no longer available. Please remove it from your cart.`, 400)
  }

  const order = await prisma.$transaction(async (tx) => {
    // Reserve stock atomically: the conditional UPDATE only succeeds while enough
    // stock remains, so concurrent checkouts cannot oversell. Any failure throws
    // and rolls back the whole transaction (including earlier decrements).
    for (const item of cart.items) {
      const { count } = await tx.inventory.updateMany({
        where: { productId: item.productId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      })
      if (count === 0) {
        throw Object.assign(new Error(`Insufficient stock for ${item.product.name}`), { statusCode: 400 })
      }
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = cart.items.map((item) => {
      const effectivePrice = parseFloat(item.product.price)
      const discount = parseFloat(item.product.discount || 0)
      const finalPrice = effectivePrice * (1 - discount / 100)
      const lineTotal = finalPrice * item.quantity
      subtotal += lineTotal
      return {
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images[0]?.url || null,
        price: effectivePrice,
        discount: item.product.discount || 0,
        quantity: item.quantity,
        subtotal: lineTotal,
      }
    })

    // Apply coupon
    let discountAmount = 0
    let couponId = null
    if (data.couponCode) {
      const coupon = await tx.coupon.findUnique({ where: { code: data.couponCode.toUpperCase() } })
      if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          if (subtotal >= parseFloat(coupon.minOrderValue)) {
            discountAmount =
              coupon.discountType === 'PERCENTAGE'
                ? Math.min(subtotal * (parseFloat(coupon.discountValue) / 100), coupon.maxDiscount ? parseFloat(coupon.maxDiscount) : Infinity)
                : Math.min(parseFloat(coupon.discountValue), subtotal)
            couponId = coupon.id
            await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })
          }
        }
      }
    }

    const afterDiscount = subtotal - discountAmount
    const shippingCharge = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE
    const totalAmount = afterDiscount + shippingCharge

    // Create order
    const order = await tx.order.create({
      data: {
        userId: req.user.id,
        addressId: data.addressId,
        couponId,
        subtotal,
        discountAmount,
        shippingCharge,
        totalAmount,
        notes: data.notes,
        items: { create: orderItems },
      },
      include: { items: true, address: true },
    })

    // Create payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        method: data.paymentMethod,
        status: 'PENDING',
        amount: totalAmount,
      },
    })

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

    return order
  })

  return successResponse(res, 'Order placed successfully', order, 201)
})

export const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query)
  const [total, orders] = await Promise.all([
    prisma.order.count({ where: { userId: req.user.id } }),
    prisma.order.findMany({
      where: { userId: req.user.id },
      skip,
      take: limit,
      include: { items: true, payment: true, shipment: true, address: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])
  return paginatedResponse(res, 'Orders fetched', orders, buildPaginationMeta(total, page, limit))
})

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const where = { id }
  if (req.user.role !== 'ADMIN') where.userId = req.user.id

  const order = await prisma.order.findFirst({
    where,
    include: { items: true, payment: true, shipment: true, address: true, coupon: true },
  })
  if (!order) return errorResponse(res, 'Order not found', 404)
  return successResponse(res, 'Order fetched successfully', order)
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = updateOrderStatusSchema.parse(req.body)

  const order = await prisma.order.findUnique({ where: { id }, include: { shipment: true } })
  if (!order) return errorResponse(res, 'Order not found', 404)

  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({ where: { id }, data: { status: data.status } })

    if (data.status === 'DELIVERED') {
      await tx.payment.updateMany({ where: { orderId: id }, data: { status: 'PAID', paidAt: new Date() } })
    }

    if (data.status === 'SHIPPED' && (data.trackingNumber || data.carrier)) {
      await tx.shipment.upsert({
        where: { orderId: id },
        update: {
          trackingNumber: data.trackingNumber,
          carrier: data.carrier,
          shippedAt: new Date(),
        },
        create: {
          orderId: id,
          trackingNumber: data.trackingNumber,
          carrier: data.carrier,
          shippedAt: new Date(),
        },
      })
    }

    return o
  })

  return successResponse(res, 'Order status updated', updated)
})

export const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query)
  const { status } = req.query
  const where = {}
  if (status) where.status = status

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
        payment: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])
  return paginatedResponse(res, 'All orders fetched', orders, buildPaginationMeta(total, page, limit))
})
