export interface Address {
    value: string;
    owned: boolean;
  }
  
  export interface Transfer {
    id: number;
    fromAddress: Address;
    toAddress: Address;
    value: string;
    token: string;
    block: number;
    txHash: string;
    txIndex: number;
    index: number;
    dropped: boolean;
    confirmations: number;
  }
  