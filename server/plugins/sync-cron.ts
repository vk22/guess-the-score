import { executeSyncRun } from '../services/execute-sync-run'

const INTERVAL = 5 * 60 * 1000

export default defineNitroPlugin(() => {
  if (
    process.env.NODE_ENV === 'test'
    || process.env.VERCEL
    || process.env.NUXT_DISABLE_SYNC_CRON === 'true'
  ) {
    return
  }

  const run = () => {
    void executeSyncRun({ source: 'cron' }).catch((error) => {
      console.error('[sync-cron] failed', error)
    })
  }

  const timer = setInterval(run, INTERVAL)
  timer.unref?.()
})
