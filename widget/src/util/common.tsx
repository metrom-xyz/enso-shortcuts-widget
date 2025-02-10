import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import { Address } from "viem";
import {
  CHAINS_ETHERSCAN,
  CHAINS_NATIVE_TOKENS,
  GECKO_CHAIN_NAMES,
  SupportedChainId,
} from "@/constants";
import tokenList from "../tokenList";
import { useStore } from "@/store";

export type Token = {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  underlyingTokens?: Token[];
};

export const compareCaseInsensitive = (a: string, b: string) => {
  return !!(a && b && a?.toLowerCase() === b?.toLowerCase());
};

const MOCK_ARRAY = [];

const getGeckoList = (chainId: SupportedChainId) =>
  fetch(`https://tokens.coingecko.com/${GECKO_CHAIN_NAMES[chainId]}/all.json`)
    .then((res) => res.json())
    .then((data) => data?.tokens);

const getOogaboogaList: () => Promise<Token[]> = () =>
  fetch(
    "https://mainnet.internal.oogabooga.io/token-list/tokens?chainId=80094&client=SWAP",
  )
    .then((res) => res.json())
    .then((data) =>
      data.map((token) => ({
        ...token,
        logoURI: token.tokenURI,
        address: token.address.toLowerCase(),
      })),
    );

const getOneInchTokenList = (chainId: number) =>
  fetch("https://tokens.1inch.io/v1.2/" + chainId)
    .then((res) => res.json())
    .catch(() => tokenList[chainId]);

const getCurrentChainList = (chainId: SupportedChainId) => {
  let getters: Promise<Token[] | undefined>[] = [];

  switch (chainId) {
    case SupportedChainId.BERACHAIN:
      getters = [getOogaboogaList(), getGeckoList(chainId)];
      break;
    default:
      getters = [getGeckoList(chainId)];
  }

  return Promise.allSettled(getters).then((results) => {
    const tokens = results
      .filter(
        (result): result is PromiseFulfilledResult<Token[]> =>
          result.status === "fulfilled",
      )
      .flatMap((result) => result.value);
    if (results.length === 1) return tokens;

    return Object.values(
      tokens.reduce(
        (acc, token) => {
          acc[token.address] = token;
          return acc;
        },
        {} as Record<string, Token>,
      ),
    );
  });
};

export const useCurrentChainList = () => {
  const chainId = usePriorityChainId();

  const { data } = useQuery<Token[] | undefined>({
    queryKey: ["tokenList", chainId],
    queryFn: () => getCurrentChainList(chainId),
    enabled: !!chainId,
  });

  if (data) {
    return [CHAINS_NATIVE_TOKENS[chainId], ...data];
  }

  return MOCK_ARRAY;
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
  const data = useCurrentChainList();

  return data?.find((token) => token.address == tokenAddress);
};

export const usePriorityChainId = () => {
  const obligatedChainId = useStore((state) => state.obligatedChainId);
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

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const getChainName = (chainId: SupportedChainId) => {
  const geckoName = GECKO_CHAIN_NAMES[chainId];

  return capitalize(geckoName).split("-")[0];
};
