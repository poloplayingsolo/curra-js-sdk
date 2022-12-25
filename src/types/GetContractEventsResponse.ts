import { ContractEvent } from "./ContractEvent";

export interface GetContractEventsResponse<T> {
  entities: Array<ContractEvent<T>>;
  count: number;
}
