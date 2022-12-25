export interface Address {
  value: string;
  owned: boolean;
}

export interface Transfer {
  id: number;
  fromAddress: Address;
  toAddress: Address;
  value: string;
  valueDecimal: string;
  block: number;
  txHash: string;
  txIndex: number;
  index: number;
  dropped: boolean;
  confirmations: number;
  assetMetadata: {
    decimals: number;
    name: string;
    symbol: string;
    address?: string;
  };
  failed: boolean;
}
