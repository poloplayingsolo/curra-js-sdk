import { BigNumber } from "ethers";
import axios from "axios";

import { GET_WHITELISTED_ASSETS } from "./graphql";

export class Subraph {
  constructor(private readonly url: string) {}

  async getWhitelisedAssets(ownershipId: BigNumber): Promise<
    Array<{
      id: string;
      address: string;
      ownership: {
        id: string;
      };
    }>
  > {
    const response = await axios(this.url, {
      method: "post",
      data: {
        query: GET_WHITELISTED_ASSETS,
        variables: { ownershipId: ownershipId.toString() },
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data.data.whitelistedAssets;
  }
}
