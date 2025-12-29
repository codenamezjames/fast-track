import vine from '@vinejs/vine'

/**
 * Validator for creating a fast
 */
export const storeFastValidator = vine.compile(
  vine.object({
    startTime: vine.date(),
    goalHours: vine.number().positive().min(1).max(48),
    notes: vine.string().optional(),
  })
)
