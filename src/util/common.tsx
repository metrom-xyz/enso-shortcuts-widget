import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import { ETH_ADDRESS, ETH_TOKEN, GECKO_CHAIN_NAMES } from "@/constants";
import { Address } from "@/types";

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
  fetch("https://tokens.1inch.io/v1.2/" + chainId).then((res) => res.json());

export const useGeckoList = () => {
  const chainId = useChainId();
  const chainName = GECKO_CHAIN_NAMES[chainId];

  return useQuery<Token[] | undefined>({
    queryKey: ["tokenList", chainName],
    queryFn: () => getGeckoList(chainName),
    enabled: !!chainName,
  });
};
export const useOneInchTokenList = () => {
  const chainId = useChainId();

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
