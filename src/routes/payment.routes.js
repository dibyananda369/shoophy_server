import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { getPaymentConfig, createRazorpayOrder, verifyPayment } from '../controllers/payment.controller.js'

const router = express.Router()

router.use(authenticate)
router.get('/config', getPaymentConfig)
router.post('/create', createRazorpayOrder)
router.post('/verify', verifyPayment)

export default router

