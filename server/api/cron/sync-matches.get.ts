import { executeSyncRun } from '../../services/execute-sync-run'
import { requireVercelCronRequest } from '../../utils/cron'

export default defineEventHandler(async (event) => {
  requireVercelCronRequest(event)

  const result = await executeSyncRun({ source: 'vercel-cron' })

  if (result.skipped) {
    return {
      skipped: true,
    }
  }

  return {
    skipped: false,
    summary: result.summary,
  }
})
