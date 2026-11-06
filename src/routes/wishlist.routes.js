import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js'

const router = express.Router()

router.use(authenticate)
router.get('/', getWishlist)
router.post('/', addToWishlist)
router.delete('/:id', removeFromWishlist)

export default router

