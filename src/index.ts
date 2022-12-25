import { BigNumber, Wallet } from "ethers";

import { Blockchain } from "./Blockchain";
import { CurraConnector } from "./CurraConnector";
import { CurraCoordinator } from "./CurraCoordinator";
import { Subraph } from "./Subgraph";
import { Transfer } from "./types";

export class Curra {
  private readonly connector?: CurraConnector;
  private readonly ownershipId?: BigNumber;
  private readonly destination?: string;
  private readonly coordinator: CurraCoordinator;
  private readonly subgraph: Subraph;
  private readonly wallet: Wallet;

  constructor(
    public readonly blockchain: Blockchain,
    options: {
      privateKey: string;
      destination?: string;
      ownershipId?: string;
      connectorUrl?: string;
      coordinatorUrl?: string;
      subgraphUrl?: string;
    }
  ) {
    if (options?.connectorUrl) {
      this.connector = new CurraConnector(options.connectorUrl);
    }
    this.destination = options.destination;
    this.ownershipId = options.ownershipId
      ? BigNumber.from(options.ownershipId)
      : undefined;
    this.wallet = new Wallet(options?.privateKey);
    this.coordinator = new CurraCoordinator(
      options.coordinatorUrl ?? `https://${blockchain}.coordinator.curra.io`,
      this.wallet
    );
    this.subgraph = new Subraph(
      options.subgraphUrl ??
        `https://thegraph.${blockchain}.network.curra.io/subgraphs/name/curra`
    );
  }

  getOwnershipId(ownershipId?: string): BigNumber {
    const value = ownershipId ? BigNumber.from(ownershipId) : this.ownershipId;
    if (!value)
      throw new Error(
        "Ownership id should be provided in Curra class ctor or in method argument"
      );

    return value;
  }

  getDestionation(destination?: string): string {
    const value = this.destination ?? destination;
    if (!value)
      throw new Error(
        "Destination address should be provided in Curra class ctor or in method argument"
      );
    return value;
  }

  getConnector(): CurraConnector | undefined {
    return this.connector;
  }

  getCoordinator(): CurraCoordinator | undefined {
    return this.coordinator;
  }

  async getNextAddress({
    ownershipId,
    destination,
  }: { ownershipId?: string; destination?: string } = {}) {
    const address = await this.coordinator.getNextAddress(
      this.getOwnershipId(ownershipId),
      this.getDestionation(destination)
    );
    await this.connector?.importAddress(address);
    return address;
  }

  async getAddress(
    salt: number,
    { ownershipId, destination }: { ownershipId?: string; destination?: string }
  ) {
    const address = await this.coordinator.getAddress(
      salt,
      this.getOwnershipId(ownershipId),
      this.getDestionation(destination)
    );
    await this.connector?.importAddress(address);
    return address;
  }

  async syncWhitelistedAssets(ownershipId?: string): Promise<void> {
    if (!this.connector)
      throw new Error(
        "To use this method provide connector url in ctor options"
      );
    const assets = await this.subgraph.getWhitelisedAssets(
      this.getOwnershipId(ownershipId)
    );

    for (const t of assets) {
      await this.connector?.importToken(t.address);
    }
  }

  async syncAddresses(ownershipId?: string): Promise<void> {
    if (!this.connector)
      throw new Error(
        "To use this method provide connector url in ctor options"
      );
    const limit = 10;
    const tokens = await this.coordinator.getForwarders(
      this.getOwnershipId(ownershipId),
      limit,
      0
    );
    while (tokens.count > tokens.entities.length) {
      const more = await this.coordinator.getForwarders(
        this.getOwnershipId(ownershipId),
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
    await Promise.all([this.syncAddresses(), this.syncWhitelistedAssets()]);
  }

  private getConnectorOrAbort(): CurraConnector {
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
export * from "./types";
export * from "./errors";
export * from "./CurraConnector";
export * from "./CurraCoordinator";
