import axios, { AxiosRequestConfig, Method } from "axios";

import { CurraConnectorError } from "./errors";
import {
  GetContractEventsParams,
  GetContractEventsResponse,
  GetTransfersParams,
  Transfer,
} from "./types";

export class CurraConnector {
  constructor(private readonly url: string) {}

  computeNodeRpcUrl(): string {
    return this.url + "/node/rpc";
  }

  async #request(method: Method, path: string, config: AxiosRequestConfig) {
    const response = await axios({
      url: `${this.url}/${path}`,
      method,
      ...config,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      validateStatus: () => true,
    });
    if (response.status !== 200 && response.status !== 201)
      throw new CurraConnectorError(response.status, response.data);
    return response.data;
  }

  async importAddress(value: string) {
    await this.#request("post", "addresses", { data: { value } });
  }

  async getLastBlock(): Promise<number> {
    const response = await this.#request("get", "blocks/last", {});
    return response.blockNumber;
  }

  async importToken(address: string) {
    await this.#request("post", "tokens", { data: { address } });
  }

  async getContractEvents<T = any>(
    params: GetContractEventsParams
  ): Promise<GetContractEventsResponse<T>> {
    return this.#request("get", "contract-events", {
      params,
    });
  }

  async getTransfers(params: GetTransfersParams): Promise<Transfer[]> {
    return this.#request("get", "transfers", { params });
  }

  isIncomingTransfer(t: Transfer): boolean {
    return t.toAddress.owned;
  }

  isNonZeroTransfer(t: Transfer): boolean {
    return parseInt(t.value) > 0;
  }
}
