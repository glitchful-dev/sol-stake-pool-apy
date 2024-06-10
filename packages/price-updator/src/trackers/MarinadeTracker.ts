import {Connection} from '@solana/web3.js';
import {Logger} from '../utils';
import {StakePoolTracker} from './StakePoolTracker';
import {Marinade, MarinadeConfig} from '@marinade.finance/marinade-ts-sdk';

export class MarinadeTracker implements StakePoolTracker {
  public poolName = 'marinade';
  private readonly logger = new Logger(`tracker:${this.poolName}`);
  constructor(private readonly connection: Connection) {}

  async getTokenPrice(): Promise<number> {
    const config = new MarinadeConfig({
      connection: this.connection,
    });
    const marinade = new Marinade(config);
    const marinadeState = marinade.getMarinadeState();
    return (await marinadeState).mSolPrice;
  }
}
