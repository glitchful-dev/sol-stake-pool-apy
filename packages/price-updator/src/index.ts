import {Connection, PublicKey} from '@solana/web3.js';
import {SPLStakePoolTracker} from './trackers/SPLStakePoolTracker';
import {StakePoolTracker} from './trackers/StakePoolTracker';
import {SolidoTracker} from './trackers/SolidoTracker';
import {MarinadeTracker} from './trackers/MarinadeTracker';
import {Logger} from './utils';
import assert from 'node:assert';
import {StakePoolLayout} from './spl-utils';
import {pairs} from './known-spl-pools';

const getEnvVar = (key: string) => {
  const envVarValue = process.env[key];
  assert.ok(envVarValue, `Environment variable ${key} is not defined!`);
  return envVarValue;
};

(async () => {
  const logger = new Logger();
  const clusterUrl = getEnvVar('RPC_URL');
  const connection = new Connection(clusterUrl);
  const {epoch} = await connection.getEpochInfo();
  process.stdout.write(`epoch ${epoch}\n`);

  const trackers: StakePoolTracker[] = [
    // Socean/Inf no longer uses SPL Contract. Until they will provide a way to compute the price, it will stay disabled
    // new SPLStakePoolTracker(
    //   'INF',
    //   connection,
    //   new PublicKey('5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm')
    // ),
    new SolidoTracker(connection),
    new MarinadeTracker(connection),
  ];

  const splPoolAccounts = await connection.getProgramAccounts(
    new PublicKey('SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy')
  );
  splPoolAccounts.forEach(account => {
    try {
      const publicKey = account.pubkey.toBase58();
      const parsedInfo = StakePoolLayout.decode(account.account.data);

      const knownName = pairs[publicKey];
      logger.info('Name:', {knownName});
      if (!parsedInfo.lastEpochTotalLamports.isZero()) {
        trackers.push(
          new SPLStakePoolTracker(
            knownName ?? publicKey,
            connection,
            new PublicKey(publicKey)
          )
        );
      }
    } catch (ex) {
      logger.error('Ex', {ex});
    }
  });

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
