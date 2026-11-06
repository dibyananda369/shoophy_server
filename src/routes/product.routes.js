import express from 'express'
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js'
import { uploadProductImages } from '../middleware/upload.js'
import {
  getProducts, getProductById, createProduct, updateProduct, deleteProduct,
  getFeaturedProducts, getTrendingProducts, getNewArrivals, getRelatedProducts
} from '../controllers/product.controller.js'
import { getProductReviews, createReview } from '../controllers/review.controller.js'

const router = express.Router()

router.get('/', getProducts)
router.get('/featured', getFeaturedProducts)
router.get('/trending', getTrendingProducts)
router.get('/new-arrivals', getNewArrivals)
router.get('/:id', optionalAuth, getProductById)
router.get('/:id/related', getRelatedProducts)
router.get('/:id/reviews', getProductReviews)
router.post('/:id/reviews', authenticate, createReview)

router.post('/', authenticate, requireAdmin, uploadProductImages, createProduct)
router.put('/:id', authenticate, requireAdmin, uploadProductImages, updateProduct)
router.delete('/:id', authenticate, requireAdmin, deleteProduct)

export default router

