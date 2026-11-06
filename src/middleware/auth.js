import { verifyToken } from '../utils/jwt.js'
import { errorResponse } from '../utils/response.js'
import prisma from '../config/database.js'

/**
 * Authenticate requests via JWT cookie or Bearer token
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token

    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
      }
    }

    if (!token) {
      return errorResponse(res, 'Authentication required', 401)
    }

    const decoded = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true, name: true },
    })

    if (!user || !user.isActive) {
      return errorResponse(res, 'User not found or deactivated', 401)
    }

    req.user = user
    next()
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token', 401)
  }
}

/**
 * Require admin role
 */
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return errorResponse(res, 'Admin access required', 403)
  }
  next()
}

/**
 * Optional authentication — attaches user if token present, but doesn't block
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token
    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
      }
    }
    if (token) {
      const decoded = verifyToken(token)
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, isActive: true, name: true },
      })
      if (user?.isActive) req.user = user
    }
  } catch (_) {
    // silently ignore invalid tokens for optional auth
  }
  next()
}

