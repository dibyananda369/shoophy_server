import { z } from 'zod'

/**
 * Boolean that also accepts the string forms sent by multipart forms and query strings.
 * Unlike z.coerce.boolean(), the string 'false' becomes false (not true).
 */
export const boolish = () =>
  z.preprocess((value) => {
    if (typeof value === 'string') {
      const s = value.trim().toLowerCase()
      if (['true', '1', 'on', 'yes'].includes(s)) return true
      if (['false', '0', 'off', 'no', ''].includes(s)) return false
    }
    return value
  }, z.boolean())
