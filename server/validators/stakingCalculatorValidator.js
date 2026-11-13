const { BOUNDARIES, COMPOUNDING_FREQUENCIES, DURATION_UNITS } = require('../services/stakingCalculatorService');

/**
 * Validates the POST /api/calculate-rewards request payload.
 * Returns HTTP 400 with structured error details if validation fails.
 */
function validateCalculateRewards(req, res, next) {
  const { principal, apy, duration, durationUnit, compoundingFrequency, tokenPrice } = req.body || {};
  const errors = [];

  // Check required fields presence
  if (principal === undefined || principal === null) {
    errors.push('Field "principal" is required.');
  } else if (typeof principal !== 'number' || isNaN(principal) || !isFinite(principal)) {
    errors.push('Field "principal" must be a valid finite number.');
  } else if (principal <= 0) {
    errors.push('Field "principal" must be greater than zero.');
  } else if (principal < BOUNDARIES.MIN_PRINCIPAL || principal > BOUNDARIES.MAX_PRINCIPAL) {
    errors.push(`Field "principal" must be between ${BOUNDARIES.MIN_PRINCIPAL} and ${BOUNDARIES.MAX_PRINCIPAL}.`);
  }

  if (apy === undefined || apy === null) {
    errors.push('Field "apy" is required.');
  } else if (typeof apy !== 'number' || isNaN(apy) || !isFinite(apy)) {
    errors.push('Field "apy" must be a valid finite number.');
  } else if (apy < 0) {
    errors.push('Field "apy" must be non-negative.');
  } else if (apy > BOUNDARIES.MAX_APY) {
    errors.push(`Field "apy" cannot exceed ${BOUNDARIES.MAX_APY}%.`);
  }

  if (duration === undefined || duration === null) {
    errors.push('Field "duration" is required.');
  } else if (typeof duration !== 'number' || isNaN(duration) || !isFinite(duration)) {
    errors.push('Field "duration" must be a valid finite number.');
  } else if (duration <= 0) {
    errors.push('Field "duration" must be greater than zero.');
  }

  if (!durationUnit || typeof durationUnit !== 'string') {
    errors.push('Field "durationUnit" is required and must be a string.');
  } else if (!DURATION_UNITS[durationUnit.toLowerCase()]) {
    errors.push('Field "durationUnit" must be either "days" or "years".');
  } else if (typeof duration === 'number' && isFinite(duration)) {
    const maxDuration = durationUnit.toLowerCase() === 'days' ? BOUNDARIES.MAX_DURATION_DAYS : BOUNDARIES.MAX_DURATION_YEARS;
    if (duration > maxDuration) {
      errors.push(`Field "duration" cannot exceed ${maxDuration} ${durationUnit.toLowerCase()}.`);
    }
  }

  if (!compoundingFrequency || typeof compoundingFrequency !== 'string') {
    errors.push('Field "compoundingFrequency" is required and must be a string.');
  } else if (!COMPOUNDING_FREQUENCIES[compoundingFrequency.toLowerCase()]) {
    errors.push('Field "compoundingFrequency" must be "daily", "weekly", "monthly", or "annually".');
  }

  if (tokenPrice !== undefined && tokenPrice !== null) {
    if (typeof tokenPrice !== 'number' || isNaN(tokenPrice) || !isFinite(tokenPrice)) {
      errors.push('Field "tokenPrice" must be a valid finite number when provided.');
    } else if (tokenPrice <= 0) {
      errors.push('Field "tokenPrice" must be greater than zero when provided.');
    } else if (tokenPrice < BOUNDARIES.MIN_TOKEN_PRICE || tokenPrice > BOUNDARIES.MAX_TOKEN_PRICE) {
      errors.push(`Field "tokenPrice" must be between ${BOUNDARIES.MIN_TOKEN_PRICE} and ${BOUNDARIES.MAX_TOKEN_PRICE}.`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors[0],
      errors,
    });
  }

  next();
}

module.exports = {
  validateCalculateRewards,
};

