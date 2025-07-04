import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useSendTransaction,
  UseSendTransactionReturnType,
  UseSimulateContractParameters,
  useWaitForTransactionReceipt,
  UseWaitForTransactionReceiptReturnType,
  useWriteContract,
  UseWriteContractReturnType,
} from "wagmi";
import { Address, BaseError, isAddress } from "viem";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RouteData } from "@ensofinance/sdk";
import {
  useEtherscanUrl,
  usePriorityChainId,
  useTokenFromList,
} from "./common";
import erc20Abi from "@/erc20Abi.json";
import { ETH_ADDRESS, SupportedChainId } from "@/constants";
import {
  compareCaseInsensitive,
  formatNumber,
  normalizeValue,
} from "@/util/index";
import { toaster } from "@/components/ui/toaster";

enum TxState {
  Success,
  Failure,
  Pending,
}

export const toastState: Record<TxState, "success" | "error" | "info"> = {
  [TxState.Success]: "success",
  [TxState.Failure]: "error",
  [TxState.Pending]: "info",
};

const useInterval = (callback: () => void, interval: number) => {
  const savedCallback = useCallback(callback, []);

  useEffect(() => {
    const id = setInterval(savedCallback, interval);
    return () => clearInterval(id);
  }, [interval, savedCallback]);
};
const useChangingIndex = () => {
  const [index, setIndex] = useState(0);

  useInterval(() => {
    setIndex(index + 1);
  }, 10000);

  return index;
};

export const useErc20Balance = (
  tokenAddress: `0x${string}`,
  priorityChainId?: SupportedChainId
) => {
  const { address } = useAccount();
  const chainId = usePriorityChainId(priorityChainId);

  return useReadContract({
    chainId,
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled:
        isAddress(address) &&
        isAddress(tokenAddress) &&
        !compareCaseInsensitive(tokenAddress, ETH_ADDRESS),
    },
  });
};

// if token is native ETH, use usBalance instead
export const useTokenBalance = (
  token: Address,
  priorityChainId?: SupportedChainId
) => {
  const { address } = useAccount();
  const chainId = usePriorityChainId(priorityChainId);
  const index = useChangingIndex();
  const queryClient = useQueryClient();
  const { data: erc20Balance, queryKey: erc20QueryKey } = useErc20Balance(
    token,
    priorityChainId
  );
  const { data: balance, queryKey: balanceQueryKey } = useBalance({
    address,
    chainId,
    query: {
      enabled: compareCaseInsensitive(token, ETH_ADDRESS),
    },
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: erc20QueryKey });
    queryClient.invalidateQueries({ queryKey: balanceQueryKey });
  }, [index, queryClient, erc20QueryKey, balanceQueryKey]);

  const value = compareCaseInsensitive(token, ETH_ADDRESS)
    ? balance?.value
    : erc20Balance;

  return value?.toString() ?? "0";
};

export const useAllowance = (token: Address, spender: Address) => {
  const { address } = useAccount();
  const chainId = usePriorityChainId();
  const index = useChangingIndex();
  const queryClient = useQueryClient();
  const { data, queryKey } = useReadContract({
    chainId,
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address, spender],
    query: {
      enabled:
        isAddress(address) &&
        isAddress(token) &&
        !compareCaseInsensitive(token, ETH_ADDRESS),
    },
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [index, queryClient, queryKey]);

  return data?.toString() ?? "0";
};

export const useApprove = (token: Address, target: Address, amount: string) => {
  const [tokenData] = useTokenFromList(token);
  const chainId = usePriorityChainId();

  return {
    title: `Approve ${formatNumber(normalizeValue(amount, tokenData?.decimals))} of ${tokenData?.symbol} for spending`,
    args: {
      chainId,
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      args: [target, amount],
    },
  };
};

export const useExtendedContractWrite = (
  title: string,
  writeContractVariables: UseSimulateContractParameters
) => {
  const contractWrite = useWatchWriteTransactionHash(title);

  const write = useCallback(() => {
    if (
      writeContractVariables.address &&
      writeContractVariables.abi &&
      writeContractVariables.functionName
    ) {
      // @ts-ignore
      contractWrite.writeContract(writeContractVariables, {
        onError: (error: BaseError) => {
          toaster.create({
            title: "Error",
            description: error?.shortMessage || error.message,
            type: "error",
          });
          console.error(error);
        },
      });
    }
  }, [contractWrite, writeContractVariables]);

  return {
    ...contractWrite,
    write,
  };
};

enum LayerZeroStatus {
  Pending = "PENDING",
  Success = "SUCCEEDED",
  Failed = "FAILED",
  Inflight = "INFLIGHT",
  Confirming = "CONFIRMING",
  Delivered = "DELIVERED",
}

