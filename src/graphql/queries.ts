export const GET_WHITELISTED_ASSETS = `
  query GetWhitelistedAssets($ownership: Bytes) {
    whitelistedAssets(where: { ownership: $ownership }) {
      id
      address
      ownership {
        id
      }
    }
  }
`;
