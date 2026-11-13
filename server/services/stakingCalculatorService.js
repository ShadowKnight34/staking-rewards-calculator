/**
 * DeFi Staking Rewards Calculation Engine
 * 
 * MATHEMATICAL FOUNDATION:
 * The calculation assumes the input is EFFECTIVE ANNUAL PERCENTAGE YIELD (APY),
 * rather than a nominal annual interest rate (APR).
 * 
 * In standard financial compounding:
 *   A = P * (1 + APY)^t
 * Where:
 *   P   = Initial principal
 *   APY = Effective annual yield (decimal)
 *   t   = Duration in years
 *   A   = Final balance
 * 
 * To generate balance projections at granular compounding intervals (daily, weekly, monthly, annually),
 * we derive the equivalent periodic rate (i) such that compounding n times a year yields the exact same APY:
 *   (1 + i)^n = 1 + APY
 *   i = (1 + APY)^(1/n) - 1
 * 
 * Compounding periods per year (n):
 *   - Daily:    n = 365
 *   - Weekly:   n = 52
 *   - Monthly:  n = 12
 *   - Annually: n = 1
 * 
 * Periodic compounding formula:
 *   A = P * (1 + i)^(n * t)
 * 
 * Because (1 + i)^n = 1 + APY, this yields mathematically identical final balances across all compounding
 * frequencies for any duration t, while accurately modeling the step-by-step portfolio trajectory.
 */

// Supported compounding frequencies and periods per year (n)
const COMPOUNDING_FREQUENCIES = {
  daily: 365,
  weekly: 52,
  monthly: 12,
  annually: 1,
};

// Supported duration units and conversion factors to years
const DURATION_UNITS = {
  days: 1 / 365,
  years: 1,
};

// Reasonable upper boundaries to prevent DOS and arithmetic overflow
const BOUNDARIES = {
  MIN_PRINCIPAL: 1e-8,
  MAX_PRINCIPAL: 1e12,        // 1 Trillion
  MIN_APY: 0,
  MAX_APY: 100000,            // 100,000%
  MIN_DURATION: 1e-4,
  MAX_DURATION_DAYS: 36500,   // 100 years in days
  MAX_DURATION_YEARS: 100,
  MIN_TOKEN_PRICE: 1e-8,
  MAX_TOKEN_PRICE: 1e9,
  MAX_CALCULATION_VALUE: 1e15, // Numerical overflow threshold
};

/**
 * Validates calculation input parameters.
 * Throws an Error with a descriptive message if any parameter is invalid.
 */
function validateInputs({ principal, apy, duration, durationUnit, compoundingFrequency, tokenPrice }) {
  // Principal validation
  if (typeof principal !== 'number' || isNaN(principal) || !isFinite(principal)) {
    throw new Error('Principal must be a valid finite number.');
  }
  if (principal <= 0) {
    throw new Error('Principal must be greater than zero.');
  }
  if (principal < BOUNDARIES.MIN_PRINCIPAL || principal > BOUNDARIES.MAX_PRINCIPAL) {
    throw new Error(`Principal must be between ${BOUNDARIES.MIN_PRINCIPAL} and ${BOUNDARIES.MAX_PRINCIPAL}.`);
  }

  // APY validation
  if (typeof apy !== 'number' || isNaN(apy) || !isFinite(apy)) {
    throw new Error('APY must be a valid finite number.');
  }
  if (apy < 0) {
    throw new Error('APY must be a non-negative number.');
  }
  if (apy > BOUNDARIES.MAX_APY) {
    throw new Error(`APY cannot exceed ${BOUNDARIES.MAX_APY}%.`);
  }

  // Duration unit validation
  if (!durationUnit || typeof durationUnit !== 'string' || !DURATION_UNITS[durationUnit.toLowerCase()]) {
    throw new Error(`Duration unit must be either 'days' or 'years'. Received: ${durationUnit}`);
  }
  const normalizedUnit = durationUnit.toLowerCase();

  // Duration validation
  if (typeof duration !== 'number' || isNaN(duration) || !isFinite(duration)) {
    throw new Error('Duration must be a valid finite number.');
  }
  if (duration <= 0) {
    throw new Error('Duration must be greater than zero.');
  }
  const maxDuration = normalizedUnit === 'days' ? BOUNDARIES.MAX_DURATION_DAYS : BOUNDARIES.MAX_DURATION_YEARS;
  if (duration > maxDuration) {
    throw new Error(`Duration cannot exceed ${maxDuration} ${normalizedUnit}.`);
  }

  // Compounding frequency validation
  if (!compoundingFrequency || typeof compoundingFrequency !== 'string' || !COMPOUNDING_FREQUENCIES[compoundingFrequency.toLowerCase()]) {
    throw new Error(`Compounding frequency must be daily, weekly, monthly, or annually. Received: ${compoundingFrequency}`);
  }

  // Optional token price validation
  if (tokenPrice !== undefined && tokenPrice !== null) {
    if (typeof tokenPrice !== 'number' || isNaN(tokenPrice) || !isFinite(tokenPrice)) {
      throw new Error('Token price must be a valid finite number.');
    }
    if (tokenPrice <= 0) {
      throw new Error('Token price must be greater than zero.');
    }
    if (tokenPrice < BOUNDARIES.MIN_TOKEN_PRICE || tokenPrice > BOUNDARIES.MAX_TOKEN_PRICE) {
      throw new Error(`Token price must be between ${BOUNDARIES.MIN_TOKEN_PRICE} and ${BOUNDARIES.MAX_TOKEN_PRICE}.`);
    }
  }
}

