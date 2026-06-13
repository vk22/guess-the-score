import type { Prisma } from '@prisma/client'
import { calculatePredictionPoints } from '../domain/scoring'

export async function scoreFinishedMatch(matchId: string) {
  return prisma.$transaction(async (tx) => {
    const match = await tx.match.findUnique({
      where: { id: matchId },
      select: {
        status: true,
        homeScore: true,
        awayScore: true,
      },
    })

    if (
      !match
      || match.status !== 'FINISHED'
      || match.homeScore === null
      || match.awayScore === null
    ) {
      throw new Error('Only finished matches with a final score can be scored')
    }

    const predictions = await tx.prediction.findMany({
      where: {
        matchId,
        status: 'PENDING',
      },
    })

    for (const prediction of predictions) {
      await scorePrediction(tx, prediction, {
        home: match.homeScore,
        away: match.awayScore,
      })
    }

    return { processed: predictions.length }
  })
}

async function scorePrediction(
  tx: Prisma.TransactionClient,
  prediction: {
    id: string
    userId: string
    homeScore: number
    awayScore: number
  },
  result: {
    home: number
    away: number
  },
) {
  const scoring = calculatePredictionPoints(
    { home: prediction.homeScore, away: prediction.awayScore },
    result,
  )

  await tx.prediction.update({
    where: { id: prediction.id },
    data: {
      points: scoring.points,
      status: 'SCORED',
      calculatedAt: new Date(),
    },
  })

  await tx.pointTransaction.create({
    data: {
      userId: prediction.userId,
      predictionId: prediction.id,
      points: scoring.points,
      reason: scoring.reason,
    },
  })

  if (scoring.points > 0) {
    await tx.user.update({
      where: { id: prediction.userId },
      data: {
        totalPoints: {
          increment: scoring.points,
        },
      },
    })
  }
}
