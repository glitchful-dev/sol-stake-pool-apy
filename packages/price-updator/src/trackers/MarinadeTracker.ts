import {
  Connection,
  VersionedTransaction,
  Keypair,
  TransactionMessage,
} from '@solana/web3.js';
import {AccountLayout} from '@solana/spl-token';
import {getAssociatedTokenBalance, Logger} from '../utils';
import {StakePoolTracker} from './StakePoolTracker';
import {Marinade, MarinadeConfig, BN} from '@marinade.finance/marinade-ts-sdk';

export class MarinadeTracker implements StakePoolTracker {
  public poolName = 'Marinade';
  private readonly logger = new Logger(`tracker:${this.poolName}`);
  constructor(
    private readonly connection: Connection,
    private readonly staker: Keypair
  ) {}

  async getTokenPrice(): Promise<number> {
    const marinadeConfig = new MarinadeConfig({
      connection: this.connection,
      publicKey: this.staker.publicKey,
    });
    const marinade = new Marinade(marinadeConfig);
    const depositAmount = 1e9;
    const {
      associatedMSolTokenAccountAddress: stakerAssociatedTokenAccount,
      transaction: {instructions},
    } = await marinade.deposit(new BN(depositAmount));

    const balance = await this.connection.getBalance(this.staker.publicKey);
    const tokenBalance = await getAssociatedTokenBalance(
      this.connection,
      stakerAssociatedTokenAccount
    );

    const {blockhash: recentBlockhash} =
      await this.connection.getLatestBlockhash();
    this.logger.info('Balance before simulation', {balance, tokenBalance});

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

    const [accountData] = tokenAccountRaw?.data;
    if (!accountData) {
      throw new Error('Account data missing!');
    }
    const tokenAccount = AccountLayout.decode(
      Buffer.from(accountData, 'base64')
    );
    const receivedAmount: bigint =
      (tokenAccount.amount as bigint) - tokenBalance;

    this.logger.info('Deposit amount and received amount.', {
      depositAmount,
      receivedAmount,
    });

    return Number(depositAmount) / Number(receivedAmount);
  }
}
