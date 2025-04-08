import { Address } from "viem";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  EnsoClient,
  RouteParams,
  BundleAction,
  BundleParams,
  BundleActionType,
} from "@ensofinance/sdk";
import { isAddress } from "viem";
import { Token, usePriorityChainId, useOutChainId } from "@/util/common";
import { useSendEnsoTransaction } from "@/util/wallet";
import {
  ONEINCH_ONLY_TOKENS,
  SupportedChainId,
  ETH_ADDRESS,
} from "@/constants";

let ensoClient: EnsoClient | null = null;

export const setApiKey = (apiKey: string) => {
  ensoClient = new EnsoClient({
    // baseURL: "http://localhost:3000/api/v1",
    baseURL: "https://shortcuts-backend-dynamic-int.herokuapp.com/api/v1",
    // baseURL: "https://shortcuts-backend-dynamic-dev.herokuapp.com/api/v1",
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

const oftAddress = {
  1: "0x77b2043768d28E9C9aB44E1aBfC95944bcE57931",
  42161: "0xA45B5130f36CDcA45667738e2a258AB09f4A5f7F",
  10: "0xe8CDF27AcD73a434D661C84887215F7598e7d0d3",
};

const useBridgeBundle = (
  {
    tokenIn,
    tokenOut,
    amountIn,
    receiver,
    chainId,
    destinationChainId,
  }: {
    tokenIn: Address;
    tokenOut: Address;
    amountIn: string;
    receiver: Address;
    chainId: SupportedChainId;
    destinationChainId: number;
  },
  enabled = false
) => {
  const bundleActions: BundleAction[] = [
    {
      protocol: "stargate",
      action: BundleActionType.Bridge,
      args: {
        primaryAddress: oftAddress[chainId],
        destinationChainId,
        tokenIn: ETH_ADDRESS,
        amountIn,
        receiver,
        callback: [
          {
            protocol: "enso",
            action: "balance",
            args: {
              token: ETH_ADDRESS,
            },
          },
          ETH_ADDRESS === tokenOut
            ? {
                protocol: "erc20",
                action: "transfer",
                args: {
                  token: ETH_ADDRESS,
                  receiver,
                  amount: {
                    useOutputOfCallAt: 0,
                  },
                },
              }
            : {
                protocol: "enso",
                action: "route",
                slippage: "100",
                args: {
                  tokenIn: ETH_ADDRESS,
                  tokenOut,
                  amountIn: {
                    useOutputOfCallAt: 0,
                  },
                },
              },
        ],
      },
    },
  ];

  if (tokenIn !== ETH_ADDRESS) {
    // @ts-ignore
    bundleActions[0].args.amountIn = {
      useOutputOfCallAt: 0,
    };
    bundleActions.unshift({
      protocol: "enso",
      action: BundleActionType.Route,
      args: {
        tokenIn,
        amountIn,
        tokenOut: ETH_ADDRESS,
      },
    } as BundleAction);
  }

  const { data, isLoading } = useBundleData(
    { chainId, fromAddress: receiver, spender: receiver },
    bundleActions,
    enabled
  );

  const bundleData = {
    tx: data?.tx,
    route: [],
    amountOut: data?.amountsOut?.[tokenOut] || "0",
    gas: data?.gas || "0",
  };

  return {
    data: bundleData,
    isLoading,
  };
};

const useEnsoRouterData = (params: RouteParams, enabled = true) =>
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
      enabled &&
      +params.amountIn > 0 &&
      isAddress(params.fromAddress) &&
      isAddress(params.tokenIn) &&
      isAddress(params.tokenOut) &&
      params.tokenIn !== params.tokenOut,
    retry: 2,
  });

export const useBundleData = (
  bundleParams: BundleParams,
  bundleActions: BundleAction[],
  enabled = true
) => {
  const chainId = usePriorityChainId();

  return useQuery({
    queryKey: ["enso-bundle", chainId, bundleParams, bundleActions],
    queryFn: () => ensoClient.getBundleData(bundleParams, bundleActions),
    enabled:
      enabled &&
      bundleActions.length > 0 &&
      isAddress(bundleParams.fromAddress) &&
      // @ts-ignore
      +(bundleActions[0]?.args?.amountIn as string) > 0,
  });
};

export const useEnsoData = (
  amountIn: string,
  tokenIn: Address,
  tokenOut: Address,
  slippage: number
) => {
  const { address } = useAccount();
  const chainId = usePriorityChainId();
  const outChainId = useOutChainId();
  const routerParams: RouteParams = {
    amountIn,
    tokenIn,
    tokenOut,
    slippage,
    fromAddress: address,
    receiver: address,
    spender: address,
    routingStrategy: "router",
    chainId,
  };

  if (
    ONEINCH_ONLY_TOKENS.includes(tokenIn) ||
    ONEINCH_ONLY_TOKENS.includes(tokenOut)
  ) {
    // @ts-ignore
    routerParams.ignoreAggregators =
      "0x,paraswap,openocean,odos,kyberswap,native,barter";
  }
  let routeOrBundle = outChainId === chainId;

  const { data: routerData, isLoading: routerLoading } = useEnsoRouterData(
    routerParams,
    routeOrBundle
  );

  const { data: bundleData, isLoading: bundleLoading } = useBridgeBundle(
    {
      tokenIn,
      tokenOut,
      amountIn,
      receiver: address,
      chainId,
      destinationChainId: outChainId,
    },
    !routeOrBundle
  );

  const data = routeOrBundle ? routerData : bundleData;
  const isLoading = routeOrBundle ? routerLoading : bundleLoading;

  const sendTransaction = useSendEnsoTransaction(data?.tx, routerParams);

  return {
    data,
    isLoading,
    sendTransaction,
  };
};

export const useEnsoBalances = (priorityChainId?: SupportedChainId) => {
  const { address } = useAccount();
  const chainId = usePriorityChainId(priorityChainId);

  return useQuery({
    queryKey: ["enso-balances", chainId, address],
    queryFn: () =>
      ensoClient.getBalances({ useEoa: true, chainId, eoaAddress: address }),
    enabled: isAddress(address),
  });
};

const useEnsoTokenDetails = ({
  address,
  priorityChainId,
  project,
  protocolSlug,
  enabled = true,
}: {
  address: Address;
  priorityChainId?: SupportedChainId;
  project?: string;
  protocolSlug?: string;
  enabled?: boolean;
}) => {
  const chainId = usePriorityChainId(priorityChainId);

  return useQuery({
    queryKey: ["enso-token-details", address, chainId, protocolSlug, project],
    queryFn: () =>
      ensoClient.getTokenData({
        project,
        protocolSlug,
        address,
        chainId,
        includeMetadata: true,
      }),
    enabled,
  });
};

// fallback to normal token details
export const useEnsoToken = ({
  address,
  priorityChainId,
  project,
  protocolSlug,
  enabled,
}: {
  address?: Address;
  priorityChainId?: SupportedChainId;
  protocolSlug?: string;
  project?: string;
  enabled?: boolean;
}) => {
  const { data } = useEnsoTokenDetails({
    address,
    priorityChainId,
    project,
    protocolSlug,
    enabled,
  });
  // const tokenFromList = useTokenFromList(address, priorityChainId);

  const token: Token[] = useMemo(() => {
    if (!data?.data?.length || !data?.data[0]?.symbol) {
      return [];
    }
    const ensoToken = data.data[0];
    let logoURI = ensoToken.logosUri[0];

    // if (!logoURI) {
    //   if (ensoToken.underlyingTokens?.length === 1)
    //     logoURI = ensoToken.underlyingTokens[0].logosUri[0];
    //   else logoURI = tokenFromList?.logoURI;
    // }

    return data?.data?.map((token) => ({
      ...token,
      address: token?.address.toLowerCase() as Address,
      logoURI: token?.logosUri[0],
      underlyingTokens: token?.underlyingTokens?.map((token) => ({
        ...token,
        address: token?.address.toLowerCase() as Address,
        logoURI: token?.logosUri[0],
      })),
    }));
  }, [data]);

  return token;
};

export const useEnsoPrice = (
  address: Address,
  priorityChainId?: SupportedChainId
) => {
  const chainId = usePriorityChainId(priorityChainId);

  return useQuery({
    queryKey: ["enso-token-price", address, chainId],
    queryFn: () => ensoClient.getPriceData({ address, chainId }),
    enabled: chainId && isAddress(address),
  });
};

export const useEnsoProtocols = () => {
  return useQuery({
    queryKey: ["enso-protocols"],
    queryFn: () => ensoClient.getProtocolData(),
  });
};

export const useChainProtocols = (chainId: SupportedChainId) => {
  const { data } = useEnsoProtocols();

  return data?.filter((protocol) =>
    protocol.chains.some((chain) => chain.id === chainId)
  );
};
