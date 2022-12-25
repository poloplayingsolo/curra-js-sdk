export class CurraConnectorError extends Error {
  constructor(public readonly status?: number, public readonly body?: any) {
    super();
    this.name = "CurraConnectorError";
  }
}
