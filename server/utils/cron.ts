import type { H3Event } from 'h3'

export function requireVercelCronRequest(event: H3Event) {
  const userAgent = getHeader(event, 'user-agent') ?? ''

  if (userAgent !== 'vercel-cron/1.0') {
    throw createError({
      statusCode: 401,
      message: 'Invalid cron request',
    })
  }
}
