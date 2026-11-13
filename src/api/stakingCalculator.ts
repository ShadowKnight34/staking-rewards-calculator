import api from '../utils/api';
import { StakingCalculationRequest, StakingApiResponse } from '../views/dashboard/StakingCalculator/types';

/**
 * Calculates staking rewards via the Express backend API
 * POST /api/calculate-rewards
 */
export const calculateRewardsApi = async (
  payload: StakingCalculationRequest
): Promise<StakingApiResponse> => {
  try {
    const response = await api.post('/api/calculate-rewards', payload);
    return response;
  } catch (err: any) {
    if (err && typeof err === 'object') {
      return {
        success: false,
        error: err.error || err.message || 'Failed to calculate staking rewards.',
        errors: err.errors,
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred while communicating with the server.',
    };
  }
};

