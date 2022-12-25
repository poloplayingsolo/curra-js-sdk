export interface ContractEvent<T> {
  id: number;
  name: string;
  address: string;
  topics: string[];
  data: T;
  rawData: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
}
