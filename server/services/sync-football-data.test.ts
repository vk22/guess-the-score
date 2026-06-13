import { describe, expect, it } from 'vitest'
import type { FootballDataMatch } from '../integrations/football-data/schema'
import {
  createDateWindows,
  hasAssignedTeams,
} from './sync-football-data'

describe('createDateWindows', () => {
  it('splits a long period into inclusive windows of at most ten days', () => {
    expect(createDateWindows('2026-06-11', '2026-07-13')).toEqual([
      { from: '2026-06-11', to: '2026-06-20' },
      { from: '2026-06-21', to: '2026-06-30' },
      { from: '2026-07-01', to: '2026-07-10' },
      { from: '2026-07-11', to: '2026-07-13' },
    ])
  })

  it('keeps a short period in one window', () => {
    expect(createDateWindows('2026-06-11', '2026-06-13')).toEqual([
      { from: '2026-06-11', to: '2026-06-13' },
    ])
  })

  it('rejects an inverted period', () => {
    expect(() => createDateWindows('2026-06-14', '2026-06-13'))
      .toThrow('Sync start date must not be after end date')
  })

  it('detects a fixture whose teams are not assigned yet', () => {
    const match = {
      homeTeam: { id: null, name: null },
      awayTeam: { id: null, name: null },
    } as FootballDataMatch

    expect(hasAssignedTeams(match)).toBe(false)
  })
})
