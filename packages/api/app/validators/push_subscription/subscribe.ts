import vine from '@vinejs/vine'

export const subscribePushValidator = vine.compile(
  vine.object({
    endpoint: vine.string().url(),
    p256dhKey: vine.string().trim(),
    authKey: vine.string().trim(),
    userAgent: vine.string().trim().optional(),
  })
)
