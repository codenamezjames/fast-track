import vine from '@vinejs/vine'

export const storeMeasurementValidator = vine.compile(
  vine.object({
    date: vine.date(),
    weight: vine.number().positive().optional(),
    height: vine.number().positive().optional(),
    bodyFat: vine.number().min(0).max(100).optional(),
  })
)
