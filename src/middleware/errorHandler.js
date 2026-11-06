import { config } from '../config/env.js'

/**
 * Centralized error handler — always returns consistent JSON
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err)

  // Prisma known errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field'
    return res.status(409).json({ success: false, message: `${field} already exists` })
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Record not found' })
  }
  if (err.code === 'P2003') {
    return res.status(400).json({ success: false, message: 'Related record not found' })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' })
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    // Zod 4 exposes `issues` (Zod 3 also had the `errors` alias)
    const issues = err.issues || err.errors || []
    const errors = issues.map((e) => ({ field: (e.path || []).join('.'), message: e.message }))
    return res.status(400).json({
      success: false,
      message: errors[0]
        ? `Validation failed: ${errors[0].field ? `${errors[0].field} – ` : ''}${errors[0].message}`
        : 'Validation failed',
      errors,
    })
  }

  const statusCode = err.statusCode || 500
  const message = config.nodeEnv === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message || 'Internal server error'

  res.status(statusCode).json({ success: false, message })
}

/**
 * 404 handler for unknown routes
 */
export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` })
}

