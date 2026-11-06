import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller.js'

const router = express.Router()

router.use(authenticate)
router.get('/', getCart)
router.post('/items', addToCart)
router.put('/items/:id', updateCartItem)
router.delete('/items/:id', removeCartItem)
router.delete('/', clearCart)

export default router

