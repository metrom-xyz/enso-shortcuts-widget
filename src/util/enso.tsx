import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { EnsoClient, RouteParams, QuoteParams } from "@ensofinance/sdk";
import { isAddress } from "@/util";

const ENSO_API_KEY = import.meta.env.VITE_ENSO_API_KEY as string;
const ensoClient = new EnsoClient({
  // baseURL: "http://localhost:3000/api/v1",
  apiKey: ENSO_API_KEY,
});

export const useEnsoApprove = (tokenAddress: Address, amount: string) => {
  const { address } = useAccount();
  const chainId = useChainId();

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
  return useQuery({
    queryKey: [
      "enso-router",
      params.chainId,
      params.fromAddress,
      params.amountIn,
      params.tokenIn,
      params.tokenOut,
    ],
    queryFn: () => ensoClient.getRouterData(params),
    enabled:
      +params.amountIn > 0 &&
      isAddress(params.fromAddress) &&
      isAddress(params.tokenIn) &&
      isAddress(params.tokenOut),
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
  const chainId = useChainId();

  return useQuery({
    queryKey: ["enso-balances", chainId, address],
    queryFn: () =>
      ensoClient.getBalances({ useEoa: true, chainId, eoaAddress: address }),
    enabled: !!address,
  });
};
