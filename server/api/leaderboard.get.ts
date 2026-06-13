export default defineEventHandler(async () => {
  const users = await prisma.user.findMany({
    orderBy: [
      { totalPoints: 'desc' },
      { createdAt: 'asc' },
    ],
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      totalPoints: true,
      transactions: {
        where: {
          predictionId: {
            not: null,
          },
        },
        select: {
          reason: true,
        },
      },
    },
  })

  return users
    .map((user) => {
      const exactScores = user.transactions.filter(
        transaction => transaction.reason === 'EXACT_SCORE',
      ).length
      const correctOutcomes = user.transactions.filter(
        transaction => transaction.reason === 'CORRECT_OUTCOME',
      ).length

      return {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        totalPoints: user.totalPoints,
        exactScores,
        correctOutcomes,
        scoredPredictions: user.transactions.length,
      }
    })
    .sort((a, b) => (
      b.totalPoints - a.totalPoints
      || b.exactScores - a.exactScores
      || b.correctOutcomes - a.correctOutcomes
    ))
    .map((user, index) => ({
      rank: index + 1,
      ...user,
    }))
})