/**
 * Calculates staking rewards, projected balances, and chart time-series data.
 * 
 * @param {Object} params
 * @param {number} params.principal - Initial amount to stake
 * @param {number} params.apy - Annual Percentage Yield as a percentage (e.g. 5 for 5%)
 * @param {number} params.duration - Duration of staking
 * @param {'days'|'years'} params.durationUnit - Unit of duration
 * @param {'daily'|'weekly'|'monthly'|'annually'} params.compoundingFrequency - Compounding frequency
 * @param {number} [params.tokenPrice] - Optional token price in USD
 * @returns {Object} Calculation result with summary and chart data
 */
function calculateStakingRewards({
  principal,
  apy,
  duration,
  durationUnit,
  compoundingFrequency,
  tokenPrice,
}) {
  // Validate all inputs before proceeding
  validateInputs({ principal, apy, duration, durationUnit, compoundingFrequency, tokenPrice });

  const normalizedUnit = durationUnit.toLowerCase();
  const normalizedFreq = compoundingFrequency.toLowerCase();
  const n = COMPOUNDING_FREQUENCIES[normalizedFreq];

  // Duration in years (t) and in days
  const normalizedDurationYears = normalizedUnit === 'days' ? duration / 365 : duration;
  const totalDays = normalizedUnit === 'days' ? duration : duration * 365;

  // Convert APY percentage to decimal
  const apyDecimal = apy / 100;

  // Derive equivalent periodic rate i = (1 + APY)^(1/n) - 1
  const periodicRate = apyDecimal === 0 ? 0 : Math.pow(1 + apyDecimal, 1 / n) - 1;

  // Final balance using effective APY formula: A = P * (1 + APY)^t
  const finalBalanceRaw = apyDecimal === 0
    ? principal
    : principal * Math.pow(1 + apyDecimal, normalizedDurationYears);

  // Check for numerical overflow
  if (!isFinite(finalBalanceRaw) || finalBalanceRaw > BOUNDARIES.MAX_CALCULATION_VALUE) {
    throw new Error('Calculation resulted in numerical overflow. Please reduce principal, APY, or duration.');
  }

  // Round values cleanly to 8 decimal places for crypto precision
  const finalBalance = Math.round(finalBalanceRaw * 1e8) / 1e8;
  const totalRewards = Math.round((finalBalanceRaw - principal) * 1e8) / 1e8;

  // Optional projected USD value
  let projectedUsdValue = null;
  if (tokenPrice !== undefined && tokenPrice !== null && tokenPrice > 0) {
    projectedUsdValue = Math.round(finalBalanceRaw * tokenPrice * 1e2) / 1e2;
  }

  // Generate chart data at compounding intervals
  const chartData = [];
  const totalPeriods = n * normalizedDurationYears;
  const floorPeriods = Math.floor(totalPeriods);

  // Initial starting point (Period 0)
  chartData.push({
    period: 0,
    elapsedDays: 0,
    balance: principal,
  });

  // Calculate balance at each compounding period k
  for (let k = 1; k <= floorPeriods; k++) {
    const elapsedDays = (k * 365) / n;
    const balanceAtPeriod = apyDecimal === 0
      ? principal
      : principal * Math.pow(1 + periodicRate, k);

    chartData.push({
      period: k,
      elapsedDays: Math.round(elapsedDays * 1e4) / 1e4,
      balance: Math.round(balanceAtPeriod * 1e8) / 1e8,
    });
  }

  // If duration does not align exactly with a compounding period, add exact final point
  const hasFractionalPeriod = (totalPeriods - floorPeriods) > 1e-7;
  if (hasFractionalPeriod) {
    chartData.push({
      period: Math.round(totalPeriods * 1e4) / 1e4,
      elapsedDays: Math.round(totalDays * 1e4) / 1e4,
      balance: finalBalance,
    });
  } else if (chartData.length > 1) {
    // Ensure last chart point exactly reflects the final balance
    chartData[chartData.length - 1].balance = finalBalance;
    chartData[chartData.length - 1].elapsedDays = Math.round(totalDays * 1e4) / 1e4;
  }

  return {
    principal,
    apy,
    duration,
    durationUnit: normalizedUnit,
    normalizedDurationYears: Math.round(normalizedDurationYears * 1e6) / 1e6,
    compoundingFrequency: normalizedFreq,
    finalBalance,
    totalRewards: Math.max(0, totalRewards),
    tokenPrice: tokenPrice ?? null,
    projectedUsdValue,
    chartData,
  };
}

module.exports = {
  calculateStakingRewards,
  validateInputs,
  COMPOUNDING_FREQUENCIES,
  DURATION_UNITS,
  BOUNDARIES,
};

