import type { MatchStatus } from '@prisma/client'
import type { FootballDataMatch } from './schema'

const statusMap: Record<string, MatchStatus> = {
  SCHEDULED: 'SCHEDULED',
  TIMED: 'SCHEDULED',
  IN_PLAY: 'LIVE',
  PAUSED: 'LIVE',
  FINISHED: 'FINISHED',
  POSTPONED: 'POSTPONED',
  SUSPENDED: 'POSTPONED',
  CANCELLED: 'CANCELLED',
  AWARDED: 'CANCELLED',
}

export function mapFootballDataStatus(status: string): MatchStatus {
  return statusMap[status] ?? 'SCHEDULED'
}

export function getFootballDataResult(match: FootballDataMatch) {
  if (mapFootballDataStatus(match.status) !== 'FINISHED') {
    return null
  }

  const regularTime = match.score.regularTime
  if (
    regularTime
    && regularTime.home !== null
    && regularTime.away !== null
  ) {
    return {
      home: regularTime.home,
      away: regularTime.away,
    }
  }

  const { fullTime } = match.score
  if (fullTime.home === null || fullTime.away === null) {
    return null
  }

  if (match.score.duration !== 'REGULAR') {
    return null
  }

  return {
    home: fullTime.home,
    away: fullTime.away,
  }
}

export function getFootballDataLiveScore(match: FootballDataMatch) {
  if (mapFootballDataStatus(match.status) !== 'LIVE') {
    return null
  }

  const { fullTime } = match.score
  if (fullTime.home !== null && fullTime.away !== null) {
    return {
      home: fullTime.home,
      away: fullTime.away,
    }
  }

  return null
}
