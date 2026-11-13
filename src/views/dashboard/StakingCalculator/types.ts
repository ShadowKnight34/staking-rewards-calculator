export type CompoundingFrequency = 'daily' | 'weekly' | 'monthly' | 'annually';

export type DurationUnit = 'days' | 'years';

export interface StakingFormInputs {
  principal: string;
  apy: string;
  duration: string;
  durationUnit: DurationUnit;
  compoundingFrequency: CompoundingFrequency;
  tokenPrice: string;
}

export interface StakingCalculationRequest {
  principal: number;
  apy: number;
  duration: number;
  durationUnit: DurationUnit;
  compoundingFrequency: CompoundingFrequency;
  tokenPrice?: number;
}

export interface ChartPoint {
  period: number;
  elapsedDays: number;
  balance: number;
}

export interface StakingCalculationData {
  principal: number;
  apy: number;
  duration: number;
  durationUnit: DurationUnit;
  normalizedDurationYears: number;
  compoundingFrequency: CompoundingFrequency;
  finalBalance: number;
  totalRewards: number;
  tokenPrice: number | null;
  projectedUsdValue: number | null;
  chartData: ChartPoint[];
}

export interface StakingApiResponse {
  success: boolean;
  data?: StakingCalculationData;
  error?: string;
  errors?: string[];
}

