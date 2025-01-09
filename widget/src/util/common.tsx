import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import {
  CHAINS_ETHERSCAN,
  ETH_ADDRESS,
  ETH_TOKEN,
  GECKO_CHAIN_NAMES,
} from "@/constants";
import { Address } from "@/types";
import tokenList from "../tokenList";
import { useStore } from "@/store";

export type Token = {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
};

export const compareCaseInsensitive = (a: string, b: string) => {
  return !!(a && b && a?.toLowerCase() === b?.toLowerCase());
};

const getGeckoList = (chainName: string) =>
  fetch(`https://tokens.coingecko.com/${chainName}/all.json`)
    .then((res) => res.json())
    .then((data) => data?.tokens);

const getOneInchTokenList = (chainId: number) =>
  fetch("https://tokens.1inch.io/v1.2/" + chainId)
    .then((res) => res.json())
    .catch(() => tokenList[chainId]);

export const useGeckoList = () => {
  const chainId = usePriorityChainId();
  const chainName = GECKO_CHAIN_NAMES[chainId];

  return useQuery<Token[] | undefined>({
    queryKey: ["tokenList", chainName],
    queryFn: () => getGeckoList(chainName),
    enabled: !!chainName,
  });
};
export const useOneInchTokenList = () => {
  const chainId = usePriorityChainId();

  return useQuery<Record<string, Token> | undefined>({
    queryKey: ["oneInchTokenList", chainId],
    queryFn: () => getOneInchTokenList(chainId),
    enabled: !!chainId,
  });
};

export const useTokenFromList = (tokenAddress: Address) => {
  const { data } = useGeckoList();

  if (tokenAddress === ETH_ADDRESS) return ETH_TOKEN;

  return data?.find((token) =>
    compareCaseInsensitive(token.address, tokenAddress),
  );
};

export const usePriorityChainId = () => {
  const { obligatedChainId } = useStore();
  const chainId = useChainId();

  return obligatedChainId ?? chainId;
};

export const useEtherscanUrl = (
  address: string,
  type: "/address" | "/tx" = "/tx",
) => {
  const chainId = usePriorityChainId();
  const chainPrefix = CHAINS_ETHERSCAN[chainId];

  if (address) return `${chainPrefix}${type}/${address}`;
};
