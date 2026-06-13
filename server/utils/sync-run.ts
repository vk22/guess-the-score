import type { Prisma } from '@prisma/client'

export type SyncRunSummary = {
  provider: string
  competition?: string | null
  from: string
  to: string
  requests: number
  synced: number
  skipped?: number
  scored: number
  failures: Array<Record<string, unknown>>
}

export async function createSyncRun(
  tx: Prisma.TransactionClient,
  input: {
    source: string
    competition?: string | null
  },
) {
  return tx.syncRun.create({
    data: {
      source: input.source,
      competition: input.competition ?? null,
      status: 'running',
      failures: [] as Prisma.InputJsonValue,
    } satisfies Prisma.SyncRunCreateInput,
  })
}

export async function finishSyncRun(
  tx: Prisma.TransactionClient,
  runId: string,
  summary: SyncRunSummary,
) {
  return tx.syncRun.update({
    where: { id: runId },
    data: {
      status: summary.failures.length ? 'completed_with_errors' : 'completed',
      requests: summary.requests,
      synced: summary.synced,
      skipped: summary.skipped ?? 0,
      scored: summary.scored,
      failures: summary.failures as Prisma.InputJsonValue,
      finishedAt: new Date(),
    },
  })
}

export async function failSyncRun(
  tx: Prisma.TransactionClient,
  runId: string,
  error: unknown,
) {
  return tx.syncRun.update({
    where: { id: runId },
    data: {
      status: 'failed',
      failures: [
        {
          message: error instanceof Error ? error.message : 'Unknown sync error',
        },
      ] as Prisma.InputJsonValue,
      finishedAt: new Date(),
    },
  })
}
