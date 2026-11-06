import prisma from '../config/database.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { config } from '../config/env.js'
import crypto from 'crypto'

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: req.user.id },
    include: { payment: true },
  })
  if (!order) return errorResponse(res, 'Order not found', 404)
  if (order.payment?.status === 'PAID') return errorResponse(res, 'Order already paid', 400)

  const amountInPaise = Math.round(parseFloat(order.totalAmount) * 100)

  // If Razorpay keys not configured, return mock response
  if (config.isMockPayments) {
    const mockRazorpayOrderId = `mock_${Date.now()}`
    await prisma.payment.update({
      where: { orderId: order.id },
      data: { razorpayOrderId: mockRazorpayOrderId },
    })
    return successResponse(res, 'Mock payment order created', {
      id: mockRazorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      isMock: true,
      key: config.razorpay.keyId,
    })
  }

  try {
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    })

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.id,
    })

    await prisma.payment.update({
      where: { orderId: order.id },
      data: { razorpayOrderId: rzpOrder.id },
    })

    return successResponse(res, 'Razorpay order created', { ...rzpOrder, key: config.razorpay.keyId })
  } catch (err) {
    return errorResponse(res, 'Payment gateway error', 500)
  }
})

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, isMock } = req.body

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: req.user.id },
    include: { payment: true },
  })
  if (!order) return errorResponse(res, 'Order not found', 404)
  if (!order.payment) return errorResponse(res, 'No payment record for this order', 400)
  if (order.payment.status === 'PAID') return errorResponse(res, 'Order already paid', 400)
  if (order.payment.method === 'COD') return errorResponse(res, 'Cash on Delivery orders are paid on delivery', 400)

  if (isMock) {
    // Only honour mock payments when no real gateway is configured
    if (!config.isMockPayments) return errorResponse(res, 'Mock payments are disabled', 400)

    // Which option the customer used on the built-in payment screen (for the records)
    const channel = ['UPI', 'CARD', 'NETBANKING'].includes(req.body.channel) ? req.body.channel : 'ONLINE'

    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId },
        data: {
          status: 'PAID',
          razorpayPaymentId: 'mock_payment_' + Date.now(),
          transactionId: `SHP-${channel}-${Date.now()}`,
          paidAt: new Date(),
        },
      }),
      prisma.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED' } }),
    ])
    return successResponse(res, 'Mock payment verified successfully')
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return errorResponse(res, 'Missing payment details', 400)
  }
  // The Razorpay order must be the one created for this order
  if (order.payment.razorpayOrderId !== razorpayOrderId) {
    return errorResponse(res, 'Payment does not match this order', 400)
  }

  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  if (expectedSignature !== razorpaySignature) {
    return errorResponse(res, 'Payment verification failed', 400)
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: {
        status: 'PAID',
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date(),
      },
    }),
    prisma.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED' } }),
  ])

  return successResponse(res, 'Payment verified successfully')
})


// Tells the checkout which payment screen to show:
// 'razorpay' when live gateway keys are configured, otherwise Shoophy's built-in screen
export const getPaymentConfig = (req, res) => {
  return successResponse(res, 'Payment configuration', {
    gateway: config.isMockPayments ? 'builtin' : 'razorpay',
  })
}
