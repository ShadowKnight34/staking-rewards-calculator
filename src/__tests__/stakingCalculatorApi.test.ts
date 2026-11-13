const express = require('express');
const { calculateRewards } = require('../../server/controllers/stakingCalculatorController');
const { validateCalculateRewards } = require('../../server/validators/stakingCalculatorValidator');
const errorHandler = require('../../server/middleware/errorHandler');

describe('POST /api/calculate-rewards API Endpoints & Controller', () => {
  let mockReq: any;
  let mockRes: any;
  let nextFn: any;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      headersSent: false,
    };
    nextFn = jest.fn();
  });

  // Successful calculation
  test('Successful calculation returns HTTP 200 with structured calculation data', () => {
    mockReq.body = {
      principal: 1000,
      apy: 5,
      duration: 365,
      durationUnit: 'days',
      compoundingFrequency: 'daily',
      tokenPrice: 1,
    };

    // Run validator then controller
    validateCalculateRewards(mockReq, mockRes, () => {
      calculateRewards(mockReq, mockRes, nextFn);
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          principal: 1000,
          apy: 5,
          duration: 365,
          durationUnit: 'days',
          normalizedDurationYears: 1,
          compoundingFrequency: 'daily',
          finalBalance: 1050,
          totalRewards: 50,
          tokenPrice: 1,
          projectedUsdValue: 1050,
          chartData: expect.any(Array),
        }),
      })
    );
    expect(mockRes.json.mock.calls[0][0].data.chartData.length).toBe(366);
  });

  // Invalid request (negative numbers, out-of-range APY, bad enum)
  test('Invalid request with negative principal returns HTTP 400 with descriptive error', () => {
    mockReq.body = {
      principal: -500,
      apy: 5,
      duration: 365,
      durationUnit: 'days',
      compoundingFrequency: 'daily',
    };

    validateCalculateRewards(mockReq, mockRes, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Field "principal" must be greater than zero'),
      })
    );
    expect(nextFn).not.toHaveBeenCalled();
  });

  test('Invalid compounding frequency returns HTTP 400', () => {
    mockReq.body = {
      principal: 1000,
      apy: 5,
      duration: 1,
      durationUnit: 'years',
      compoundingFrequency: 'bi-weekly',
    };

    validateCalculateRewards(mockReq, mockRes, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('must be "daily", "weekly", "monthly", or "annually"'),
      })
    );
  });

  test('Invalid duration unit returns HTTP 400', () => {
    mockReq.body = {
      principal: 1000,
      apy: 5,
      duration: 1,
      durationUnit: 'decades',
      compoundingFrequency: 'daily',
    };

    validateCalculateRewards(mockReq, mockRes, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('must be either "days" or "years"'),
      })
    );
  });

  // Missing fields
  test('Missing required fields returns HTTP 400 listing missing parameters', () => {
    mockReq.body = {};

    validateCalculateRewards(mockReq, mockRes, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          'Field "principal" is required.',
          'Field "apy" is required.',
          'Field "duration" is required.',
          'Field "durationUnit" is required and must be a string.',
          'Field "compoundingFrequency" is required and must be a string.',
        ]),
      })
    );
  });

  // Unexpected errors
  test('Unexpected errors are safely caught by centralized errorHandler without crashing server', () => {
    const errorMock = new Error('Database connection failed unexpectedly');
    const errReq: any = { method: 'POST', originalUrl: '/api/calculate-rewards' };
    const errRes: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      headersSent: false,
    };
    const errNext = jest.fn();

    // Suppress console.error in test output for clean reports
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(errorMock, errReq, errRes, errNext);

    expect(errRes.status).toHaveBeenCalledWith(500);
    expect(errRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Database connection failed unexpectedly',
      })
    );

    consoleSpy.mockRestore();
  });
});
