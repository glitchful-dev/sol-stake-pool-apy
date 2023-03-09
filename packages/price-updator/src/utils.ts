import {Connection, PublicKey, SolanaJSONRPCError} from '@solana/web3.js';
import {ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID} from '@solana/spl-token';

export class Logger {
  private now = () => new Date().toISOString();
  constructor(private readonly context?: string) {}

  private stringify = (obj: Record<string, unknown>) => {
    const fields = Object.entries(obj).map(([key, value]) => {
      if (value instanceof Error) {
        return `${key}: ${value.message}`;
      }
      if (typeof value === 'bigint') {
        return `${key}: ${value}`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    });

    return fields.join(', ');
  };

  info = (msg: string, obj?: Record<string, unknown>) =>
    this.log('[ÍNFO]', msg, obj);
  error = (msg: string, obj?: Record<string, unknown>) =>
    this.log('[ERROR]', msg, obj);
  log = (level: string, msg: string, obj?: Record<string, unknown>) =>
    process.stderr.write(
      `${this.now()} ${level} ${this.context ? `${this.context} ` : ''}${msg}${
        obj ? ` ${this.stringify(obj)}` : ''
      }\n`
    );
}

export const findAssociatedTokenAddress = (
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): PublicKey =>
  PublicKey.findProgramAddressSync(
    [
      walletAddress.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      tokenMintAddress.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];

export const getAssociatedTokenBalance = async (
  connection: Connection,
  tokenAccount: PublicKey
): Promise<bigint> => {
  try {
    const balanceResponse = await connection.getTokenAccountBalance(
      tokenAccount
    );
    return BigInt(balanceResponse.value.amount);
  } catch (err) {
    if (err instanceof SolanaJSONRPCError && err.code === -32602) {
      return BigInt(0);
    }
    throw err;
  }
};
