import { Sort } from "./Sort";

export interface GetContractEventsParams {
  toBlock?: number;
  fromBlock?: number;
  skip?: number;
  limit?: number;
  sort?: Sort;
  name?: string;
}
