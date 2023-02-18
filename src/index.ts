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
  const clusterUrl = 'http://api.mainnet-beta.solana.com';
  const connection = new Connection(clusterUrl);

  const trackers: StakePoolTracker[] = [
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
