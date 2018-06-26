export interface AppOptions {
  readonly meta: {
    readonly title: string;
    readonly name: string;
    readonly description: string;
    readonly walletDescription: string;
    readonly social: {
      readonly twitter: string;
      readonly fb: string;
    };
    readonly donateAddress: string;
  };
  readonly url: string;
  readonly rpcURL: string;
  readonly reportURL?: string;
  readonly reportTimer?: number;
  readonly maintenance: boolean;
  readonly disableWalletModify: boolean;
  readonly confirmLimitMS: number;
  readonly adclerks?: {
    readonly id?: number;
    readonly zones?: {
      readonly leaderboard?: number;
      readonly mobileLeaderboard?: number;
    };
  };
}
export type NetworkType = 'main' | 'test' | 'priv';
