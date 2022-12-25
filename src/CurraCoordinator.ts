import { BigNumberish, Signer, utils } from "ethers";
import axios, { AxiosRequestConfig, Method } from "axios";

import { CurraCoordinatorError } from "./errors";

export class CurraCoordinator {
  constructor(private readonly url: string, private readonly signer: Signer) {}

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
      throw new CurraCoordinatorError(response.status, response.data);
    return response.data;
  }

  async getNonce(ownershipId: BigNumberish): Promise<number> {
    const response = await this.#request("get", `auth/nonce`, {
      params: {
        ownershipId: ownershipId.toString(),
      },
    });
    return response.number;
  }

  private async getSignature(ownershipId: BigNumberish): Promise<string> {
    const nonce = await this.getNonce(ownershipId);
    const msg = `0x${Buffer.from(nonce.toString(), "utf8").toString("hex")}`;
    return this.signer.signMessage(utils.arrayify(msg));
  }

  async getNextAddress(ownershipId: BigNumberish, destination: string) {
    const signature = await this.getSignature(ownershipId);
    const body = await this.#request("post", "forwarders/next", {
      data: { ownershipId, destination },
      headers: { signature },
    });
    return body.address;
  }

  async getAddress(
    salt: number,
    ownershipId: BigNumberish,
    destination: string
  ) {
    const signature = await this.getSignature(ownershipId);
    const body = await this.#request("post", "forwarders", {
      data: { ownershipId, salt, destination },
      headers: { signature },
    });
    return body.address;
  }

  async getForwarders(
    ownershipId: BigNumberish,
    limit: number,
    skip: number
  ): Promise<{ entities: Array<{ address: string }>; count: number }> {
    const response = await this.#request("get", "forwarders", {
      params: {
        limit,
        skip,
        ownershipId: ownershipId.toString(),
      },
    });
    return response;
  }
}
