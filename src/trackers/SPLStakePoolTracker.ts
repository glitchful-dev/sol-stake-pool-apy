import {getStakePoolAccount, depositSol} from '@solana/spl-stake-pool';
import {
  Connection,
  PublicKey,
  VersionedTransaction,
  Keypair,
  TransactionMessage,
} from '@solana/web3.js';
import {AccountLayout} from '@solana/spl-token';
import {
  findAssociatedTokenAddress,
  getAssociatedTokenBalance,
  Logger,
} from '../utils';
import {StakePoolTracker} from './StakePoolTracker';

export class SPLStakePoolTracker implements StakePoolTracker {
  private readonly logger = new Logger(`tracker:${this.poolName}`);
  constructor(
    public readonly poolName: string,
    private readonly connection: Connection,
    private readonly stakePoolAddress: PublicKey,
    private readonly staker: Keypair
  ) {}

  async getTokenPrice(): Promise<number> {
    const stakePoolAccount = await getStakePoolAccount(
      this.connection,
      this.stakePoolAddress
    );
    const {poolMint} = stakePoolAccount.account.data;
    const stakerAssociatedTokenAccount = findAssociatedTokenAddress(
      this.staker.publicKey,
      poolMint
    );
    const balance = await this.connection.getBalance(this.staker.publicKey);
    const tokenBalance = await getAssociatedTokenBalance(
      this.connection,
      stakerAssociatedTokenAccount
    );

    const {blockhash: recentBlockhash} =
      await this.connection.getLatestBlockhash();

    this.logger.info('Balance before simulation', {balance, tokenBalance});

    const depositAmount = 1e9;
    const {instructions} = await depositSol(
      this.connection,
      this.stakePoolAddress,
      this.staker.publicKey,
      depositAmount
    );
    const versionedMessage = new TransactionMessage({
      payerKey: this.staker.publicKey,
      recentBlockhash,
      instructions,
    }).compileToV0Message();
    const tx = new VersionedTransaction(versionedMessage);
    tx.sign([this.staker]);

    const rpcSimulationResponse = await this.connection.simulateTransaction(
      tx,
      {
        accounts: {
          encoding: 'base64',
          addresses: [stakerAssociatedTokenAccount.toBase58()],
        },
      }
    );
    const [tokenAccountRaw] = rpcSimulationResponse.value.accounts ?? [];
    if (!tokenAccountRaw) {
      throw new Error('Token account not returned from the simulation!');
    }

    const [accountData] = tokenAccountRaw?.data!;
    const tokenAccount = AccountLayout.decode(
      Buffer.from(accountData, 'base64')
    );
    const receivedAmount: bigint =
      (tokenAccount.amount as bigint) - tokenBalance;

    this.logger.info('Deposit amount and received amount.', {
      depositAmount,
      receivedAmount,
    });

    return depositAmount / Number(receivedAmount);
  }
}
