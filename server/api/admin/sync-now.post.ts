import { requireAdminUserId } from '../../utils/admin'
import { executeSyncRun } from '../../services/execute-sync-run'

export default defineEventHandler(async (event) => {
  requireAdminUserId(event)

  const result = await executeSyncRun({ source: 'admin' })

  if (result.skipped) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Sync already running',
    })
  }

  return result.summary
})
