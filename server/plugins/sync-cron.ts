import { executeSyncRun } from '../services/execute-sync-run'

const TEN_MINUTES = 10 * 60 * 1000

export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV === 'test' || process.env.VERCEL) {
    return
  }

  const run = () => {
    void executeSyncRun({ source: 'cron' }).catch((error) => {
      console.error('[sync-cron] failed', error)
    })
  }

  const timer = setInterval(run, TEN_MINUTES)
  timer.unref?.()
})
