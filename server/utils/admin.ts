import type { H3Event } from 'h3'

type AdminEvent = H3Event & {
  context: H3Event['context'] & {
    user?: {
      id: string
      isAdmin?: boolean
    }
  }
}

export function requireAdminUserId(event: AdminEvent): string {
  const user = event.context.user

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  if (!user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  return user.id
}
