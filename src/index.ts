import { Wallet } from "ethers";

import { Blockchain } from "./Blockchain";
import { Connector } from "./Connector";
import { Coordinator } from "./Coordinator";
import { Transfer } from "./types";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export class Curra {
  private readonly connector?: Connector;
  private readonly coordinator: Coordinator;
  private readonly wallet: Wallet;

  constructor(
    public readonly blockchain: Blockchain,
    options: {
      privateKey: string;
      connectorUrl?: string;
      coordinatorUrl: string;
    }
  ) {
    if (options?.connectorUrl) {
      this.connector = new Connector(options.connectorUrl);
    }
    this.wallet = new Wallet(options?.privateKey);
    this.coordinator = new Coordinator(
      options.coordinatorUrl ?? `https://${blockchain}.coordinator.curra.io`,
      this.wallet
    );
  }

  getConnector(): Connector | undefined {
    return this.connector;
  }

  getCoordinator(): Coordinator | undefined {
    return this.coordinator;
  }

  async getNextAddress() {
    const address = await this.coordinator.getNextAddress();
    await this.connector?.importAddress(address);
    return address;
  }
  async getAddress(salt: number) {
    const address = await this.coordinator.getAddress(salt);
    await this.connector?.importAddress(address);
    return address;
  }

  async syncTokens(): Promise<void> {
    if (!this.connector)
      throw new Error(
        "To use this method provide connector url in ctor options"
      );
    const limit = 10;
    const tokens = await this.coordinator.getTokens(limit, 0);
    while (tokens.count > tokens.entities.length) {
      const more = await this.coordinator.getTokens(
        limit,
        tokens.entities.length
      );
      tokens.entities.push(...more.entities);
    }
    for (const t of tokens.entities) {
      if (t.token === ZERO_ADDRESS) continue;
      await this.connector.importToken(t.token);
    }
  }

  async syncAddresses(): Promise<void> {
    if (!this.connector)
      throw new Error(
        "To use this method provide connector url in ctor options"
      );
    const limit = 10;
    const tokens = await this.coordinator.getForwarders(limit, 0);
    while (tokens.count > tokens.entities.length) {
      const more = await this.coordinator.getForwarders(
        limit,
        tokens.entities.length
      );
      tokens.entities.push(...more.entities);
    }
    for (const t of tokens.entities) {
      await this.connector.importAddress(t.address);
    }
  }

  async sync(): Promise<void> {
    await Promise.all([this.syncAddresses(), this.syncTokens()]);
  }

  private getConnectorOrAbort(): Connector {
    if (!this.connector)
      throw new Error("method is avaiable only with connector");
    return this.connector;
  }

  isIncomingTransfer(t: Transfer): boolean {
    return this.getConnectorOrAbort().isIncomingTransfer(t);
  }

  isNonZeroTransfer(t: Transfer): boolean {
    return this.getConnectorOrAbort().isNonZeroTransfer(t);
  }
}

export * from "./Blockchain";
