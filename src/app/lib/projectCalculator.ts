import type { ProjectOutputs, Track, VariableMap } from '@/app/data/mockData';

const getNumber = (variables: VariableMap | undefined, key: string, fallback: number) => {
  const value = variables?.[key];
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

const getBoolean = (variables: VariableMap | undefined, key: string, fallback: boolean) => {
  const value = variables?.[key];
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return fallback;
};

export const computeOutputs = (
  variables: VariableMap | undefined,
  intervalData: unknown,
  track: Track
): ProjectOutputs => {
  const capacityMw = getNumber(variables, 'system_capacity', 2.5);
  const capexPerWatt = getNumber(variables, 'capex_per_watt', 1.28);
  const discountRate = getNumber(variables, 'discount_rate', 5.5) / 100;
  const projectLifetime = getNumber(variables, 'project_lifetime', 25);
  const utilityRate = getNumber(variables, 'utility_rate', 0.145);
  const federalItc = getNumber(variables, 'federal_itc', 30) / 100;
  const stateRebate = getNumber(variables, 'state_rebate', 250000);
  const netMetering = getBoolean(variables, 'net_metering', true);

  const trackModifiers = {
    1: { capex: 1, savings: 1, coverage: 1 },
    2: { capex: 1.25, savings: 0.85, coverage: 0.9 },
    3: { capex: 1.1, savings: 0.7, coverage: 0.6 },
  } as const;

  const modifiers = trackModifiers[track];
  const baseCapex = capacityMw * 1_000_000 * capexPerWatt * modifiers.capex;
  const capacityFactor = track === 2 ? 0.18 : track === 3 ? 0.16 : 0.2;
  const annualMwh = capacityMw * 1000 * 8760 * capacityFactor * modifiers.coverage;
  const demandOffset = netMetering ? 1 : 0.9;
  const annualSavings = annualMwh * utilityRate * demandOffset * modifiers.savings;
  const discountedFactor = (1 - Math.pow(1 + discountRate, -projectLifetime)) / (discountRate || 0.01);
  const npv = annualSavings * discountedFactor - baseCapex;
  const roi = baseCapex === 0 ? 0 : ((annualSavings * projectLifetime - baseCapex) / baseCapex) * 100;
  const payback = annualSavings === 0 ? 0 : baseCapex / annualSavings;
  const totalTaxBenefit = baseCapex * federalItc + stateRebate;

  return {
    npv: { value: npv, confidence: 'computed' },
    roi: { value: roi, confidence: 'computed' },
    payback: { value: payback, confidence: 'computed' },
    capex: { value: baseCapex, confidence: 'partial' },
    annualSavings: { value: annualSavings, confidence: 'computed' },
    totalTaxBenefit: { value: totalTaxBenefit, confidence: 'stubbed' },
  };
};
