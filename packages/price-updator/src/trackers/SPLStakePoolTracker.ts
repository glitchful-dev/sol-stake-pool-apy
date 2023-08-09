import {getStakePoolAccount} from '@solana/spl-stake-pool';
import {Connection, PublicKey} from '@solana/web3.js';
import {
  Logger,
  calcLamportsWithdrawAmount,
  lamportsToSol,
  solToLamports,
} from '../utils';
import {StakePoolTracker} from './StakePoolTracker';
import {BN} from '@marinade.finance/marinade-ts-sdk';

export class SPLStakePoolTracker implements StakePoolTracker {
  private readonly logger = new Logger(`tracker:${this.poolName}`);
  constructor(
    public readonly poolName: string,
    private readonly connection: Connection,
    public readonly stakePoolAddress: PublicKey
  ) {}

  async getTokenPrice(): Promise<number> {
    const stakePool = await getStakePoolAccount(
      this.connection,
      this.stakePoolAddress
    );
    const solValue = calcLamportsWithdrawAmount(
      stakePool.account.data,
      solToLamports(1)
    );

    return lamportsToSol(new BN(solValue));
  }
}
