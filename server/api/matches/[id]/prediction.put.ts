import { z } from 'zod'
import { scoreFinishedMatch } from '../../../services/score-finished-match'

const paramsSchema = z.object({
  id: z.string().cuid(),
})

const bodySchema = z.object({
  homeScore: z.number().int().min(0).max(99),
  awayScore: z.number().int().min(0).max(99),
})

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event)
  const isAdmin = Boolean(event.context.user?.isAdmin)
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

  const isOpenMatch = match.status === 'SCHEDULED' && match.startsAt > new Date()
  const isAdminFinishedMatch = isAdmin && match.status === 'FINISHED'

  if (!isOpenMatch && !isAdminFinishedMatch) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Predictions are closed for this match',
    })
  }

  const existingPrediction = await prisma.prediction.findUnique({
    where: {
      userId_matchId: {
        userId,
        matchId,
      },
    },
    select: {
      id: true,
    },
  })

  if (isAdminFinishedMatch && existingPrediction) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Prediction already exists for this match',
    })
  }

  const prediction = existingPrediction
    ? await prisma.prediction.update({
        where: {
          userId_matchId: {
            userId,
            matchId,
          },
        },
        data: score,
      })
    : await prisma.prediction.create({
        data: {
          userId,
          matchId,
          ...score,
        },
      })

  if (isAdminFinishedMatch) {
    await scoreFinishedMatch(matchId)
    return prisma.prediction.findUnique({
      where: {
        userId_matchId: {
          userId,
          matchId,
        },
      },
    })
  }

  return prediction
})
