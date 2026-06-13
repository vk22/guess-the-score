import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string().cuid(),
})

const bodySchema = z.object({
  homeScore: z.number().int().min(0).max(99),
  awayScore: z.number().int().min(0).max(99),
})

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event)
  const { id: matchId } = paramsSchema.parse(event.context.params)
  const score = bodySchema.parse(await readBody(event))
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      startsAt: true,
      status: true,
    },
  })

  if (!match) {
    throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  }

  if (match.status !== 'SCHEDULED' || match.startsAt <= new Date()) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Predictions are closed for this match',
    })
  }

  return prisma.prediction.upsert({
    where: {
      userId_matchId: {
        userId,
        matchId,
      },
    },
    create: {
      userId,
      matchId,
      ...score,
    },
    update: score,
  })
})
