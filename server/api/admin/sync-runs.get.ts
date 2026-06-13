import { requireAdminUserId } from '../../utils/admin'

export default defineEventHandler(async (event) => {
  requireAdminUserId(event)

  return prisma.syncRun.findMany({
    orderBy: {
      startedAt: 'desc',
    },
    take: 20,
  })
})
