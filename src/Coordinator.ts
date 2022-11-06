import { utils, Wallet } from "ethers";
import needle, { BodyData, NeedleHttpVerbs } from "needle";

export class Coordinator {
  constructor(private readonly url: string, private readonly wallet: Wallet) {}

  async #request(
    method: NeedleHttpVerbs,
    path: string,
    data?: BodyData,
    headers?: Record<string, string>
  ) {
    const url = `${this.url}/${path}`;
    const options = { json: true, headers };
    const response = data
      ? await needle(method, url, data, options)
      : await needle(method, url, options);
    if (response.statusCode !== 200 && response.statusCode !== 201)
      throw new Error(
        `Coordinator request error: ${response.statusCode} ${JSON.stringify(
          response.body
        )}`
      );
    return response.body;
  }

  private async getSignature(address: string): Promise<string> {
    const nonce = await this.getNonce(address);
    const msg = `0x${Buffer.from(nonce.toString(), "utf8").toString("hex")}`;
    return this.wallet.signMessage(utils.arrayify(msg));
  }

  async getNextAddress() {
    const parent = await this.wallet.getAddress();
    const signature = await this.getSignature(parent);
    const body = await this.#request(
      "post",
      "forwarders/next",
      { parent },
      { signature }
    );
    return body.address;
  }

  async getNonce(address: string): Promise<number> {
    const response = await this.#request(
      "get",
      `auth/nonce?address=${address}`
    );
    return response.number;
  }

  async getTokens(
    limit: number,
    skip: number
  ): Promise<{ entities: Array<{ token: string }>; count: number }> {
    const parent = await this.wallet.getAddress();
    const response = await this.#request(
      "get",
      `configs?parent=${parent}&skip=${skip}&limit=${limit}`
    );
    return response;
  }

  async getForwarders(
    limit: number,
    skip: number
  ): Promise<{ entities: Array<{ address: string }>; count: number }> {
    const parent = await this.wallet.getAddress();
    const response = await this.#request(
      "get",
      `forwarders?parent=${parent}&skip=${skip}&limit=${limit}`
    );
    return response;
  }
}
