import vine from '@vinejs/vine'

export const storeWorkoutLogValidator = vine.compile(
  vine.object({
    routineId: vine.number().positive().optional(),
    startTime: vine.date(),
    exercisesCompleted: vine.array(
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
