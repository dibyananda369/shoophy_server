/**
 * Consistent JSON response helpers
 */

export const successResponse = (res, message, data = null, statusCode = 200) => {
  const payload = { success: true, message }
  if (data !== null) payload.data = data
  return res.status(statusCode).json(payload)
}

export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const payload = { success: false, message }
  if (errors) payload.errors = errors
  return res.status(statusCode).json(payload)
}

export const paginatedResponse = (res, message, data, meta) => {
  return res.status(200).json({ success: true, message, data, meta })
}

