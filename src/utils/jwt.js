import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'

export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn })
}

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret)
}

export const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

export const clearTokenCookie = (res) => {
  res.cookie('token', '', { httpOnly: true, maxAge: 0 })
}

