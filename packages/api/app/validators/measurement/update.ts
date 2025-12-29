import vine from '@vinejs/vine'

export const updateMeasurementValidator = vine.compile(
  vine.object({
    weight: vine.number().positive().optional(),
    height: vine.number().positive().optional(),
    bodyFat: vine.number().min(0).max(100).optional(),
  })
)
