import { loginSchema } from '#shared/schemas/auth'

export default defineEventHandler(async (event) => {
  const input = await parseRequestBody(event, loginSchema)
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      isAdmin: true,
      passwordHash: true,
    },
  })

  if (!user || !await verifyPassword(user.passwordHash, input.password)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Неверный email или пароль',
    })
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isAdmin: user.isAdmin,
  }

  await replaceUserSession(event, {
    user: sessionUser,
    loggedInAt: new Date().toISOString(),
  })

  return { user: sessionUser }
})
