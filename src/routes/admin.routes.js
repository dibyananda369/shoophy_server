import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { uploadBanner } from '../middleware/upload.js'
import {
  getDashboardStats, getCustomers, toggleCustomerStatus,
  getAdminOrders, getAnalytics
} from '../controllers/admin.controller.js'
import { updateOrderStatus } from '../controllers/order.controller.js'
import { getAllReviews, moderateReview } from '../controllers/review.controller.js'
import { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner } from '../controllers/banner.controller.js'
import { getProducts } from '../controllers/product.controller.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

router.get('/dashboard', getDashboardStats)
router.get('/analytics', getAnalytics)

router.get('/customers', getCustomers)
router.patch('/customers/:id/toggle-status', toggleCustomerStatus)

router.get('/orders', getAdminOrders)
router.patch('/orders/:id/status', updateOrderStatus)

router.get('/products', getProducts)

router.get('/reviews', getAllReviews)
router.patch('/reviews/:id/moderate', moderateReview)

router.get('/banners', getAllBanners)
router.post('/banners', uploadBanner, createBanner)
router.put('/banners/:id', uploadBanner, updateBanner)
router.delete('/banners/:id', deleteBanner)

export default router

