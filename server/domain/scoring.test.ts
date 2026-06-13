import { describe, expect, it } from 'vitest'
import { calculatePredictionPoints } from './scoring'

describe('calculatePredictionPoints', () => {
  it('awards three points for an exact score', () => {
    expect(calculatePredictionPoints({ home: 2, away: 1 }, { home: 2, away: 1 }))
      .toEqual({ points: 3, reason: 'EXACT_SCORE' })
  })

  it.each([
    [{ home: 1, away: 0 }, { home: 3, away: 1 }],
    [{ home: 0, away: 2 }, { home: 1, away: 4 }],
    [{ home: 1, away: 1 }, { home: 2, away: 2 }],
  ])('awards one point for the correct outcome', (prediction, result) => {
    expect(calculatePredictionPoints(prediction, result))
      .toEqual({ points: 1, reason: 'CORRECT_OUTCOME' })
  })

  it('awards no points for an incorrect outcome', () => {
    expect(calculatePredictionPoints({ home: 2, away: 0 }, { home: 0, away: 1 }))
      .toEqual({ points: 0, reason: 'INCORRECT' })
  })
})
