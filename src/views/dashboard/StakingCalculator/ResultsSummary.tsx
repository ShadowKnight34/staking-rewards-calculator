import React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PercentIcon from '@mui/icons-material/Percent';
import SavingsIcon from '@mui/icons-material/Savings';
import { StakingCalculationData } from './types';

interface ResultsSummaryProps {
  data: StakingCalculationData;
}

const formatCrypto = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(val);
};

const formatUSD = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const ResultsSummary: React.FC<ResultsSummaryProps> = ({ data }) => {
  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#173039', mb: 2 }}>
        Calculation Summary & Projections
      </Typography>
      <Grid container spacing={2}>
        {/* Projected Final Balance */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #173039 0%, #00b4c9 100%)',
              color: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #00dbe3',
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountBalanceWalletIcon sx={{ color: '#00dbe3' }} />
                <Typography variant="caption" sx={{ color: '#e0f7fa', fontWeight: 600, letterSpacing: '0.5px' }}>
                  PROJECTED FINAL BALANCE
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '26px', fontWeight: 800, lineHeight: 1.2 }}>
                {formatCrypto(data.finalBalance)} <span style={{ fontSize: '14px', fontWeight: 500 }}>tokens</span>
              </Typography>
              {data.projectedUsdValue !== null && (
                <Typography variant="body2" sx={{ color: '#9FF1D2', mt: 1, fontWeight: 600 }}>
                  ≈ {formatUSD(data.projectedUsdValue)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Total Rewards Earned */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #00b4c9 0%, #00dbe3 100%)',
              color: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #23a2bb',
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ShowChartIcon sx={{ color: '#173039' }} />
                <Typography variant="caption" sx={{ color: '#173039', fontWeight: 700, letterSpacing: '0.5px' }}>
                  TOTAL REWARDS EARNED
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '26px', fontWeight: 800, color: '#173039', lineHeight: 1.2 }}>
                +{formatCrypto(data.totalRewards)} <span style={{ fontSize: '14px', fontWeight: 600 }}>tokens</span>
              </Typography>
              {data.tokenPrice && (
                <Typography variant="body2" sx={{ color: '#0a4249', mt: 1, fontWeight: 700 }}>
                  ≈ {formatUSD(data.totalRewards * data.tokenPrice)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Initial Principal */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={0}
            sx={{
              backgroundColor: '#f8fdfd',
              borderRadius: '8px',
              border: '1px solid #c7f2f5',
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SavingsIcon sx={{ color: '#23a2bb' }} />
                <Typography variant="caption" sx={{ color: '#668087', fontWeight: 600 }}>
                  INITIAL PRINCIPAL
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#173039' }}>
                {formatCrypto(data.principal)} <span style={{ fontSize: '13px', fontWeight: 500 }}>tokens</span>
              </Typography>
              {data.tokenPrice && (
                <Typography variant="body2" sx={{ color: '#668087', mt: 0.5 }}>
                  Cost basis: {formatUSD(data.principal * data.tokenPrice)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Effective APY */}
        <Grid item xs={12} sm={4} md={4}>
          <Card
            elevation={0}
            sx={{
              backgroundColor: '#f8fdfd',
              borderRadius: '8px',
              border: '1px solid #c7f2f5',
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PercentIcon sx={{ color: '#23a2bb' }} />
                <Typography variant="caption" sx={{ color: '#668087', fontWeight: 600 }}>
                  EFFECTIVE APY
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#173039' }}>
                {data.apy.toLocaleString('en-US', { maximumFractionDigits: 2 })}%
              </Typography>
              <Typography variant="caption" sx={{ color: '#23a2bb', fontWeight: 600 }}>
                Compounding: {data.compoundingFrequency}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Staking Duration */}
        <Grid item xs={12} sm={4} md={4}>
          <Card
            elevation={0}
            sx={{
              backgroundColor: '#f8fdfd',
              borderRadius: '8px',
              border: '1px solid #c7f2f5',
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTimeIcon sx={{ color: '#23a2bb' }} />
                <Typography variant="caption" sx={{ color: '#668087', fontWeight: 600 }}>
                  DURATION
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#173039' }}>
                {data.duration} {data.durationUnit}
              </Typography>
              <Typography variant="caption" sx={{ color: '#668087' }}>
                ≈ {data.normalizedDurationYears} year{data.normalizedDurationYears === 1 ? '' : 's'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Token Valuation */}
        <Grid item xs={12} sm={4} md={4}>
          <Card
            elevation={0}
            sx={{
              backgroundColor: '#f8fdfd',
              borderRadius: '8px',
              border: '1px solid #c7f2f5',
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MonetizationOnIcon sx={{ color: '#23a2bb' }} />
                <Typography variant="caption" sx={{ color: '#668087', fontWeight: 600 }}>
                  TOKEN PRICE (USD)
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#173039' }}>
                {data.tokenPrice ? formatUSD(data.tokenPrice) : 'N/A'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#668087' }}>
                {data.tokenPrice ? 'Live conversion active' : 'No price specified'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResultsSummary;
