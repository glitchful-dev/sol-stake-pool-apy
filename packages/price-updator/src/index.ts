/* eslint-disable node/no-unpublished-import */
import {Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {SPLStakePoolTracker} from './trackers/SPLStakePoolTracker';
import {StakePoolTracker} from './trackers/StakePoolTracker';
import {SolidoTracker} from './trackers/SolidoTracker';
import {MarinadeTracker} from './trackers/MarinadeTracker';
import {Logger} from './utils';
import {StakePoolLayout} from './spl-utils';
import {BN} from '@marinade.finance/marinade-ts-sdk';
import {pairs} from '../../sol-apy-sdk/known-spl-pools';

(async () => {
  const logger = new Logger();
  const clusterUrl = process.env['RPC_URL'];
  if (!clusterUrl) {
    logger.error('Environment variable RPC_URL is not defined!');
    return;
  }
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
  const sanctumSPLAccounts = await connection.getProgramAccounts(
    new PublicKey('SP12tWFxD9oJsVWNavTTBZvMbA6gkAmxtVgxdqvyvhY')
  );
  const extraSplPoolAccounts = await connection.getProgramAccounts(
    new PublicKey('SPMBzsVUuoHA4Jm6KunbsotaahvVikZs1JyTW6iJvbn')
  );
  [...splPoolAccounts, ...sanctumSPLAccounts, ...extraSplPoolAccounts].forEach(
    account => {
      try {
        const publicKey = account.pubkey.toBase58();
        const parsedInfo = StakePoolLayout.decode(account.account.data);
        const knownName = pairs[publicKey];
        logger.info('Name:', {knownName});
        const totalStake = parsedInfo.totalLamports.div(
          new BN(LAMPORTS_PER_SOL)
        );
        // 1 = AccountType.StakePool
        if (parsedInfo.accountType === 1 && totalStake >= 500) {
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
    }
  );

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
