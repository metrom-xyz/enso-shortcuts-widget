import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {
  base,
  mainnet,
  arbitrum,
  bsc,
  linea,
  avalanche,
  optimism,
  zksync,
  gnosis,
  polygon,
  berachain,
  sonic,
  ink,
  soneium,
  unichain,
  plumeMainnet,
} from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import React from "react";

const berachainWithIcon = {
  ...berachain,
  iconUrl:
    "https://assets.coingecko.com/coins/images/25235/large/BERA.png?1738822008",
};
const sonicWithIcon = {
  ...sonic,
  iconUrl:
    "https://assets.coingecko.com/coins/images/38108/large/200x200_Sonic_Logo.png",
};
const plumeWithIcon = {
  ...plumeMainnet,
  iconUrl:
    "https://assets.coingecko.com/coins/images/53623/large/plume-token.png?1736896935",
};

const soneiumWithIcon = {
  ...soneium,
  name: "Soneium",
  iconUrl:
    "https://assets.coingecko.com/asset_platforms/images/22200/large/soneium-removebg-preview.png?1737099934",
};

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains: [
    mainnet,
    base,
    arbitrum,
    berachainWithIcon,
    sonicWithIcon,
    unichain,
    optimism,
    soneiumWithIcon,
    bsc,
    zksync,
    avalanche,
    gnosis,
    polygon,
    linea,
    ink,
    plumeWithIcon,
  ],
});
const queryClient = new QueryClient();

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Providers;
