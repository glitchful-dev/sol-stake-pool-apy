export abstract class StakePoolTracker {
  abstract readonly poolName: string;

  abstract getTokenPrice(): Promise<number>;
}
