#  Solana APY SDK

This GitHub repository provides an SDK for calculating Annual Percentage Yield (APY) and a database of prices for major Solana stake pools. The purpose of this repository is to unify the calculation of APY across various Solana stake pools and simplify the process for developers to incorporate APY calculations into their Solana-based projects.

## Usage

Install the package:
```bash
pnpm install @glitchful-dev/sol-apy-sdk
```

```typescript
import { fetchAndParsePricesCsv, calcAverageApy, DATA_SOURCE } from '@glitchful-dev/sol-apy-sdk'

(async () => {
  const prices = await fetchAndParsePricesCsv(DATA_SOURCE.MARINADE_CSV)
  const result = calcAverageApy(prices)

  console.log('apy: ', result?.apy);                        // 0.06422106873309597 => 6.422 %
  console.log('timestampStart: ', result?.timestampStart);  // 1676577600000 => Thursday, February 16, 2023 8:00:00 PM GMT+00:00
  console.log('timestampEnd: ', result?.timestampEnd);      // 1678686963000 => Monday, March 13, 2023 5:56:03 AM GMT+00:00
  console.log('epochs used for calc: ', result?.epochs);    // 10
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

mSOL / stSOL / jitoSOL / bSOL / scnSOL / eSOL / LaineSOL / CgntSOL / daoSOL
