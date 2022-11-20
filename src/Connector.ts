import needle, { BodyData, NeedleHttpVerbs } from "needle";
import { Transfer } from "./types";

export class Connector {
  constructor(private readonly url: string) {}

  async #request(method: NeedleHttpVerbs, path: string, data: BodyData) {
    const response = await needle(method, `${this.url}/${path}`, data, {
      json: true,
    });
    if (response.statusCode !== 200 && response.statusCode !== 201)
      throw new Error(`Curra request error: ${response.statusCode}`);
    return response.body;
  }

  async importAddress(value: string) {
    await this.#request("post", `addresses`, { value });
  }

  async importToken(address: string) {
    await this.#request("post", `tokens`, { address });
  }

  isIncomingTransfer(t: Transfer): boolean {
    return t.toAddress.owned;
  }

  isNonZeroTransfer(t: Transfer): boolean {
    return parseInt(t.value) > 0;
  }
}
