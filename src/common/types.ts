import { BN } from '@project-serum/anchor';

export interface TokenExtensions {
  readonly website?: string;
  readonly bridgeContract?: string;
  readonly assetContract?: string;
  readonly address?: string;
  readonly explorer?: string;
  readonly twitter?: string;
  readonly github?: string;
  readonly medium?: string;
  readonly tgann?: string;
  readonly tggroup?: string;
  readonly discord?: string;
  readonly serumV3Usdt?: string;
  readonly serumV3Usdc?: string;
  readonly coingeckoId?: string;
  readonly imageUrl?: string;
  readonly description?: string;
}
export interface TokenInfo {
  readonly chainId: number;
  readonly address: string;
  readonly name: string;
  readonly decimals: number;
  readonly symbol: string;
  readonly logoURI?: string;
  readonly tags?: string[];
  readonly extensions?: TokenExtensions;
}

export interface TokenView {
  tokenAccountPubkey: string;
  mint: string;
  owner: string;
  amount: number;
  amountBN: BN;
  delegateOption: boolean;
  delegate: string;
  state: number;
  isNativeOption: boolean;
  isNative: number;
  delegatedAmount: number;
  closeAuthorityOption: boolean;
  closeAuthority: string;
}
