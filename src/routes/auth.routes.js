import express from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  register, login, logout, getMe, updateProfile, changePassword
} from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', authenticate, getMe)
router.put('/profile', authenticate, updateProfile)
router.put('/change-password', authenticate, changePassword)

export default router

