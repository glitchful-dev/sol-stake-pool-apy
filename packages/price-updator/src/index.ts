import {Connection, PublicKey, Keypair} from '@solana/web3.js';
import {SPLStakePoolTracker} from './trackers/SPLStakePoolTracker';
import {StakePoolTracker} from './trackers/StakePoolTracker';
import {SolidoTracker} from './trackers/SolidoTracker';
import {MarinadeTracker} from './trackers/MarinadeTracker';
import {Logger} from './utils';
import assert from 'node:assert';

const getEnvVar = (key: string) => {
  const envVarValue = process.env[key];
  assert.ok(envVarValue, `Environment variable ${key} is not defined!`);
  return envVarValue;
};

(async () => {
  const logger = new Logger();
  const staker = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(getEnvVar('WALLET')))
  );
  const clusterUrl = getEnvVar('RPC_URL');
  const connection = new Connection(clusterUrl);
  const {epoch} = await connection.getEpochInfo();
  process.stdout.write(`epoch ${epoch}\n`);
  const trackers: StakePoolTracker[] = [
    new SPLStakePoolTracker(
      'Cogent',
      connection,
      new PublicKey('CgntPoLka5pD5fesJYhGmUCF8KU1QS1ZmZiuAuMZr2az'),
      staker
    ),
    new SPLStakePoolTracker(
      'Laine',
      connection,
      new PublicKey('2qyEeSAWKfU18AFthrF7JA8z8ZCi1yt76Tqs917vwQTV'),
      staker
    ),
    new SPLStakePoolTracker(
      'JPool',
      connection,
      new PublicKey('CtMyWsrUtAwXWiGr9WjHT5fC3p3fgV8cyGpLTo2LJzG1'),
      staker
    ),
    new SPLStakePoolTracker(
      'SolBlaze',
      connection,
      new PublicKey('stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi'),
      staker
    ),
    new SPLStakePoolTracker(
      'DAOPool',
      connection,
      new PublicKey('7ge2xKsZXmqPxa3YmXxXmzCp9Hc2ezrTxh6PECaxCwrL'),
      staker
    ),
    // new SPLStakePoolTracker(
    //   'Socean',
    //   connection,
    //   new PublicKey('5oc4nmbNTda9fx8Tw57ShLD132aqDK65vuHH4RU1K4LZ'),
    //   staker
    // ),
    // new SPLStakePoolTracker(
    //   'Everstake',
    //   connection,
    //   new PublicKey('GUAMR8ciiaijraJeLDEDrFVaueLm9YzWWY9R7CBPL9rA'),
    //   staker
    // ),
    new SPLStakePoolTracker(
      'Jito',
      connection,
      new PublicKey('Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb'),
      staker
    ),
    new SolidoTracker(connection, staker),
    new MarinadeTracker(connection, staker),
  ];

  for (const tracker of trackers) {
    try {
      const tokenPrice = await tracker.getTokenPrice();
      logger.info(tracker.poolName, {tokenPrice, poolName: tracker.poolName});
      process.stdout.write(`${tracker.poolName} ${tokenPrice}\n`);
    } catch (err) {
      logger.error('Tracker failed', {tracker: tracker.poolName, err});
    }
  }
})();
