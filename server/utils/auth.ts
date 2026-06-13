import type { H3Event } from 'h3'

type AuthenticatedEvent = H3Event & {
  context: H3Event['context'] & {
    user?: {
      id: string
    }
  }
}

export function requireUserId(event: AuthenticatedEvent): string {
  const userId = event.context.user?.id

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  return userId
}
