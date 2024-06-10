import {Connection} from '@solana/web3.js';
import {StakePoolTracker} from './StakePoolTracker';
import {SolidoSDK} from '@lidofinance/solido-sdk';
import {Logger} from '../utils';

export class SolidoTracker implements StakePoolTracker {
  public poolName = 'lido';
  private readonly logger = new Logger(`tracker:${this.poolName}`);
  constructor(private readonly connection: Connection) {}

  async getTokenPrice(): Promise<number> {
    const solidoSDK = new SolidoSDK('mainnet-beta', this.connection);
    const {stSOLToSOL: stSOLPrice} = await solidoSDK.getExchangeRate();
    return stSOLPrice;
  }
}
