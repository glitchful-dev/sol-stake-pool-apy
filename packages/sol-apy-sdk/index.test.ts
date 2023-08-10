import { describe, it, expect } from '@jest/globals';
import { Readable } from 'stream';
import { PERIOD, calcYield, getPriceRangeFromDates, getPriceRangeFromPeriod, parsePriceRecordsFromCSV } from '.';

const PRICES_FIXTURE = `timestamp,epoch,price
2023-02-16T20:00:00.000Z,412,1.0941210906569283
2023-02-18T15:28:09.247Z,413,1.0945924869715526
2023-02-21T13:11:32+00:00,414,1.0950583993877852
2023-02-23T20:54:15+00:00,415,1.0955070615234903
2023-02-27T02:13:17+00:00,416,1.0959482337882382
2023-03-01T13:12:45+00:00,417,1.096392841238896
2023-03-03T20:54:30+00:00,418,1.096843739456418
2023-03-06T04:54:27+00:00,419,1.0972802712441718
2023-03-08T16:56:06+00:00,420,1.0977456564567272
2023-03-10T21:56:02+00:00,421,1.0982106707479484
2023-03-13T05:56:03+00:00,422,1.0986825938727043
2023-03-15T14:56:14+00:00,423,1.0991392944646632
2023-03-17T22:56:17+00:00,424,1.0992061116862286
2023-03-17T23:56:03+00:00,424,1.0996000494015115
2023-03-20T05:56:09+00:00,425,1.1000629805857518
2023-03-22T13:08:34+00:00,426,1.100526299299535
2023-03-24T20:55:59+00:00,427,1.1009865561790546
2023-03-27T02:56:14+00:00,428,1.101442255695231
2023-03-29T09:56:08+00:00,429,1.1019035790931255
2023-03-31T15:56:21+00:00,430,1.1019035790931255
2023-03-31T16:56:21+00:00,430,1.102335473523167
2023-04-02T23:56:00+00:00,431,1.1027780885651493
2023-04-05T06:55:56+00:00,432,1.1032175661352648
`;

describe('APY SDK', () => {
  describe('parsePriceRecordsFromCSV', () => {
    it('parses CSV and returns price records', async () => {
      const prices = await parsePriceRecordsFromCSV(
        Readable.from(PRICES_FIXTURE)
      );
      expect(prices).toMatchSnapshot();
    });
  });
  describe('calcYield', () => {
    it('calculates APY and APR correctly', async () => {
      const result = calcYield({
        startPrice: 42,
        endPrice: 42.0558847584553,
        startTimestamp: 0,
        endTimestamp: 586800,
        startEpoch: 0,
        endEpoch: 3,
      });

      expect(result).toStrictEqual({
        apr: 0.07152624512579997,
        apy: 0.07412931603353212,
      });
    });
    it('calculates APY and APR correctly', async () => {
      const result = calcYield({
        startPrice: 1,
        endPrice: 1.00045,
        startTimestamp: 0,
        endTimestamp: 2 * 86400,
        startEpoch: 0,
        endEpoch: 1,
      });

      expect(result).toStrictEqual({
        apr: 0.08218125000001122,
        apy: 0.08563249816733087,
      });
    });
    it('calculates APY and APR correctly', async () => {
      const prices = await parsePriceRecordsFromCSV(
        Readable.from(PRICES_FIXTURE)
      );
      const priceRange = getPriceRangeFromPeriod(prices, PERIOD.DAYS_14, new Date('2023-04-05T06:55:56+00:00'))
      expect(priceRange).toStrictEqual({
        endEpoch: 432,
        endPrice: 1.1032175661352648,
        endTimestamp: 1680677756,
        startEpoch: 426,
        startPrice: 1.100526299299535,
        startTimestamp: 1679490514,
      })

      const result = calcYield(priceRange!);
      expect(result).toStrictEqual({
        apr: 0.06493501845986677,
        apy: 0.06707557862842384,
      });
      expect(result.apy).toBe((1.1032175661352648 / 1.100526299299535) ** ((365.25 * 86400) / (1680677756 - 1679490514)) - 1)
    });
  });
  describe('getPriceRangeFromDates', () => {
    it('finds correct price points', async () => {
      const prices = await parsePriceRecordsFromCSV(
        Readable.from(PRICES_FIXTURE)
      );
      const results = [
        getPriceRangeFromDates(prices, new Date("2000-01-01"), new Date("2040-01-01")),
        getPriceRangeFromDates(prices, new Date("2030-01-01"), new Date("2040-01-01")),
        getPriceRangeFromDates(prices, new Date("2000-01-01"), new Date("2020-01-01")),
        getPriceRangeFromDates(prices, new Date("2000-01-01"), new Date("2023-03-13T00:00:00Z")),
        getPriceRangeFromDates(prices, new Date("2023-03-13T00:00:00Z"), new Date("2040-01-01")),
        getPriceRangeFromDates(prices, new Date("2023-03-13T00:00:00Z"), new Date("2023-03-13T01:00:00Z")),
        getPriceRangeFromDates(prices, new Date("2023-03-13T00:00:00Z"), new Date("2023-03-14T00:00:00Z")),
        getPriceRangeFromDates(prices, new Date("2023-03-13T00:00:00Z"), new Date("2023-03-29T01:00:00Z")),
      ];

      expect(results).toStrictEqual([
        {
          endEpoch: 432,
          endPrice: 1.1032175661352648,
          endTimestamp: 1680677756,
          startEpoch: 412,
          startPrice: 1.0941210906569283,
          startTimestamp: 1676577600,
        },
        null,
        null,
        {
          endEpoch: 421,
          endPrice: 1.0982106707479484,
          endTimestamp: 1678485362,
          startEpoch: 412,
          startPrice: 1.0941210906569283,
          startTimestamp: 1676577600,
        },
        {
          endEpoch: 432,
          endPrice: 1.1032175661352648,
          endTimestamp: 1680677756,
          startEpoch: 422,
          startPrice: 1.0986825938727043,
          startTimestamp: 1678686963,
        },
        null,
        null,
        {
          endEpoch: 428,
          endPrice: 1.101442255695231,
          endTimestamp: 1679885774,
          startEpoch: 422,
          startPrice: 1.0986825938727043,
          startTimestamp: 1678686963,
        },
      ]);
    });
  });
});
