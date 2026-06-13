export type Score = {
  home: number
  away: number
}

export type ScoringResult = {
  points: 0 | 1 | 3
  reason: 'INCORRECT' | 'CORRECT_OUTCOME' | 'EXACT_SCORE'
}

const outcome = (score: Score) => Math.sign(score.home - score.away)

export function calculatePredictionPoints(
  prediction: Score,
  result: Score,
): ScoringResult {
  if (prediction.home === result.home && prediction.away === result.away) {
    return { points: 3, reason: 'EXACT_SCORE' }
  }

  if (outcome(prediction) === outcome(result)) {
    return { points: 1, reason: 'CORRECT_OUTCOME' }
  }

  return { points: 0, reason: 'INCORRECT' }
}
