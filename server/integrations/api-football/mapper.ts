import type { MatchStatus } from '@prisma/client'
import type { ApiFootballFixture } from './schema'

const statusMap: Record<string, MatchStatus> = {
  TBD: 'SCHEDULED',
  NS: 'SCHEDULED',
  '1H': 'LIVE',
  HT: 'LIVE',
  '2H': 'LIVE',
  ET: 'LIVE',
  BT: 'LIVE',
  P: 'LIVE',
  SUSP: 'POSTPONED',
  INT: 'POSTPONED',
  FT: 'FINISHED',
  AET: 'FINISHED',
  PEN: 'FINISHED',
  PST: 'POSTPONED',
  CANC: 'CANCELLED',
  ABD: 'ABANDONED',
  AWD: 'CANCELLED',
  WO: 'CANCELLED',
}

export function mapFixtureStatus(status: string): MatchStatus {
  return statusMap[status] ?? 'SCHEDULED'
}

export function getPredictionResult(fixture: ApiFootballFixture) {
  if (mapFixtureStatus(fixture.fixture.status.short) !== 'FINISHED') {
    return null
  }

  const home = fixture.score.fulltime.home ?? fixture.goals.home
  const away = fixture.score.fulltime.away ?? fixture.goals.away

  if (home === null || away === null) {
    return null
  }

  return { home, away }
}
