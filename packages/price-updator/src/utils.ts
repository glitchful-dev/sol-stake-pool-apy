import {BN} from '@marinade.finance/marinade-ts-sdk';
import {StakePool} from '@solana/spl-stake-pool';

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

const SOL_DECIMALS = 9;

export function withDecimalPoint(bn: BN, decimals: number): string {
  const s = bn.toString().padStart(decimals + 1, '0');
  const l = s.length;
  return s.slice(0, l - decimals) + '.' + s.slice(-decimals);
}

export function tokenBalanceToNumber(bn: BN, decimals: number): number {
  return Number(withDecimalPoint(bn, decimals));
}

export function lamportsToSol(bn: BN): number {
  return tokenBalanceToNumber(bn, SOL_DECIMALS);
}

export function solToLamports(amountSol: number): BN {
  return new BN(amountSol.toFixed(SOL_DECIMALS).replace('.', ''));
}

export function divideBnToNumber(numerator: BN, denominator: BN): number {
  if (denominator.isZero()) {
    return 0;
  }
  const quotient = numerator.div(denominator);
  const rem = numerator.umod(denominator);
  const gcd = rem.gcd(denominator);

  const quotientNumber = parseFloat(quotient.toString());
  const remNumber = parseFloat(rem.div(gcd).toString());
  const denominatorNumber = parseFloat(denominator.div(gcd).toString());

  return quotientNumber + remNumber / denominatorNumber;
}

export function calcLamportsWithdrawAmount(
  stakePool: StakePool,
  poolTokens: BN
): number {
  const numerator = poolTokens.mul(stakePool.totalLamports);
  const denominator = stakePool.poolTokenSupply;
  if (numerator.lt(denominator)) {
    return 0;
  }
  return divideBnToNumber(numerator, denominator);
}
