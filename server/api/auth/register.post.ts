import { Prisma } from '@prisma/client'
import { registerSchema } from '#shared/schemas/auth'

export default defineEventHandler(async (event) => {
  const input = await parseRequestBody(event, registerSchema)
  const passwordHash = await hashPassword(input.password)

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        displayName: input.displayName,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        isAdmin: true,
      },
    })

    await replaceUserSession(event, {
      user,
      loggedInAt: new Date().toISOString(),
    })

    setResponseStatus(event, 201)
    return { user }
  }
  catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError
      && error.code === 'P2002'
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: 'Пользователь с таким email уже зарегистрирован',
      })
    }

    throw error
  }
})
