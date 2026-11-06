import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { config } from '../config/env.js'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(config.upload.path, folder)
      // multer does not create folders passed via a destination function
      fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir))
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${uuidv4()}${ext}`)
    },
  })

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(Object.assign(new Error('Only JPEG, PNG and WebP images are allowed'), { statusCode: 400 }), false)
  }
}

export const uploadProductImages = multer({
  storage: storage('products'),
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
}).array('images', 5)

export const uploadBanner = multer({
  storage: storage('banners'),
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
}).single('image')

// Saved under uploads/categories, matching the URL stored by category.controller.js
export const uploadCategoryImage = multer({
  storage: storage('categories'),
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
}).single('image')

export const uploadAvatar = multer({
  storage: storage('avatars'),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('avatar')
