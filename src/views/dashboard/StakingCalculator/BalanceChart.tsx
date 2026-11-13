import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartPoint } from './types';

interface BalanceChartProps {
  chartData: ChartPoint[];
  principal: number;
  tokenPrice: number | null;
  compoundingFrequency: string;
  durationUnit: string;
}

const formatNumber = (val: number, maxDecimals: number = 4) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  }).format(val);
};

const CustomTooltip = ({ active, payload, label, principal, tokenPrice, compoundingFrequency }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload as ChartPoint;
    const balance = point.balance;
    const rewards = Math.max(0, balance - principal);
    const usdValue = tokenPrice ? balance * tokenPrice : null;

    return (
      <Paper
        elevation={4}
        sx={{
          backgroundColor: '#173039',
          color: '#ffffff',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #00dbe3',
          boxShadow: '0 4px 20px rgba(0, 219, 227, 0.25)',
        }}
      >
        <Typography variant="caption" sx={{ color: '#00dbe3', fontWeight: 600, display: 'block' }}>
          {compoundingFrequency.toUpperCase()} INTERVAL • Day {point.elapsedDays}
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Balance: <span style={{ color: '#00dbe3' }}>{formatNumber(balance, 6)}</span> tokens
          </Typography>
          <Typography variant="body2" sx={{ color: '#a0e4ea' }}>
            Rewards Earned: +{formatNumber(rewards, 6)}
          </Typography>
          {usdValue !== null && (
            <Typography variant="body2" sx={{ color: '#9FF1D2', fontWeight: 500 }}>
              USD Value: ${formatNumber(usdValue, 2)}
            </Typography>
          )}
        </Box>
      </Paper>
    );
  }
  return null;
};

const BalanceChart: React.FC<BalanceChartProps> = ({
  chartData,
  principal,
  tokenPrice,
  compoundingFrequency,
  durationUnit,
}) => {
  const theme = useTheme();

  if (!chartData || chartData.length === 0) {
    return (
      <Box
        sx={{
          height: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fbfb',
          borderRadius: '8px',
          border: '1px dashed #00dbe3',
        }}
      >
        <Typography sx={{ color: '#668087' }}>No chart data available. Calculate rewards to view growth projection.</Typography>
      </Box>
    );
  }

  // Determine tick interval for XAxis if dataset is dense
  const totalPoints = chartData.length;
  const tickInterval = totalPoints > 30 ? Math.floor(totalPoints / 6) : 0;

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#173039' }}>
          Projected Staking Balance Trajectory
        </Typography>
        <Typography variant="caption" sx={{ color: '#23a2bb', fontWeight: 600 }}>
          {totalPoints} data points ({compoundingFrequency} compounding)
        </Typography>
      </Box>
      <Box sx={{ width: '100%', height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00dbe3" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00dbe3" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f0f2" />
            <XAxis
              dataKey="elapsedDays"
              tick={{ fill: '#173039', fontSize: 12 }}
              interval={tickInterval}
              tickFormatter={(days) => `Day ${Math.round(days)}`}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: '#173039', fontSize: 12 }}
              tickFormatter={(val) => formatNumber(val, 2)}
            />
            <Tooltip
              content={
                <CustomTooltip
                  principal={principal}
                  tokenPrice={tokenPrice}
                  compoundingFrequency={compoundingFrequency}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#00b4c9"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#balanceGradient)"
              activeDot={{ r: 6, fill: '#00dbe3', stroke: '#173039', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default BalanceChart;

