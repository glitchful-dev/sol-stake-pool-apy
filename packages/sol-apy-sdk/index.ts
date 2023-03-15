import fetchPonyfill from 'fetch-ponyfill';
import {Readable} from 'stream';
import {parse} from 'csv-parse';
const {fetch} = fetchPonyfill();

const DATA_SOURCE_BASE =
  'https://raw.githubusercontent.com/glitchful-dev/sol-stake-pool-apy/master/db/';
export const DATA_SOURCE = {
  JITO_CSV: `${DATA_SOURCE_BASE}jito.csv`,
  LAINE_CSV: `${DATA_SOURCE_BASE}laine.csv`,
  COGENT_CSV: `${DATA_SOURCE_BASE}cogent.csv`,
  DAOPOOL_CSV: `${DATA_SOURCE_BASE}daopool.csv`,
  EVERSTAKE_CSV: `${DATA_SOURCE_BASE}everstake.csv`,
  SOCEAN_CSV: `${DATA_SOURCE_BASE}socean.csv`,
  JPOOL_CSV: `${DATA_SOURCE_BASE}jpool.csv`,
  SOLBLAZE_CSV: `${DATA_SOURCE_BASE}solblaze.csv`,
  LIDO_CSV: `${DATA_SOURCE_BASE}lido.csv`,
  MARINADE_CSV: `${DATA_SOURCE_BASE}marinade.csv`,
};

const DEFAULT_EPOCHS = 10;

export type PriceRecord = {
  timestamp: number;
  epoch: number;
  price: number;
};

export type ApyCalcResult = {
  timestampStart: number;
  timestampEnd: number;
  epochs: number;
  apy: number;
};

export const parsePriceRecordsFromCSV = async (
  csv: Readable
): Promise<PriceRecord[]> => {
  const csvParser = parse({delimiter: ',', columns: true});
  const records = [];
  for await (const row of csv.pipe(csvParser)) {
    const {timestamp, epoch, price} = row;
    if (!timestamp || !epoch || !price) {
      throw new Error('Columns "timestamp", "epoch", "price" must be present!');
    }
    const record = {
      timestamp: new Date(timestamp).getTime(),
      epoch: Number(epoch),
      price: Number(price),
    };
    if (isNaN(record.timestamp)) {
      throw new Error('Timestamp must be a... timestamp!');
    }
    if (isNaN(record.epoch)) {
      throw new Error('Epoch must be a number!');
    }
    if (isNaN(record.price)) {
      throw new Error('Price must be a number!');
    }

    records.push(record);
  }
  return records;
};

export const fetchAndParsePricesCsv = async (url: string) => {
  const csvResponse = await fetch(url);
  const csvContents = await csvResponse.text();
  const prices = await parsePriceRecordsFromCSV(Readable.from([csvContents]));

  return prices;
};

export const calcAverageApy = (
  priceRecords: PriceRecord[],
  epochs = DEFAULT_EPOCHS
): ApyCalcResult | null => {
  priceRecords.sort((a, b) => b.timestamp - a.timestamp);

  if (priceRecords.length <= 1) {
    return null;
  }

  const [lastPriceRecord] = priceRecords;

  const epochEnd = lastPriceRecord.epoch;
  const timestampEnd = lastPriceRecord.timestamp;
  const priceEnd = lastPriceRecord.price;

  let timestampStart = timestampEnd;
  let priceStart = priceEnd;
  let epochStart = epochEnd;

  for (const {timestamp, epoch, price} of priceRecords) {
    timestampStart = timestamp;
    priceStart = price;
    epochStart = epoch;
    if (epochEnd - epoch >= epochs) {
      break;
    }
  }

  const deltaMilliseconds = timestampEnd - timestampStart;
  const priceChange = priceEnd / priceStart;
  const millisecondsInAYear = 365.25 * 24 * 3600 * 1000;

  if (deltaMilliseconds === 0) {
    return null;
  }

  return {
    apy: priceChange ** (millisecondsInAYear / deltaMilliseconds) - 1,
    epochs: epochEnd - epochStart,
    timestampStart: timestampStart,
    timestampEnd: timestampEnd,
  };
};
