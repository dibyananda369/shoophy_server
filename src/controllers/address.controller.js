import prisma from '../config/database.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { addressSchema, updateAddressSchema } from '../validators/address.validator.js'

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return successResponse(res, 'Addresses fetched', addresses)
})

export const createAddress = asyncHandler(async (req, res) => {
  const data = addressSchema.parse(req.body)

  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } })
    }
    return tx.address.create({ data: { userId: req.user.id, ...data } })
  })

  return successResponse(res, 'Address created', address, 201)
})

export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = updateAddressSchema.parse(req.body)

  const existing = await prisma.address.findFirst({ where: { id, userId: req.user.id } })
  if (!existing) return errorResponse(res, 'Address not found', 404)

  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } })
    }
    return tx.address.update({ where: { id }, data })
  })

  return successResponse(res, 'Address updated', address)
})

export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params
  const existing = await prisma.address.findFirst({ where: { id, userId: req.user.id } })
  if (!existing) return errorResponse(res, 'Address not found', 404)
  await prisma.address.delete({ where: { id } })
  return successResponse(res, 'Address deleted')
})

