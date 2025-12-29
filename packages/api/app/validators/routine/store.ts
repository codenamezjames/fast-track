import vine from '@vinejs/vine'

export const storeRoutineValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(100),
    exercises: vine.array(
      vine.object({
        name: vine.string().trim().minLength(1),
        sets: vine.number().positive().optional(),
        reps: vine.number().positive().optional(),
        weight: vine.number().positive().optional(),
        duration: vine.number().positive().optional(),
        notes: vine.string().trim().maxLength(500).optional(),
      })
    ),
  })
)
