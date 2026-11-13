const express = require('express');
const router = express.Router();
const { calculateRewards } = require('../../controllers/stakingCalculatorController');
const { validateCalculateRewards } = require('../../validators/stakingCalculatorValidator');

/**
 * @route   POST /api/calculate-rewards
 * @desc    Calculate DeFi staking rewards, projected balances, and chart time-series data
 * @access  Public
 */
router.post('/calculate-rewards', validateCalculateRewards, calculateRewards);

module.exports = router;

