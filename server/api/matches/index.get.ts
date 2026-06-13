import { z } from 'zod'

const querySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  competitionId: z.string().cuid().optional(),
})

export default defineEventHandler(async (event) => {
  const query = querySchema.parse(getQuery(event))
  const from = query.from ?? new Date()
  const to = query.to ?? new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000)
  const userId = event.context.user?.id

  const matches = await prisma.match.findMany({
    where: {
      startsAt: {
        gte: from,
        lte: to,
      },
      competitionId: query.competitionId,
      status: {
        notIn: ['CANCELLED', 'ABANDONED'],
      },
    },
    include: {
      competition: true,
      homeTeam: true,
      awayTeam: true,
      predictions: {
        select: {
          userId: true,
          homeScore: true,
          awayScore: true,
          points: true,
          status: true,
          user: {
            select: {
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      startsAt: 'asc',
    },
  })

  return matches.map(({ predictions, ...match }) => {
    const ownPrediction = predictions.find(
      prediction => prediction.userId === userId,
    )

    return {
      ...match,
      prediction: ownPrediction
        ? {
            homeScore: ownPrediction.homeScore,
            awayScore: ownPrediction.awayScore,
            points: ownPrediction.points,
            status: ownPrediction.status,
          }
        : null,
      publicPredictions: predictions
        .map(prediction => ({
          userId: prediction.userId,
          displayName: prediction.user.displayName,
          avatarUrl: prediction.user.avatarUrl,
          homeScore: prediction.homeScore,
          awayScore: prediction.awayScore,
          points: prediction.points,
          status: prediction.status,
        }))
        .sort((a, b) => (
          b.points - a.points
          || a.displayName.localeCompare(b.displayName)
        )),
    }
  })
})
