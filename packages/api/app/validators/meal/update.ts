import vine from '@vinejs/vine'

/**
 * Validator for updating a meal
 */
export const updateMealValidator = vine.compile(
  vine.object({
    date: vine.date().optional(),
    type: vine.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
    foods: vine
      .array(
        vine.object({
          name: vine.string(),
          calories: vine.number().positive(),
          protein: vine.number().positive().optional(),
          carbs: vine.number().positive().optional(),
          fat: vine.number().positive().optional(),
          serving: vine.string().optional(),
          brand: vine.string().optional(),
        })
      )
      .optional(),
    totalCalories: vine.number().positive().optional(),
  })
)
