import { calculateStakingRewards } from '../../server/services/stakingCalculatorService';

describe('DeFi Staking Rewards Calculator Service', () => {
  // 1. RM1,000 at 5% APY for one year
  test('1. RM1,000 at 5% APY for one year calculates correctly (A = 1050, rewards = 50)', () => {
    const result = calculateStakingRewards({
      principal: 1000,
      apy: 5,
      duration: 1,
      durationUnit: 'years',
      compoundingFrequency: 'annually',
    });

    expect(result.finalBalance).toBe(1050);
    expect(result.totalRewards).toBe(50);
    expect(result.normalizedDurationYears).toBe(1);
    expect(result.chartData.length).toBe(2); // Period 0 and Period 1
  });

  // 2. Daily compounding
  test('2. Daily compounding generates 366 data points for 1 year and yields 1050', () => {
    const result = calculateStakingRewards({
      principal: 1000,
      apy: 5,
      duration: 365,
      durationUnit: 'days',
      compoundingFrequency: 'daily',
    });

    expect(result.finalBalance).toBe(1050);
    expect(result.totalRewards).toBe(50);
    expect(result.chartData.length).toBe(366); // Day 0 through Day 365
    expect(result.chartData[0].balance).toBe(1000);
    expect(result.chartData[365].balance).toBe(1050);
  });

  // 3. Weekly compounding
  test('3. Weekly compounding generates 53 data points for 1 year and yields 1050', () => {
    const result = calculateStakingRewards({
      principal: 1000,
      apy: 5,
      duration: 1,
      durationUnit: 'years',
      compoundingFrequency: 'weekly',
    });

    expect(result.finalBalance).toBe(1050);
    expect(result.totalRewards).toBe(50);
    expect(result.chartData.length).toBe(53); // Week 0 through Week 52
    expect(result.chartData[52].balance).toBe(1050);
  });

  // 4. Monthly compounding
  test('4. Monthly compounding generates 13 data points for 1 year and yields 1050', () => {
    const result = calculateStakingRewards({
      principal: 1000,
      apy: 5,
      duration: 1,
      durationUnit: 'years',
      compoundingFrequency: 'monthly',
    });

    expect(result.finalBalance).toBe(1050);
    expect(result.totalRewards).toBe(50);
    expect(result.chartData.length).toBe(13); // Month 0 through Month 12
    expect(result.chartData[12].balance).toBe(1050);
  });

  // 5. Annual compounding
  test('5. Annual compounding generates 2 data points for 1 year and yields 1050', () => {
    const result = calculateStakingRewards({
      principal: 1000,
      apy: 5,
      duration: 1,
      durationUnit: 'years',
      compoundingFrequency: 'annually',
    });

    expect(result.finalBalance).toBe(1050);
    expect(result.totalRewards).toBe(50);
    expect(result.chartData.length).toBe(2);
    expect(result.chartData[1].balance).toBe(1050);
  });

  // 6. Zero APY
  test('6. Zero APY produces zero rewards and preserves initial principal', () => {
    const result = calculateStakingRewards({
      principal: 5000,
      apy: 0,
      duration: 2,
      durationUnit: 'years',
      compoundingFrequency: 'monthly',
    });

    expect(result.finalBalance).toBe(5000);
    expect(result.totalRewards).toBe(0);
    expect(result.chartData[result.chartData.length - 1].balance).toBe(5000);
  });

  // 7. Fractional duration of 1.5 years
  test('7. Fractional duration of 1.5 years calculates correct balance and includes final fractional point', () => {
    const result = calculateStakingRewards({
      principal: 1000,
      apy: 10,
      duration: 1.5,
      durationUnit: 'years',
      compoundingFrequency: 'annually',
    });

    // 1000 * (1 + 0.10)^1.5 = 1000 * 1.1536897 = 1153.6897
    const expected = Math.round(1000 * Math.pow(1.10, 1.5) * 1e8) / 1e8;
    expect(result.finalBalance).toBe(expected);
    expect(result.chartData[result.chartData.length - 1].period).toBe(1.5);
    expect(result.chartData[result.chartData.length - 1].elapsedDays).toBe(547.5);
    expect(result.chartData[result.chartData.length - 1].balance).toBe(expected);
  });

  // 8. Duration specified in days
  test('8. Duration specified in days converts properly to normalized years', () => {
    const result = calculateStakingRewards({
      principal: 2000,
      apy: 8,
      duration: 730,
      durationUnit: 'days',
      compoundingFrequency: 'daily',
    });

    expect(result.normalizedDurationYears).toBe(2);
    // 2000 * (1 + 0.08)^2 = 2000 * 1.1664 = 2332.80
    expect(result.finalBalance).toBe(2332.8);
    expect(result.totalRewards).toBe(332.8);
  });

  // 9. Very small principal
  test('9. Very small principal (satoshi precision) computes without precision loss', () => {
    const satoshi = 0.00000001;
    const result = calculateStakingRewards({
      principal: satoshi,
      apy: 10,
      duration: 1,
      durationUnit: 'years',
      compoundingFrequency: 'daily',
    });

    expect(result.finalBalance).toBe(0.00000001); // 0.000000011 rounded to 8 decimals
    expect(result.principal).toBe(satoshi);
  });

  // 10. Invalid negative principal
  test('10. Invalid negative principal throws validation error', () => {
    expect(() => {
      calculateStakingRewards({
        principal: -100,
        apy: 5,
        duration: 1,
        durationUnit: 'years',
        compoundingFrequency: 'daily',
      });
    }).toThrow('Principal must be greater than zero.');
  });

  // 11. Invalid negative APY
  test('11. Invalid negative APY throws validation error', () => {
    expect(() => {
      calculateStakingRewards({
        principal: 1000,
        apy: -5,
        duration: 1,
        durationUnit: 'years',
        compoundingFrequency: 'daily',
      });
    }).toThrow('APY must be a non-negative number.');
  });

  // 12. Zero duration
  test('12. Zero duration throws validation error', () => {
    expect(() => {
      calculateStakingRewards({
        principal: 1000,
        apy: 5,
        duration: 0,
        durationUnit: 'years',
        compoundingFrequency: 'daily',
      });
    }).toThrow('Duration must be greater than zero.');
  });

  // 13. Invalid compounding frequency
  test('13. Invalid compounding frequency throws validation error', () => {
    expect(() => {
      calculateStakingRewards({
        principal: 1000,
        apy: 5,
        duration: 1,
        durationUnit: 'years',
        compoundingFrequency: 'hourly' as any,
      });
    }).toThrow(/Compounding frequency must be daily, weekly, monthly, or annually/);
  });

  // 14. Invalid duration unit
  test('14. Invalid duration unit throws validation error', () => {
    expect(() => {
      calculateStakingRewards({
        principal: 1000,
        apy: 5,
        duration: 1,
        durationUnit: 'months' as any,
        compoundingFrequency: 'daily',
      });
    }).toThrow(/Duration unit must be either 'days' or 'years'/);
  });

  // 15. NaN and Infinity
  test('15. NaN and Infinity inputs throw validation errors', () => {
    expect(() => {
      calculateStakingRewards({
        principal: NaN,
        apy: 5,
        duration: 1,
        durationUnit: 'years',
        compoundingFrequency: 'daily',
      });
    }).toThrow('Principal must be a valid finite number.');

    expect(() => {
      calculateStakingRewards({
        principal: 1000,
        apy: Infinity,
        duration: 1,
        durationUnit: 'years',
        compoundingFrequency: 'daily',
      });
    }).toThrow('APY must be a valid finite number.');

    expect(() => {
      calculateStakingRewards({
        principal: 1000,
        apy: 5,
        duration: Infinity,
        durationUnit: 'years',
        compoundingFrequency: 'daily',
      });
    }).toThrow('Duration must be a valid finite number.');
  });

  // 16. Numerical overflow protection
  test('16. Numerical overflow protection prevents calculation with astronomical values', () => {
    expect(() => {
      calculateStakingRewards({
        principal: 1e12,
        apy: 100000,
        duration: 100,
        durationUnit: 'years',
        compoundingFrequency: 'daily',
      });
    }).toThrow('Calculation resulted in numerical overflow. Please reduce principal, APY, or duration.');
  });

  // 17. Equivalent final results across compounding frequencies for effective APY
  test('17. Produces equivalent final results across all compounding frequencies for effective APY', () => {
    const daily = calculateStakingRewards({
      principal: 1000,
      apy: 5,
      duration: 2,
      durationUnit: 'years',
      compoundingFrequency: 'daily',
    });

    const weekly = calculateStakingRewards({
      principal: 1000,
      apy: 5,
      duration: 2,
      durationUnit: 'years',
      compoundingFrequency: 'weekly',
    });

    const monthly = calculateStakingRewards({
      principal: 1000,
      apy: 5,
      duration: 2,
      durationUnit: 'years',
      compoundingFrequency: 'monthly',
    });

    const annually = calculateStakingRewards({
      principal: 1000,
      apy: 5,
      duration: 2,
      durationUnit: 'years',
      compoundingFrequency: 'annually',
    });

    // 1000 * 1.05^2 = 1102.5
    expect(daily.finalBalance).toBe(1102.5);
    expect(weekly.finalBalance).toBe(1102.5);
    expect(monthly.finalBalance).toBe(1102.5);
    expect(annually.finalBalance).toBe(1102.5);

    expect(daily.totalRewards).toBe(102.5);
    expect(weekly.totalRewards).toBe(102.5);
    expect(monthly.totalRewards).toBe(102.5);
    expect(annually.totalRewards).toBe(102.5);
  });

  // Optional token price
  test('Calculates projected USD value when token price is provided', () => {
    const result = calculateStakingRewards({
      principal: 1000,
      apy: 5,
      duration: 1,
      durationUnit: 'years',
      compoundingFrequency: 'annually',
      tokenPrice: 2.5,
    });

    expect(result.tokenPrice).toBe(2.5);
    // 1050 * 2.5 = 2625
    expect(result.projectedUsdValue).toBe(2625);
  });
});
