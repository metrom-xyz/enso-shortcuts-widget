import { Address } from "viem";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { EnsoClient, RouteParams, QuoteParams } from "@ensofinance/sdk";
import { isAddress } from "viem";
import { Token, usePriorityChainId } from "@/util/common";
import { useSendEnsoTransaction } from "@/util/wallet";
import { ONEINCH_ONLY_TOKENS } from "@/constants";

let ensoClient;

export const setApiKey = (apiKey: string) => {
  ensoClient = new EnsoClient({
    // baseURL: "http://localhost:3000/api/v1",
    apiKey,
  });
};

export const useEnsoApprove = (tokenAddress: Address, amount: string) => {
  const { address } = useAccount();
  const chainId = usePriorityChainId();

  return useQuery({
    queryKey: ["enso-approval", tokenAddress, chainId, address, amount],
    queryFn: () =>
      ensoClient.getApprovalData({
        fromAddress: address,
        tokenAddress,
        chainId,
        amount,
      }),
    enabled: +amount > 0 && isAddress(address) && isAddress(tokenAddress),
  });
};

export const useEnsoData = (params: QuoteParams) => {
  if (
    ONEINCH_ONLY_TOKENS.includes(params.tokenIn) ||
    ONEINCH_ONLY_TOKENS.includes(params.tokenOut)
  ) {
    // @ts-ignore
    params.ignoreAggregators =
      "0x,paraswap,openocean,odos,kyberswap,native,barter";
  }

  const routerParams: RouteParams = {
    ...params,
    fromAddress: params.fromAddress,
    receiver: params.fromAddress,
    spender: params.fromAddress,
  };

  const { data: routerData, isLoading: routerLoading } =
    useEnsoRouterData(routerParams);
  const { data: quoteData, isLoading: quoteLoading } = useEnsoQuote(params);

  const sendTransaction = useSendEnsoTransaction(routerData?.tx, params);

  return {
    routerData,
    routerLoading,
    quoteData,
    quoteLoading,
    sendTransaction,
  };
};

const useEnsoRouterData = (params: RouteParams) =>
  useQuery({
    queryKey: [
      "enso-router",
      params.chainId,
      params.fromAddress,
      params.tokenIn,
      params.tokenOut,
      params.amountIn,
    ],
    queryFn: () => ensoClient.getRouterData(params),
    enabled:
      +params.amountIn > 0 &&
      isAddress(params.fromAddress) &&
      isAddress(params.tokenIn) &&
      isAddress(params.tokenOut) &&
      params.tokenIn !== params.tokenOut,
    retry: 2,
  });

const useEnsoQuote = (params: QuoteParams) =>
  useQuery({
    queryKey: [
      "enso-quote",
      params.chainId,
      params.fromAddress,
      params.tokenIn,
      params.tokenOut,
      params.amountIn,
    ],
    queryFn: () => ensoClient.getQuoteData(params),
    enabled:
      +params.amountIn > 0 &&
      isAddress(params.tokenIn) &&
      isAddress(params.tokenOut) &&
      params.tokenIn !== params.tokenOut,
    retry: 2,
  });

export const useEnsoBalances = () => {
  const { address } = useAccount();
  const chainId = usePriorityChainId();

  return useQuery({
    queryKey: ["enso-balances", chainId, address],
    queryFn: () =>
      ensoClient.getBalances({ useEoa: true, chainId, eoaAddress: address }),
    enabled: isAddress(address),
  });
};

const useEnsoTokenDetails = (address: Address) => {
  const chainId = usePriorityChainId();

  return useQuery({
    queryKey: ["enso-token-details", address, chainId],
    queryFn: () =>
      ensoClient.getTokenData({ address, chainId, includeMetadata: true }),
    enabled: isAddress(address),
  });
};

export const useEnsoToken = (address?: Address) => {
  const { data } = useEnsoTokenDetails(address);

  const token: Token | null = useMemo(() => {
    if (!data?.data?.length) return null;
    const ensoToken = data.data[0];
    let logoURI = ensoToken.logosUri[0];

    if (!logoURI && ensoToken.underlyingTokens?.length === 1) {
      logoURI = ensoToken.underlyingTokens[0].logosUri[0];
    }

    return {
      address: ensoToken.address.toLowerCase(),
      symbol: ensoToken.symbol,
      name: ensoToken.name,
      decimals: ensoToken.decimals,
      logoURI,
      underlyingTokens: ensoToken.underlyingTokens?.map((token) => ({
        address: token.address.toLowerCase(),
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.logosUri[0],
      })),
    };
  }, [data]);

  return token;
};

export const useEnsoPrice = (address: Address) => {
  const chainId = usePriorityChainId();

  return useQuery({
    queryKey: ["enso-token-price", address, chainId],
    queryFn: () => ensoClient.getPriceData({ address, chainId }),
    enabled: chainId && isAddress(address),
  });
};
