// Sourced from: https://github.com/solana-labs/solana-program-library/blob/master/stake-pool/js/src/layouts.ts

import {publicKey, struct, u64, u8, option, Layout} from '@coral-xyz/borsh';
import {Layout as LayoutCls, u8 as u8Cls} from 'buffer-layout';
import {StakePool} from '@solana/spl-stake-pool';

const feeFields = [u64('denominator'), u64('numerator')];

export class FutureEpochLayout<T> extends LayoutCls<T | null> {
  layout: Layout<T>;
  discriminator: Layout<number>;

  constructor(layout: Layout<T>, property?: string) {
    super(-1, property);
    this.layout = layout;
    this.discriminator = u8Cls();
  }

  encode(src: T | null, b: Buffer, offset = 0): number {
    if (src === null || src === undefined) {
      return this.discriminator.encode(0, b, offset);
    }
    // This isn't right, but we don't typically encode outside of tests
    this.discriminator.encode(2, b, offset);
    return this.layout.encode(src, b, offset + 1) + 1;
  }

  decode(b: Buffer, offset = 0): T | null {
    const discriminator = this.discriminator.decode(b, offset);
    if (discriminator === 0) {
      return null;
    } else if (discriminator === 1 || discriminator === 2) {
      return this.layout.decode(b, offset + 1);
    }
    throw new Error('Invalid future epoch ' + this.property);
  }

  getSpan(b: Buffer, offset = 0): number {
    const discriminator = this.discriminator.decode(b, offset);
    if (discriminator === 0) {
      return 1;
    } else if (discriminator === 1 || discriminator === 2) {
      return this.layout.getSpan(b, offset + 1) + 1;
    }
    throw new Error('Invalid future epoch ' + this.property);
  }
}

export function futureEpoch<T>(
  layout: Layout<T>,
  property?: string
): Layout<T | null> {
  return new FutureEpochLayout<T>(layout, property);
}

export const StakePoolLayout = struct<StakePool>([
  u8('accountType'),
  publicKey('manager'),
  publicKey('staker'),
  publicKey('stakeDepositAuthority'),
  u8('stakeWithdrawBumpSeed'),
  publicKey('validatorList'),
  publicKey('reserveStake'),
  publicKey('poolMint'),
  publicKey('managerFeeAccount'),
  publicKey('tokenProgramId'),
  u64('totalLamports'),
  u64('poolTokenSupply'),
  u64('lastUpdateEpoch'),
  struct(
    [u64('unixTimestamp'), u64('epoch'), publicKey('custodian')],
    'lockup'
  ),
  struct(feeFields, 'epochFee'),
  futureEpoch(struct(feeFields), 'nextEpochFee'),
  option(publicKey(), 'preferredDepositValidatorVoteAddress'),
  option(publicKey(), 'preferredWithdrawValidatorVoteAddress'),
  struct(feeFields, 'stakeDepositFee'),
  struct(feeFields, 'stakeWithdrawalFee'),
  futureEpoch(struct(feeFields), 'nextStakeWithdrawalFee'),
  u8('stakeReferralFee'),
  option(publicKey(), 'solDepositAuthority'),
  struct(feeFields, 'solDepositFee'),
  u8('solReferralFee'),
  option(publicKey(), 'solWithdrawAuthority'),
  struct(feeFields, 'solWithdrawalFee'),
  futureEpoch(struct(feeFields), 'nextSolWithdrawalFee'),
  u64('lastEpochPoolTokenSupply'),
  u64('lastEpochTotalLamports'),
]);
