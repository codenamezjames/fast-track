import vine from '@vinejs/vine'

/**
 * Validator for updating a fast
 */
export const updateFastValidator = vine.compile(
  vine.object({
    endTime: vine.date().optional(),
    isCompleted: vine.boolean().optional(),
    notes: vine.string().optional(),
  })
)
