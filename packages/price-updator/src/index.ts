import {Connection, PublicKey} from '@solana/web3.js';
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
  const clusterUrl = getEnvVar('RPC_URL');
  const connection = new Connection(clusterUrl);
  const {epoch} = await connection.getEpochInfo();
  process.stdout.write(`epoch ${epoch}\n`);
  const trackers: StakePoolTracker[] = [
    new SPLStakePoolTracker(
      'Cogent',
      connection,
      new PublicKey('CgntPoLka5pD5fesJYhGmUCF8KU1QS1ZmZiuAuMZr2az')
    ),
    new SPLStakePoolTracker(
      'Laine',
      connection,
      new PublicKey('2qyEeSAWKfU18AFthrF7JA8z8ZCi1yt76Tqs917vwQTV')
    ),
    new SPLStakePoolTracker(
      'JPool',
      connection,
      new PublicKey('CtMyWsrUtAwXWiGr9WjHT5fC3p3fgV8cyGpLTo2LJzG1')
    ),
    new SPLStakePoolTracker(
      'SolBlaze',
      connection,
      new PublicKey('stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi')
    ),
    new SPLStakePoolTracker(
      'DAOPool',
      connection,
      new PublicKey('7ge2xKsZXmqPxa3YmXxXmzCp9Hc2ezrTxh6PECaxCwrL')
    ),
    // Socean/Inf no longer uses SPL Contract. Until they will provide a way to compute the price, it will stay disabled
    // new SPLStakePoolTracker(
    //   'INF',
    //   connection,
    //   new PublicKey('5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm')
    // ),
    new SPLStakePoolTracker(
      'Everstake',
      connection,
      new PublicKey('GUAMR8ciiaijraJeLDEDrFVaueLm9YzWWY9R7CBPL9rA')
    ),
    new SPLStakePoolTracker(
      'Jito',
      connection,
      new PublicKey('Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb')
    ),
    new SPLStakePoolTracker(
      'LST',
      connection,
      new PublicKey('DqhH94PjkZsjAqEze2BEkWhFQJ6EyU6MdtMphMgnXqeK')
    ),
    new SPLStakePoolTracker(
      'Edgevana',
      connection,
      new PublicKey('edgejNWAqkePLpi5sHRxT9vHi7u3kSHP9cocABPKiWZ')
    ),
    new SPLStakePoolTracker(
      'Hub',
      connection,
      new PublicKey('ECRqn7gaNASuvTyC5xfCUjehWZCSowMXstZiM5DNweyB')
    ),
    new SPLStakePoolTracker(
      'PwrSOL',
      connection,
      new PublicKey('DfiQgSvpW3Dy4gKfhtdHnWGHwFUrE8exvaxqjtMtAVxk')
    ),
    new SPLStakePoolTracker(
      'PicoSOL',
      connection,
      new PublicKey('8Dv3hNYcEWEaa4qVx9BTN1Wfvtha1z8cWDUXb7KVACVe')
    ),
    new SPLStakePoolTracker(
      'vSOL',
      connection,
      new PublicKey('vSoLxydx6akxyMD9XEcPvGYNGq6Nn66oqVb3UkGkei7')
    ),
    new SolidoTracker(connection),
    new MarinadeTracker(connection),
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
