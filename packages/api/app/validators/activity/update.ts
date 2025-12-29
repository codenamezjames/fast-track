import vine from '@vinejs/vine'

export const updateActivityValidator = vine.compile(
  vine.object({
    type: vine.enum(['run', 'walk', 'bike', 'other']).optional(),
    endTime: vine.date().optional(),
    duration: vine.number().positive().optional(),
    distance: vine.number().positive().optional(),
    calories: vine.number().positive().optional(),
  })
)
