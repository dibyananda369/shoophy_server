import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { uploadCategoryImage } from '../middleware/upload.js'
import {
  getCategories, getAllCategories, createCategory, updateCategory, deleteCategory
} from '../controllers/category.controller.js'

const router = express.Router()

router.get('/', getCategories)
router.get('/all', authenticate, requireAdmin, getAllCategories)
router.post('/', authenticate, requireAdmin, uploadCategoryImage, createCategory)
router.put('/:id', authenticate, requireAdmin, uploadCategoryImage, updateCategory)
router.delete('/:id', authenticate, requireAdmin, deleteCategory)

export default router

