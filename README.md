# BitBucket Trading Demo — DeFi Staking Rewards Calculator

A full-stack DeFi Staking Rewards Calculator integrated into the existing BitBucket Trading Demo dashboard. Built as a Senior Full-Stack Engineering take-home assessment.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Installation](#installation)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [API Endpoint Documentation](#api-endpoint-documentation)
7. [Mathematical Assumptions](#mathematical-assumptions)
8. [Compounding Frequency Explanation](#compounding-frequency-explanation)
9. [Complexity Analysis](#complexity-analysis)
10. [Testing](#testing)
11. [Architectural Decisions and Trade-offs](#architectural-decisions-and-trade-offs)
12. [Known Limitations](#known-limitations)

---

## Project Overview

This project extends an existing React/TypeScript/MUI dashboard with a complete **DeFi Staking Rewards Calculator** feature. The calculator allows users to:

- Input a principal amount, APY percentage, staking duration, compounding frequency, and optional token price.
- Receive mathematically accurate projections of final balance, total rewards earned, and effective APY.
- Visualise portfolio growth over time via an interactive area chart powered by Recharts.

The calculator is integrated natively into the existing dashboard — it feels like a first-class feature of the product, not a bolted-on tool.

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | 4.9.x | Static typing |
| Material UI (MUI) | 5.x | Design system and component library |
| React Router | 6.x | Client-side routing |
| Redux Toolkit | Latest | Global state management |
| Axios | Latest | HTTP client |
| Recharts | 2.x | Interactive balance growth chart |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 16+ | JavaScript runtime |
| Express.js | 4.x | HTTP server and routing |
| CommonJS | — | Module system (existing project convention) |

### Testing
| Technology | Purpose |
|---|---|
| Jest | Test runner |
| React Testing Library | Component tests |
| Supertest | HTTP integration tests (API layer) |

---

## Installation

### Prerequisites

- **Node.js 16+** installed
- **npm** installed

### Steps

```bash
# 1. Navigate to the assignment directory
cd assignment

# 2. Install all dependencies
npm install --legacy-peer-deps
```

> **Note:** The `--legacy-peer-deps` flag is required due to peer dependency resolution conflicts between MUI, React 18, and older packages in the existing project.

---

## Environment Configuration

No `.env` file is required for local development. The frontend defaults to `http://localhost:5025` for API calls.

To override the API base URL, create a `.env` file in the `assignment/` directory:

```
REACT_APP_API_URL=http://localhost:5025
```

This is read by `src/config/config.ts` at build time.

---

## Running the Application

### Backend Only (port 5025)

```bash
cd assignment
npm run server
```

The Express server starts at `http://localhost:5025`.

### Frontend Only (port 3000)

```bash
cd assignment
npm run client
```

The React development server starts at `http://localhost:3000`.

### Both Concurrently (recommended)

```bash
cd assignment
npm start
```

This uses `concurrently` to start both the backend and frontend in a single terminal.

---

## API Endpoint Documentation

### `POST /api/calculate-rewards`

Calculates staking rewards for a given principal, APY, duration, and compounding frequency.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "principal": 1000,
  "apy": 5,
  "duration": 365,
  "durationUnit": "days",
  "compoundingFrequency": "daily",
  "tokenPrice": 1
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `principal` | `number` | Yes | Initial staking amount. Must be positive. Max: 1,000,000,000,000 |
| `apy` | `number` | Yes | Effective Annual Percentage Yield **as a percentage** (e.g. `5` = 5%). Min: 0. Max: 100,000 |
| `duration` | `number` | Yes | Staking duration. Must be positive. Max: 36,500 days or 100 years |
| `durationUnit` | `string` | Yes | `"days"` or `"years"` |
| `compoundingFrequency` | `string` | Yes | `"daily"`, `"weekly"`, `"monthly"`, or `"annually"` |
| `tokenPrice` | `number` | No | Token price in USD. Must be positive if provided |

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "principal": 1000,
    "apy": 5,
    "duration": 365,
    "durationUnit": "days",
    "normalizedDurationYears": 1,
    "compoundingFrequency": "daily",
    "finalBalance": 1051.267,
    "totalRewards": 51.267,
    "tokenPrice": 1,
    "projectedUsdValue": 1051.267,
    "chartData": [
      { "period": 0, "elapsedDays": 0, "balance": 1000 },
      { "period": 1, "elapsedDays": 1, "balance": 1000.133 },
      "..."
    ]
  }
}
```

| Field | Description |
|---|---|
| `finalBalance` | Projected final balance after the staking period |
| `totalRewards` | Rewards earned: `finalBalance - principal` |
| `normalizedDurationYears` | Duration converted to years for internal calculations |
| `projectedUsdValue` | `finalBalance * tokenPrice` (only when `tokenPrice` is provided) |
| `chartData` | Array of `{ period, elapsedDays, balance }` objects at each compounding interval |

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Principal must be a positive finite number"
}
```

#### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "error": "An unexpected error occurred"
}
```

---

## Mathematical Assumptions

### Effective APY vs Nominal Interest Rate

This calculator uses **Effective Annual Percentage Yield (APY)**, not a nominal annual interest rate (APR).

| Concept | Description |
|---|---|
| **APR (Nominal Rate)** | The stated annual rate before compounding effects. `A = P * (1 + r/n)^(n*t)` where `r` is the nominal rate |
| **APY (Effective Rate)** | The rate that already accounts for compounding over a year. `A = P * (1 + APY)^t` |

**Why this matters:** For a given APY of 5%, the final balance after exactly 1 year is always `P * 1.05`, regardless of compounding frequency. The compounding frequency only affects *how* intermediate values accumulate — not the final annual outcome.

### Core Formula

Given an effective APY as a decimal:

```
A = P × (1 + APY)^t
```

Where:
- `P` = initial principal
- `APY` = effective annual yield (e.g. 0.05 for 5%)
- `t` = duration in years
- `A` = final balance

### Periodic Rate Derivation

To generate chart data at the selected compounding intervals, we derive the equivalent periodic rate:

```
i = (1 + APY)^(1/n) - 1
```

Where `n` is the number of compounding periods per year:
- **Daily:** n = 365
- **Weekly:** n = 52
- **Monthly:** n = 12
- **Annually:** n = 1

The final balance using this periodic rate:

```
A = P × (1 + i)^(n × t)
```

This is **mathematically equivalent** to the effective APY formula for all frequencies. All compounding frequencies produce the same final balance for the same APY — verified in test case 17.

### Duration Conversion

| Input Unit | Conversion |
|---|---|
| `days` | `t = duration / 365` |
| `years` | `t = duration` |

Fractional durations (e.g. 1.5 years, 180 days) are supported.

### Precision

- Intermediate calculations use full JavaScript IEEE 754 floating-point precision. No intermediate rounding.
- Final results are rounded to 8 decimal places to avoid floating-point noise in display values.

### Input Boundaries

| Parameter | Min | Max | Rationale |
|---|---|---|---|
| `principal` | 1e-8 (0.00000001) | 1e12 (1 trillion) | Covers micro-tokens to institutional scale |
| `apy` | 0% | 100,000% | Covers zero-yield and extreme DeFi scenarios |
| `duration` (days) | ε > 0 | 36,500 | 100 years maximum |
| `duration` (years) | ε > 0 | 100 | 100 years maximum |

Inputs that produce a `finalBalance` greater than `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991) or result in `Infinity` / `NaN` are rejected with a 400 error.

---

## Compounding Frequency Explanation

Compounding frequency determines how often earned rewards are added back to your principal within a year.

| Frequency | Periods per Year | Description |
|---|---|---|
| **Daily** | 365 | Rewards compounded every day |
| **Weekly** | 52 | Rewards compounded every week |
| **Monthly** | 12 | Rewards compounded every month |
| **Annually** | 1 | Rewards compounded once per year |

Because the calculator uses **Effective APY** (not nominal APR), all compounding frequencies produce the **same final balance** for the same APY and duration. The frequency only controls the granularity of the chart data.

---

## Complexity Analysis

### Single Calculation

**Time Complexity:** O(1)

The core calculation (`A = P × (1 + i)^(n × t)`) uses `Math.pow()`, which runs in constant time regardless of input magnitude.

**Space Complexity:** O(1)

Only scalar values are computed. No intermediate arrays are allocated.

### Chart Data Generation

**Time Complexity:** O(k)

Where `k` is the number of chart data points, determined by the number of full compounding periods in the staking duration, plus one final point (if the last period is fractional). For daily compounding over 1 year, `k = 366`.

**Space Complexity:** O(k)

The `chartData` array holds `k` objects, each with three fields (`period`, `elapsedDays`, `balance`).

### Request Validation

**Time Complexity:** O(1)

A fixed number of field checks. No iteration over collections.

---

## Testing

### Run All Tests

```bash
cd assignment
npm test -- --watchAll=false
```

### Test Suites and Coverage

| Suite | File | Tests |
|---|---|---|
| Calculation Engine | `src/__tests__/stakingCalculatorService.test.ts` | 18 |
| API Controller | `src/__tests__/stakingCalculatorApi.test.ts` | 6 |
| React Component | `src/__tests__/StakingCalculatorComponent.test.tsx` | 4 |
| App Integration | `src/App.test.tsx` | 1 |
| **Total** | | **29** |

### Calculation Engine Tests (18)

1. RM 1,000 at 5% APY for 1 year — daily compounding
2. Daily compounding produces correct balance
3. Weekly compounding produces correct balance
4. Monthly compounding produces correct balance
5. Annual compounding produces correct balance
6. Zero APY — principal is unchanged
7. Fractional duration of 1.5 years
8. Duration specified in days
9. Very small principal (0.00000001)
10. Negative principal rejected with error
11. Negative APY rejected with error
12. Zero duration rejected with error
13. Invalid compounding frequency rejected
14. Invalid duration unit rejected
15. `NaN` principal rejected
16. `Infinity` APY rejected
17. All compounding frequencies produce equivalent final balance for same APY
18. Numerical overflow protection — result exceeding `Number.MAX_SAFE_INTEGER` rejected

### API Controller Tests (6)

1. Successful calculation returns correct structure
2. Missing required field returns 400
3. Negative principal returns 400
4. Invalid compounding frequency returns 400
5. Invalid duration unit returns 400
6. Zero APY returns success with unchanged principal

---

## Architectural Decisions and Trade-offs

### Backend Structure

The API layer follows a layered separation of concerns:

```
server.js                          ← Express entry point
server/
  routes/api/stakingCalculator.js  ← Route definitions
  controllers/stakingCalculatorController.js  ← HTTP handling, response shaping
  services/stakingCalculatorService.js        ← Reusable calculation engine
  validators/stakingCalculatorValidator.js    ← Input validation middleware
  middleware/errorHandler.js                  ← Centralized error handling
```

**Decision: Service is framework-agnostic.** The `stakingCalculatorService` exports pure functions that take plain objects and return plain objects. It has no dependency on Express. This makes it independently testable and reusable.

**Decision: No MongoDB.** The staking calculation is entirely stateless — no persistence is required. Adding a database dependency would introduce unnecessary complexity.

**Decision: Effective APY as input.** Most DeFi protocols publish their APY as an effective annual rate, not a nominal rate. Using effective APY avoids per-frequency formula divergence and aligns with industry convention.

### Frontend Structure

```
src/
  api/stakingCalculator.ts               ← Axios API client (uses existing api.js utility)
  views/dashboard/StakingCalculator/
    types.ts                             ← TypeScript interfaces
    CalculatorForm.tsx                   ← Controlled form with validation
    ResultsSummary.tsx                   ← Result cards (6 metrics)
    BalanceChart.tsx                     ← Recharts AreaChart
    StakingCalculator.tsx               ← State orchestrator (idle/loading/success/error)
  views/dashboard/Dashboard.tsx          ← Existing dashboard (tabs added)
```

**Decision: Calculator integrated into existing Dashboard via Tabs.** This avoids creating a new route and keeps the calculator contextually adjacent to the existing "Portfolio" and "Marketplace Offers" tabs. The existing layout, AppBar, sidebar, and theme are all preserved.

**Decision: Recharts over Chart.js or D3.** Recharts provides React-native components with built-in TypeScript types and good MUI integration, without requiring D3's low-level imperative API.

**Decision: Idle-then-calculate UX.** The calculator defaults to an idle state showing only the form, rather than auto-calculating on mount. This prevents an unnecessary API call before the user has entered their intended values.

### Trade-offs

| Decision | Benefit | Trade-off |
|---|---|---|
| Effective APY input | All frequencies produce equal final balance; aligns with DeFi industry convention | Less intuitive for users familiar with APR-based savings accounts |
| Stateless backend | Simple, fast, no DB coupling | No historical calculation storage |
| Recharts | Easy React integration, TypeScript support | Larger bundle than a custom SVG solution |
| `--legacy-peer-deps` for install | Resolves MUI/React 18 peer conflict without ejecting | Suppresses peer validation; some dependency warnings may appear |

---

## Known Limitations

1. **No calculation history.** Completed calculations are not persisted. Refreshing the page resets the form.
2. **No authentication required for the API.** The `/api/calculate-rewards` endpoint is publicly accessible. In a production system it should be protected by the existing JWT middleware.
3. **Chart performance on extreme durations.** Daily compounding over 100 years generates 36,500 chart points. The chart remains functional but may render slowly on low-end devices. A production implementation would downsample the chart data server-side.
4. **`@mui/icons-material` partial install.** During initial setup, the npm extraction of this package was interrupted. The tarball was manually re-extracted to restore all icon files. If the package is re-installed (`npm install`), this process may need to be repeated if the same extraction issue occurs.
5. **React Router v6 deprecation warnings.** The existing project uses React Router v6 without future flags. Deprecation warnings about `v7_startTransition` and `v7_relativeSplatPath` appear in test output. These are warnings only and do not affect functionality.
6. **`getPassport.js` remote code execution.** The existing codebase fetches JavaScript from a remote URL (`candidate-test-api.vercel.app`) and executes it via `new Function()`. This is a security concern in the original codebase. The startup crash caused by this was fixed (network errors are now caught), but the behaviour when the remote URL is reachable has not been audited.
7. **Floating-point precision.** JavaScript uses IEEE 754 double-precision floats. For very large principals or very long durations, results carry inherent floating-point rounding. A production financial system would use arbitrary-precision arithmetic (e.g. `decimal.js` or `big.js`).
