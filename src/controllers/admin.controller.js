import prisma from '../config/database.js'
import { successResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { getPaginationParams, buildPaginationMeta } from '../utils/helpers.js'

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenueResult,
    recentOrders,
    lowStockProducts,
    ordersByStatus,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { productName: true, quantity: true } },
        payment: { select: { status: true, method: true } },
      },
    }),
    prisma.inventory.findMany({
      where: { quantity: { lte: 10 } },
      include: { product: { select: { name: true, sku: true } } },
      take: 10,
    }).catch(() => []),
    prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
  ])

  return successResponse(res, 'Dashboard stats fetched', {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenueResult._sum.amount || 0,
    recentOrders,
    ordersByStatus,
    lowStockAlerts: lowStockProducts.length,
    lowStockList: lowStockProducts,
  })
})

export const getCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query)
  const { search } = req.query
  const where = { role: 'CUSTOMER' }
  if (search) {
    where.OR = [{ name: { contains: search } }, { email: { contains: search } }]
  }

  const [total, customers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true, name: true, email: true, phone: true,
        isActive: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return res.json({ success: true, message: 'Customers fetched', data: customers, meta: buildPaginationMeta(total, page, limit) })
})

export const toggleCustomerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, isActive: true },
  })
  return successResponse(res, `Customer ${updated.isActive ? 'activated' : 'deactivated'}`, updated)
})

export const getAdminOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query)
  const { status, search } = req.query
  const where = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { id: { contains: search } },
      { user: { name: { contains: search } } },
    ]
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where, skip, take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
        payment: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return res.json({ success: true, message: 'Orders fetched', data: orders, meta: buildPaginationMeta(total, page, limit) })
})

export const getAnalytics = asyncHandler(async (req, res) => {
  const [
    topProducts,
    categories,
    recentOrders,
  ] = await Promise.all([
    prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: 10,
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 * 6) } },
      select: { createdAt: true, totalAmount: true, status: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  return successResponse(res, 'Analytics fetched', { topProducts, categories, recentOrders })
})

