import type { H3Event } from 'h3'
import type { z } from 'zod'

export async function parseRequestBody<TSchema extends z.ZodType>(
  event: H3Event,
  schema: TSchema,
): Promise<z.output<TSchema>> {
  const result = schema.safeParse(await readBody(event))

  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation failed',
      data: {
        issues: result.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    })
  }

  return result.data
}
