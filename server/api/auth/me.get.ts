export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      isAdmin: true,
      totalPoints: true,
      createdAt: true,
      _count: {
        select: {
          predictions: true,
        },
      },
    },
  })

  if (!user) {
    await clearUserSession(event)
    throw createError({
      statusCode: 401,
      statusMessage: 'Session user no longer exists',
    })
  }

  return { user }
})
