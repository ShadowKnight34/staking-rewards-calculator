import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { calculateRewardsApi } from '../../../api/stakingCalculator';
import CalculatorForm from './CalculatorForm';
import ResultsSummary from './ResultsSummary';
import BalanceChart from './BalanceChart';
import { StakingCalculationData, StakingFormInputs } from './types';

const defaultInputs: StakingFormInputs = {
  principal: '1000',
  apy: '5',
  duration: '365',
  durationUnit: 'days',
  compoundingFrequency: 'daily',
  tokenPrice: '1',
};

const StakingCalculator: React.FC = () => {
  const [calculationData, setCalculationData] = useState<StakingCalculationData | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const performCalculation = async (inputs: StakingFormInputs) => {
    setStatus('loading');
    setErrorMessage(null);

    const payload = {
      principal: parseFloat(inputs.principal),
      apy: parseFloat(inputs.apy),
      duration: parseFloat(inputs.duration),
      durationUnit: inputs.durationUnit,
      compoundingFrequency: inputs.compoundingFrequency,
      tokenPrice: inputs.tokenPrice && inputs.tokenPrice.trim() !== '' ? parseFloat(inputs.tokenPrice) : undefined,
    };

    const res = await calculateRewardsApi(payload);

    if (res.success && res.data) {
      setCalculationData(res.data);
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage(res.error || 'Failed to calculate rewards. Please check your inputs.');
    }
  };

  // Perform initial calculation on component mount with sensible defaults
  useEffect(() => {
    performCalculation(defaultInputs);
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #173039 0%, #00b4c9 100%)',
          color: '#ffffff',
          padding: { xs: '24px 20px', md: '32px 40px' },
          borderRadius: '8px',
          mb: 3,
          boxShadow: '0 4px 20px rgba(0, 180, 201, 0.15)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <AccountBalanceIcon sx={{ fontSize: '32px', color: '#00dbe3' }} />
          <Typography
            sx={{
              fontSize: { xs: '24px', md: '28px' },
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            DeFi Staking Rewards Calculator
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: '15px',
            color: '#e0f7fa',
            maxWidth: '900px',
            lineHeight: 1.5,
          }}
        >
          Project your compound yield trajectory based on mathematically consistent Effective APY.
          Analyze how daily, weekly, monthly, and annual compounding frequencies shape your token growth.
        </Typography>
      </Paper>

      {/* Error Feedback */}
      {status === 'error' && errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
          {errorMessage}
        </Alert>
      )}

      {/* Input Configuration Card */}
      <Card
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #c7f2f5',
          p: { xs: 2, md: 3 },
          mb: 3,
        }}
      >
        <CardContent sx={{ p: '0 !important' }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#173039', mb: 2 }}>
            Staking Parameters
          </Typography>
          <CalculatorForm
            initialValues={defaultInputs}
            onSubmit={performCalculation}
            isLoading={status === 'loading'}
          />
        </CardContent>
      </Card>

      {/* Loading Indicator */}
      {status === 'loading' && !calculationData && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#00dbe3' }} />
        </Box>
      )}

      {/* Calculation Results & Trajectory Chart */}
      {calculationData && (
        <Card
          elevation={0}
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #c7f2f5',
            p: { xs: 2, md: 3 },
          }}
        >
          <CardContent sx={{ p: '0 !important' }}>
            <ResultsSummary data={calculationData} />
            <Divider sx={{ my: 3, borderColor: '#e0f0f2' }} />
            <BalanceChart
              chartData={calculationData.chartData}
              principal={calculationData.principal}
              tokenPrice={calculationData.tokenPrice}
              compoundingFrequency={calculationData.compoundingFrequency}
              durationUnit={calculationData.durationUnit}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StakingCalculator;

