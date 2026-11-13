import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { CompoundingFrequency, DurationUnit, StakingFormInputs } from './types';

interface CalculatorFormProps {
  initialValues: StakingFormInputs;
  onSubmit: (inputs: StakingFormInputs) => void;
  isLoading: boolean;
}

interface ValidationErrors {
  principal?: string;
  apy?: string;
  duration?: string;
  tokenPrice?: string;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
}) => {
  const [inputs, setInputs] = useState<StakingFormInputs>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = (currentInputs: StakingFormInputs): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate principal
    const principalNum = parseFloat(currentInputs.principal);
    if (!currentInputs.principal || isNaN(principalNum)) {
      newErrors.principal = 'Please enter a valid principal amount.';
    } else if (principalNum <= 0) {
      newErrors.principal = 'Principal must be greater than zero.';
    } else if (principalNum > 1e12) {
      newErrors.principal = 'Principal exceeds maximum allowed limit (1 Trillion).';
    }

    // Validate APY
    const apyNum = parseFloat(currentInputs.apy);
    if (currentInputs.apy === '' || isNaN(apyNum)) {
      newErrors.apy = 'Please enter a valid APY percentage.';
    } else if (apyNum < 0) {
      newErrors.apy = 'APY cannot be negative.';
    } else if (apyNum > 100000) {
      newErrors.apy = 'APY cannot exceed 100,000%.';
    }

    // Validate duration
    const durationNum = parseFloat(currentInputs.duration);
    if (!currentInputs.duration || isNaN(durationNum)) {
      newErrors.duration = 'Please enter a valid staking duration.';
    } else if (durationNum <= 0) {
      newErrors.duration = 'Duration must be greater than zero.';
    } else {
      const maxDuration = currentInputs.durationUnit === 'days' ? 36500 : 100;
      if (durationNum > maxDuration) {
        newErrors.duration = `Duration cannot exceed ${maxDuration} ${currentInputs.durationUnit}.`;
      }
    }

    // Validate optional token price
    if (currentInputs.tokenPrice && currentInputs.tokenPrice.trim() !== '') {
      const priceNum = parseFloat(currentInputs.tokenPrice);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.tokenPrice = 'Token price must be a positive number.';
      } else if (priceNum > 1e9) {
        newErrors.tokenPrice = 'Token price exceeds maximum limit ($1B).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof StakingFormInputs, value: any) => {
    const updated = { ...inputs, [field]: value };
    setInputs(updated);
    // Real-time error clearance
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate(inputs)) {
      onSubmit(inputs);
    }
  };

  const handleQuickDuration = (amount: number, unit: DurationUnit) => {
    const updated: StakingFormInputs = {
      ...inputs,
      duration: String(amount),
      durationUnit: unit,
    };
    setInputs(updated);
    if (validate(updated)) {
      onSubmit(updated);
    }
  };

  const handleReset = () => {
    setInputs(initialValues);
    setErrors({});
    onSubmit(initialValues);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Grid container spacing={2.5}>
        {/* Principal Input */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Principal Amount"
            value={inputs.principal}
            onChange={(e) => handleInputChange('principal', e.target.value)}
            error={Boolean(errors.principal)}
            helperText={errors.principal || 'Initial token amount to deposit'}
            type="number"
            inputProps={{ min: '0', step: 'any' }}
            InputProps={{
              endAdornment: <InputAdornment position="end">tokens</InputAdornment>,
            }}
          />
        </Grid>

        {/* APY Input */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Effective APY (%)"
            value={inputs.apy}
            onChange={(e) => handleInputChange('apy', e.target.value)}
            error={Boolean(errors.apy)}
            helperText={errors.apy || 'Effective Annual Percentage Yield (e.g. 5 for 5%)'}
            type="number"
            inputProps={{ min: '0', max: '100000', step: 'any' }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Grid>

        {/* Duration Input & Unit Toggle */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              sx={{ flexGrow: 1 }}
              label="Staking Duration"
              value={inputs.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              error={Boolean(errors.duration)}
              helperText={errors.duration || `Duration in ${inputs.durationUnit}`}
              type="number"
              inputProps={{ min: '0', step: 'any' }}
            />
            <ToggleButtonGroup
              value={inputs.durationUnit}
              exclusive
              onChange={(_, newUnit: DurationUnit) => {
                if (newUnit) handleInputChange('durationUnit', newUnit);
              }}
              sx={{ height: 56 }}
            >
              <ToggleButton
                value="days"
                sx={{
                  fontWeight: 600,
                  '&.Mui-selected': { backgroundColor: '#00dbe3', color: '#173039' },
                }}
              >
                Days
              </ToggleButton>
              <ToggleButton
                value="years"
                sx={{
                  fontWeight: 600,
                  '&.Mui-selected': { backgroundColor: '#00dbe3', color: '#173039' },
                }}
              >
                Years
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grid>

        {/* Compounding Frequency Selector */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="compounding-frequency-label">Compounding Frequency</InputLabel>
            <Select
              labelId="compounding-frequency-label"
              value={inputs.compoundingFrequency}
              label="Compounding Frequency"
              onChange={(e) => handleInputChange('compoundingFrequency', e.target.value as CompoundingFrequency)}
            >
              <MenuItem value="daily">Daily (365 periods/year)</MenuItem>
              <MenuItem value="weekly">Weekly (52 periods/year)</MenuItem>
              <MenuItem value="monthly">Monthly (12 periods/year)</MenuItem>
              <MenuItem value="annually">Annually (1 period/year)</MenuItem>
            </Select>
            <FormHelperText>Interval at which equivalent periodic yield compounds</FormHelperText>
          </FormControl>
        </Grid>

        {/* Optional Token Price (USD) */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Token Price in USD (Optional)"
            value={inputs.tokenPrice}
            onChange={(e) => handleInputChange('tokenPrice', e.target.value)}
            error={Boolean(errors.tokenPrice)}
            helperText={errors.tokenPrice || 'Current USD value per token for fiat estimates'}
            type="number"
            inputProps={{ min: '0', step: 'any' }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>

        {/* Quick Duration Shortcuts */}
        <Grid item xs={12} sm={6}>
          <Typography variant="caption" sx={{ color: '#173039', fontWeight: 600, display: 'block', mb: 0.5 }}>
            Quick Duration Shortcuts:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickDuration(30, 'days')}
              sx={{ borderColor: '#23a2bb', color: '#173039', textTransform: 'none' }}
            >
              30 Days
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickDuration(90, 'days')}
              sx={{ borderColor: '#23a2bb', color: '#173039', textTransform: 'none' }}
            >
              90 Days
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickDuration(180, 'days')}
              sx={{ borderColor: '#23a2bb', color: '#173039', textTransform: 'none' }}
            >
              180 Days
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickDuration(1, 'years')}
              sx={{ borderColor: '#23a2bb', color: '#173039', textTransform: 'none' }}
            >
              1 Year
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickDuration(2, 'years')}
              sx={{ borderColor: '#23a2bb', color: '#173039', textTransform: 'none' }}
            >
              2 Years
            </Button>
          </Box>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
              sx={{
                backgroundColor: '#00dbe3',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '16px',
                height: '48px',
                px: 4,
                '&:hover': { backgroundColor: '#00b4c9' },
              }}
            >
              {isLoading ? 'Calculating...' : 'Calculate Rewards'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={isLoading}
              startIcon={<RestartAltIcon />}
              sx={{
                borderColor: '#173039',
                color: '#173039',
                fontWeight: 600,
                height: '48px',
                px: 3,
                '&:hover': { borderColor: '#00b4c9', color: '#00b4c9' },
              }}
            >
              Reset Defaults
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CalculatorForm;

