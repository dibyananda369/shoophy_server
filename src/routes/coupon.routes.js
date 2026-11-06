import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validateCoupon, createCoupon, getCoupons, updateCoupon, deleteCoupon } from '../controllers/coupon.controller.js'

const router = express.Router()

router.post('/validate', authenticate, validateCoupon)
router.get('/', authenticate, requireAdmin, getCoupons)
router.post('/', authenticate, requireAdmin, createCoupon)
router.put('/:id', authenticate, requireAdmin, updateCoupon)
router.delete('/:id', authenticate, requireAdmin, deleteCoupon)

export default router

