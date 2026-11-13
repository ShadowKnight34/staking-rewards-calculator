import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StakingCalculator from '../views/dashboard/StakingCalculator/StakingCalculator';
import * as apiModule from '../api/stakingCalculator';

// Mock the API module
jest.mock('../api/stakingCalculator');

const mockApiResponse = {
  success: true,
  data: {
    principal: 1000,
    apy: 5,
    duration: 365,
    durationUnit: 'days' as const,
    normalizedDurationYears: 1,
    compoundingFrequency: 'daily' as const,
    finalBalance: 1050,
    totalRewards: 50,
    tokenPrice: 1,
    projectedUsdValue: 1050,
    chartData: [
      { period: 0, elapsedDays: 0, balance: 1000 },
      { period: 1, elapsedDays: 1, balance: 1000.133 },
      { period: 365, elapsedDays: 365, balance: 1050 },
    ],
  },
};

describe('StakingCalculator React Component', () => {
  beforeEach(() => {
    (apiModule.calculateRewardsApi as jest.Mock).mockResolvedValue(mockApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders header, input fields and action buttons', async () => {
    render(<StakingCalculator />);

    expect(screen.getByText(/DeFi Staking Rewards Calculator/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Principal Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Effective APY/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Staking Duration/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Calculate Rewards/i)).toBeInTheDocument();
    });
  });

  test('calls API on initial mount and displays summary projections', async () => {
    render(<StakingCalculator />);

    await waitFor(() => {
      expect(apiModule.calculateRewardsApi).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText(/PROJECTED FINAL BALANCE/i)).toBeInTheDocument();
      expect(screen.getByText(/TOTAL REWARDS EARNED/i)).toBeInTheDocument();
    });
  });

  test('validates invalid negative input and displays error message', async () => {
    render(<StakingCalculator />);

    await waitFor(() => {
      expect(screen.getByText(/Calculate Rewards/i)).toBeInTheDocument();
    });

    const principalInput = screen.getByLabelText(/Principal Amount/i);
    fireEvent.change(principalInput, { target: { value: '-500' } });

    const calculateBtn = screen.getByText(/Calculate Rewards/i);
    fireEvent.click(calculateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Principal must be greater than zero/i)).toBeInTheDocument();
    });
  });

  test('handles API error state gracefully', async () => {
    (apiModule.calculateRewardsApi as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'Calculation failed due to server error.',
    });

    render(<StakingCalculator />);

    await waitFor(() => {
      expect(screen.getByText(/Calculation failed due to server error/i)).toBeInTheDocument();
    });
  });
});
