const { calculateStakingRewards } = require('../services/stakingCalculatorService');

/**
 * Controller for POST /api/calculate-rewards
 */
function calculateRewards(req, res, next) {
  try {
    const { principal, apy, duration, durationUnit, compoundingFrequency, tokenPrice } = req.body;

    const result = calculateStakingRewards({
      principal: Number(principal),
      apy: Number(apy),
      duration: Number(duration),
      durationUnit,
      compoundingFrequency,
      tokenPrice: tokenPrice !== undefined && tokenPrice !== null ? Number(tokenPrice) : undefined,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // If the calculation engine threw a domain validation or overflow error, map to 400
    if (
      error.message.includes('must be') ||
      error.message.includes('cannot exceed') ||
      error.message.includes('overflow')
    ) {
      error.statusCode = 400;
    }
    return next(error);
  }
}

module.exports = {
  calculateRewards,
};
