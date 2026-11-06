import bcrypt from 'bcryptjs'
import prisma from '../config/database.js'
import { generateToken, setTokenCookie, clearTokenCookie } from '../utils/jwt.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { registerSchema, loginSchema, changePasswordSchema } from '../validators/auth.validator.js'

export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body)

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) return errorResponse(res, 'Email already registered', 409)

  const hashedPassword = await bcrypt.hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  const token = generateToken({ userId: user.id, role: user.role })
  setTokenCookie(res, token)

  return successResponse(res, 'Registration successful', { user, token }, 201)
})

export const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body)

  const user = await prisma.user.findUnique({ where: { email: data.email } })
  if (!user || !user.isActive) return errorResponse(res, 'Invalid credentials', 401)

  const isValid = await bcrypt.compare(data.password, user.password)
  if (!isValid) return errorResponse(res, 'Invalid credentials', 401)

  const token = generateToken({ userId: user.id, role: user.role })
  setTokenCookie(res, token)

  const { password, ...safeUser } = user
  return successResponse(res, 'Login successful', { user: safeUser, token })
})

export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res)
  return successResponse(res, 'Logged out successfully')
})

export const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, avatar: true, isActive: true, createdAt: true,
    },
  })
  return successResponse(res, 'User fetched successfully', user)
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, phone },
    select: { id: true, name: true, email: true, phone: true, role: true, avatar: true },
  })
  return successResponse(res, 'Profile updated successfully', user)
})

export const changePassword = asyncHandler(async (req, res) => {
  const data = changePasswordSchema.parse(req.body)

  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  const isValid = await bcrypt.compare(data.currentPassword, user.password)
  if (!isValid) return errorResponse(res, 'Current password is incorrect', 400)

  const hashedPassword = await bcrypt.hash(data.newPassword, 12)
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword } })

  return successResponse(res, 'Password changed successfully')
})
