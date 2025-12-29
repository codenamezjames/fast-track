import vine from '@vinejs/vine'

export const updateWorkoutLogValidator = vine.compile(
  vine.object({
    endTime: vine.date().optional(),
    isCompleted: vine.boolean().optional(),
    exercisesCompleted: vine
      .array(
        vine.object({
          name: vine.string().trim().minLength(1),
          sets: vine.number().positive().optional(),
          reps: vine.number().positive().optional(),
          weight: vine.number().positive().optional(),
          duration: vine.number().positive().optional(),
          notes: vine.string().trim().maxLength(500).optional(),
        })
      )
      .optional(),
  })
)
