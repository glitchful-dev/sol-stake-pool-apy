# Solana APY SDK

This GitHub repository provides an SDK for calculating Annual Percentage Yield (APY) and a database of prices for major Solana stake pools. The purpose of this repository is to unify the calculation of APY across various Solana stake pools and simplify the process for developers to incorporate APY calculations into their Solana-based projects.

## Usage

Install the package:

```bash
pnpm install @glitchful-dev/sol-apy-sdk
```

```typescript
import { fetchAndParsePricesCsv, getPriceRangeFromPeriod, calcYield, DATA_SOURCE, PERIOD } from '@glitchful-dev/sol-apy-sdk'

(async () => {
  const prices = await fetchAndParsePricesCsv(DATA_SOURCE.MARINADE_CSV)
  const priceRange = getPriceRangeFromPeriod(prices, PERIOD.DAYS_14) // may be null if the price range cannot be calculated

  const result = calcYield(priceRange)

  console.log('APR: ', result?.apr) // 0.06493501845986677 => 6.49 %
  console.log('APY: ', result?.apy) // 0.06707557862842384 => 6.71 %
})()
```

## Prices DB

A Github action runs periodically and collects prices of some of the stake pools' tokens. The prices are stored in CSV files.

```mermaid
graph LR;
  A(Scheduled Github Action)-->B(Get xSOL prices)
  B-->C(Update ./db/*.csv)
```

This SDK can fetch the contents of these CSV files and calculate APY based on this data.
The data is collected at the same time for all target stake pools.
The SDK calculates the APY in the same way for everyone.
This ensures fairness for stake pool users who are then given an opportunity to compare how stake pools perform.

## Supported stakepools

The following stakepools' APY can be obtained through this SDK: 

mSOL / stSOL / jitoSOL / bSOL / INF / eSOL / LaineSOL / CgntSOL / daoSOL / LST / edgeSOL / hubSOL / pwrSOL / picoSOL / pumpkinSOL / vSOL
