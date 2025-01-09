import { Address } from "viem";
import { useAccount } from "wagmi";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { EnsoClient, RouteParams, QuoteParams } from "@ensofinance/sdk";
import { isAddress } from "@/util";
import { Token, usePriorityChainId } from "@/util/common";

let ensoClient;

export const setApiKey = (apiKey: string) => {
  ensoClient = new EnsoClient({
    baseURL: "http://localhost:3000/api/v1",
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
    enabled: +amount > 0 && !!address && !!tokenAddress,
  });
};

export const useEnsoRouterData = (params: RouteParams) => {
  const searchParams = useDebounce(
    [
      "enso-router",
      params.amountIn,
      params.chainId,
      params.fromAddress,
      params.tokenIn,
      params.tokenOut,
    ],
    500,
  );

  return useQuery({
    queryKey: searchParams,
    queryFn: () => ensoClient.getRouterData(params),
    enabled:
      +params.amountIn > 0 &&
      isAddress(params.fromAddress) &&
      isAddress(params.tokenIn) &&
      isAddress(params.tokenOut),
    staleTime: 500,
    placeholderData: keepPreviousData,
  });
};

export const useEnsoQuote = (params: QuoteParams) => {
  return useQuery({
    queryKey: [
      "enso-quote",
      params.chainId,
      params.fromAddress,
      params.amountIn,
      params.tokenIn,
      params.tokenOut,
    ],
    queryFn: () => ensoClient.getQuoteData(params),
    enabled:
      +params.amountIn > 0 &&
      isAddress(params.tokenIn) &&
      isAddress(params.tokenOut),
  });
};

export const useEnsoBalances = () => {
  const { address } = useAccount();
  const chainId = usePriorityChainId();

  return useQuery({
    queryKey: ["enso-balances", chainId, address],
    queryFn: () =>
      ensoClient.getBalances({ useEoa: true, chainId, eoaAddress: address }),
    enabled: !!address,
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

export const useEnsoToken = (address: Address) => {
  const { data } = useEnsoTokenDetails(address);

  const token: Token = useMemo(() => {
    if (!data?.data?.length) return null;
    const ensoToken = data.data[0];

    return {
      address: ensoToken.address.toLowerCase(),
      symbol: ensoToken.symbol,
      name: ensoToken.name,
      decimals: ensoToken.decimals,
      logoURI: ensoToken.logosUri[0],
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
