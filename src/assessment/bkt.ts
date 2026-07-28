export interface BktParams {
  P_L0: number;
  P_T: number;
  P_G: number;
  P_S: number;
}

export const BKT_DEFAULTS: BktParams = {
  P_L0: 0.1,
  P_T: 0.3,
  P_G: 0.25,
  P_S: 0.1,
};

export function bktUpdate(
  prior: number,
  isCorrect: boolean,
  params: BktParams = BKT_DEFAULTS,
): number {
  const { P_T, P_G, P_S } = params;

  let posterior: number;

  if (isCorrect) {
    const numerator = prior * (1 - P_S);
    const denominator = numerator + (1 - prior) * P_G;
    posterior = denominator === 0 ? prior : numerator / denominator;
  } else {
    const numerator = prior * P_S;
    const denominator = numerator + (1 - prior) * (1 - P_G);
    posterior = denominator === 0 ? prior : numerator / denominator;
  }

  return posterior + (1 - posterior) * P_T;
}

export function bktProbabilityToMastery(probability: number): number {
  return Math.round(probability * 100);
}
