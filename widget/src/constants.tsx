export const ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export const ETH_TOKEN = {
  address: ETH_ADDRESS,
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
  logoURI:
    "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
};

export enum SupportedChainId {
  MAINNET = 1,
  ARBITRUM_ONE = 42161,
  OPTIMISM = 10,
  POLYGON = 137,
  BSC = 56,
  BOBA = 288,
  BASE = 8453,
  BLAST = 81457,
  SCROLL = 534352,
  LINEA = 59144,
  // ARBITRUM_RINKEBY = 421611,
  // OPTIMISM_GOERLI = 420,
  // GOERLI = 5,
  // POLYGON_MUMBAI = 80001,
  // CELO = 42220,
  // CELO_ALFAJORES = 44787,
}

export const GECKO_CHAIN_NAMES: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: "ethereum",
  [SupportedChainId.ARBITRUM_ONE]: "arbitrum-one",
  [SupportedChainId.OPTIMISM]: "optimistic-ethereum",
  [SupportedChainId.POLYGON]: "polygon-pos",
  [SupportedChainId.BOBA]: "boba",
  [SupportedChainId.BASE]: "base",
  [SupportedChainId.BSC]: "binance-smart-chain",
  [SupportedChainId.BLAST]: "blast",
  [SupportedChainId.SCROLL]: "scroll",
  [SupportedChainId.LINEA]: "linea",
};

export const MOCK_IMAGE_URL =
  "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png";

export const CHAINS_ETHERSCAN: Record<SupportedChainId, string> = {
  [SupportedChainId.OPTIMISM]: "https://optimistic.etherscan.io",
  [SupportedChainId.MAINNET]: "https://etherscan.io",
  [SupportedChainId.ARBITRUM_ONE]: "https://arbiscan.io",
  [SupportedChainId.POLYGON]: "https://polygonscan.com",
  [SupportedChainId.BSC]: "https://bscscan.com",
  [SupportedChainId.BOBA]: "https://bobascan.com",
  [SupportedChainId.BASE]: "https://basescan.org",
  [SupportedChainId.BLAST]: "https://blastscan.io",
  [SupportedChainId.SCROLL]: "https://scrollscan.com",
  [SupportedChainId.LINEA]: "https://lineascan.build",
};