const useLayerZeroUrl = (hash?: `0x${string}`, reset?: () => void) => {
  const [loadingToastId, setLoadingToastId] = useState<string>();
  const { data } = useQuery({
    queryKey: ["layerZeroUrl", hash || "none", !!reset],
    queryFn: async () => {
      if (!hash) return null;
      return fetch(`https://scan.layerzero-api.com/v1/messages/tx/${hash}`)
        .then((res) => res.json())
        .then((res) => res.data[0]);
    },
    refetchInterval: 2000,
    enabled: !!(reset && hash),
  });

  useEffect(() => {
    if (!hash) return;

    console.log(loadingToastId, data, hash);

    const action = {
      label: "View on Explorer",
      onClick: () =>
        window.open(`https://layerzeroscan.com/tx/${hash}`, "_blank"),
    };

    if (!loadingToastId) {
      setLoadingToastId(hash);
      toaster.create({
        id: hash,
        title: "Pending (0/4)",
        description: "Waiting for source transaction completion",
        type: "loading",
        action,
      });
    } else if (
      data?.source?.status &&
      data.source.status !== LayerZeroStatus.Success
    ) {
      toaster.update(loadingToastId, {
        title: "Pending (1/4)",
        description: "Waiting for funds to be sent on destination",
      });
    } else if (data?.status?.name === LayerZeroStatus.Delivered) {
      reset?.();
      toaster.update(loadingToastId, {
        title: "Success (4/4) ",
        description: "Bridging is complete",
        type: "success",
        action,
      });
      setLoadingToastId(undefined);
    } else if (data?.status?.name === LayerZeroStatus.Confirming) {
      toaster.update(loadingToastId, {
        title: "Pending (3/4)",
        description: "Waiting for destination execution",
      });
    } else if (data?.status?.name === LayerZeroStatus.Inflight) {
      toaster.update(loadingToastId, {
        title: "Pending (2/4)",
        description: "Waiting for funds to be delivered on destination",
      });
    }
  }, [data, hash]);
};

const useSingleChainTransactionTracking = (
  hash: `0x${string}` | undefined,
  description: string,
  waitForTransaction: UseWaitForTransactionReceiptReturnType,
  reset: () => void
) => {
  const [loadingToastId, setLoadingToastId] = useState<string | undefined>();
  const link = useEtherscanUrl(hash);

  // toast error if tx failed to be mined and success if it is having confirmation
  useEffect(() => {
    if (!reset) return;

    if (waitForTransaction.error) {
      toaster.update(hash, {
        title: "Error",
        description: waitForTransaction.error.message,
        type: "error",
        action: link
          ? {
              label: "View on Explorer",
              onClick: () => window.open(link, "_blank"),
            }
          : undefined,
      });
    } else if (waitForTransaction.data) {
      // Close loading toast if it exists
      setLoadingToastId(undefined);
      // reset tx hash to eliminate recurring notifications
      reset();

      toaster.update(loadingToastId, {
        title: "Success",
        description: description,
        type: "success",
        action: link
          ? {
              label: "View on Explorer",
              onClick: () => window.open(link, "_blank"),
            }
          : undefined,
      });
    } else if (waitForTransaction.isLoading) {
      if (!loadingToastId) {
        toaster.create({
          id: hash,
          title: "Transaction Pending",
          description: description,
          type: "loading",
          action: link
            ? {
                label: "View on Explorer",
                onClick: () => window.open(link, "_blank"),
              }
            : undefined,
        });
        setLoadingToastId(hash);
      }
    }
  }, [
    waitForTransaction.data,
    waitForTransaction.error,
    waitForTransaction.isLoading,
    description,
    link,
    reset,
  ]);
};

const useWatchTransactionHash = <
  T extends UseSendTransactionReturnType | UseWriteContractReturnType,
>(
  usedWriteContract: T,
  description: string,
  crosschain?: boolean
) => {
  // const addRecentTransaction = useAddRecentTransaction();
  const { data: hash, reset } = usedWriteContract;

  // useEffect(() => {
  //   if (hash) addRecentTransaction({ hash, description });
  // }, [hash]);

  const waitForTransaction = useWaitForTransactionReceipt({
    hash,
  });

  useLayerZeroUrl(hash, crosschain && reset);
  useSingleChainTransactionTracking(
    hash,
    description,
    waitForTransaction,
    !crosschain && reset
  );

  const writeLoading = usedWriteContract.status === "pending";

  return {
    ...usedWriteContract,
    isLoading: writeLoading || waitForTransaction.isLoading,
    walletLoading: writeLoading,
    txLoading: waitForTransaction.isLoading,
    waitData: waitForTransaction.data,
  };
};

export const useWatchSendTransactionHash = (
  title: string,
  crosschain?: boolean
) => {
  const sendTransaction = useSendTransaction();

  return useWatchTransactionHash(sendTransaction, title, crosschain);
};

const useWatchWriteTransactionHash = (description: string) => {
  const writeContract = useWriteContract();

  return useWatchTransactionHash(writeContract, description);
};

export const useExtendedSendTransaction = ({
  title,
  args,
  onSuccess,
  crosschain,
}: {
  title: string;
  args: UseSimulateContractParameters;
  onSuccess?: (hash: string) => void;
  crosschain?: boolean;
}) => {
  const sendTransaction = useWatchSendTransactionHash(title, crosschain);

  const send = useCallback(() => {
    sendTransaction.sendTransaction(args, {
      onError: (error) => {
        toaster.create({
          title: "Error",
          // @ts-ignore
          description: error?.cause?.shortMessage || error.message,
          type: "error",
        });
        console.error(error);
      },
      onSuccess,
    });
  }, [sendTransaction, args, onSuccess]);

  return {
    ...sendTransaction,
    send,
  };
};

export const useApproveIfNecessary = (
  tokenIn: Address,
  target: Address,
  amount: string
) => {
  const allowance = useAllowance(tokenIn, target);
  const approveData = useApprove(tokenIn, target, amount);
  const writeApprove = useExtendedContractWrite(
    approveData.title,
    approveData.args
  );

  if (tokenIn === ETH_ADDRESS) return undefined;

  return +allowance < +amount ? writeApprove : undefined;
};

export const useSendEnsoTransaction = ({
  args,
  title,
  crosschain,
  onSuccess,
}: {
  args: RouteData["tx"];
  title: string;
  crosschain?: boolean;
  onSuccess?: (hash: string) => void;
}) => {
  return useExtendedSendTransaction({
    title,
    args,
    crosschain,
    onSuccess,
  });
};
