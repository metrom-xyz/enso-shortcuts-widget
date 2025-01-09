import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useSendTransaction,
  UseSendTransactionReturnType,
  useSimulateContract,
  UseSimulateContractParameters,
  useWaitForTransactionReceipt,
  useWriteContract,
  UseWriteContractReturnType,
} from "wagmi";
import { BaseError } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import {
  useEtherscanUrl,
  usePriorityChainId,
  useTokenFromList,
} from "./common";
import erc20Abi from "@/erc20Abi.json";
import { useEnsoRouterData } from "./enso";
import { RouteParams } from "@ensofinance/sdk";
import { ETH_ADDRESS } from "@/constants";
import { Address } from "@/types";
import { formatNumber, normalizeValue } from "@/util/index";
import { useStore } from "@/store";
import { NotifyType } from "@/components/Notification";

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
  }, 6000);

  return index;
};

export const useErc20Balance = (tokenAddress: `0x${string}`) => {
  const { address } = useAccount();
  const chainId = usePriorityChainId();

  return useReadContract({
    chainId,
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  });
};

// if token is native ETH, use usBalance instead
export const useTokenBalance = (token: Address) => {
  const { address } = useAccount();
  const { data: erc20Balance } = useErc20Balance(token);
  const { data: balance } = useBalance({ address });

  const value = token === ETH_ADDRESS ? balance?.value : erc20Balance;

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
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [index, queryClient, queryKey]);

  return data?.toString() ?? "0";
};

export const useApprove = (token: Address, target: Address, amount: string) => {
  const tokenData = useTokenFromList(token);
  const chainId = usePriorityChainId();

  return {
    title: `Approve ${formatNumber(normalizeValue(+amount, tokenData?.decimals))} of ${tokenData?.symbol} for spending`,
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
  writeContractVariables: UseSimulateContractParameters,
) => {
  const simulateContract = useSimulateContract(writeContractVariables);
  const contractWrite = useWatchWriteTransactionHash(title);
  const { setNotification } = useStore();

  const write = useCallback(() => {
    if (
      writeContractVariables.address &&
      writeContractVariables.abi &&
      writeContractVariables.functionName
    ) {
      console.log("writeContractVariables", writeContractVariables);
      // @ts-ignore
      contractWrite.writeContract(writeContractVariables, {
        onError: (error: BaseError) => {
          setNotification({
            message: error?.shortMessage || error.message,
            variant: NotifyType.Error,
          });
          console.error(error);
        },
      });
    }
  }, [contractWrite, writeContractVariables]);

  return {
    ...contractWrite,
    write,
    estimateError: simulateContract.error,
  };
};

const useWatchTransactionHash = <
  T extends UseSendTransactionReturnType | UseWriteContractReturnType,
>(
  description: string,
  usedWriteContract: T,
) => {
  // const addRecentTransaction = useAddRecentTransaction();

  const hash = usedWriteContract.data;
  const { setNotification } = useStore();

  // useEffect(() => {
  //   if (hash) addRecentTransaction({ hash, description });
  // }, [hash]);

  const waitForTransaction = useWaitForTransactionReceipt({
    hash,
  });
  const link = useEtherscanUrl(hash);

  const writeLoading = usedWriteContract.status === "pending";

  // toast error if tx failed to be mined and success if it is having confirmation
  useEffect(() => {
    if (waitForTransaction.error) {
      setNotification({
        message: waitForTransaction.error.message,
        variant: NotifyType.Error,
        link,
      });
    } else if (waitForTransaction.data) {
      setNotification({
        message: description,
        variant: NotifyType.Success,
        link,
      });
    } else if (waitForTransaction.isLoading) {
      setNotification({
        message: description,
        variant: NotifyType.Info,
        link,
      });
    }
  }, [
    waitForTransaction.data,
    waitForTransaction.error,
    waitForTransaction.isLoading,
  ]);

  return {
    ...usedWriteContract,
    isLoading: writeLoading || waitForTransaction.isLoading,
    walletLoading: writeLoading,
    txLoading: waitForTransaction.isLoading,
    waitData: waitForTransaction.data,
  };
};

export const useWatchSendTransactionHash = (title: string) => {
  const sendTransaction = useSendTransaction();

  return useWatchTransactionHash(title, sendTransaction);
};

const useWatchWriteTransactionHash = (description: string) => {
  const writeContract = useWriteContract();

  return useWatchTransactionHash(description, writeContract);
};

export const useExtendedSendTransaction = (
  title: string,
  args: UseSimulateContractParameters,
) => {
  const sendTransaction = useWatchSendTransactionHash(title);
  const { setNotification } = useStore();

  const send = useCallback(() => {
    sendTransaction.sendTransaction(args, {
      onError: (error) => {
        setNotification({
          // @ts-ignore
          message: error?.cause?.shortMessage,
          variant: NotifyType.Error,
        });
        console.error(error);
      },
    });
  }, [sendTransaction, args]);

  return {
    ...sendTransaction,
    send,
  };
};

export const useApproveIfNecessary = (
  tokenIn: Address,
  target: Address,
  amount: string,
) => {
  const allowance = useAllowance(tokenIn, target);
  const approveData = useApprove(tokenIn, target, amount);
  const writeApprove = useExtendedContractWrite(
    approveData.title,
    approveData.args,
  );

  if (tokenIn === ETH_ADDRESS) return undefined;

  return +allowance < +amount ? writeApprove : undefined;
};

export const useSendEnsoTransaction = (
  amountIn: string,
  tokenOut: Address,
  tokenIn: Address,
  slippage: number,
) => {
  const { address } = useAccount();
  const chainId = usePriorityChainId();
  const preparedData: RouteParams = {
    fromAddress: address,
    receiver: address,
    spender: address,
    chainId,
    amountIn,
    slippage,
    tokenIn,
    tokenOut,
    routingStrategy: "router",
  };

  const { data: ensoData } = useEnsoRouterData(preparedData);
  const tokenData = useTokenFromList(tokenOut);
  const tokenFromData = useTokenFromList(tokenIn);

  const sendTransaction = useExtendedSendTransaction(
    `Purchase ${formatNumber(normalizeValue(+amountIn, tokenFromData?.decimals))} ${tokenFromData?.symbol} of ${tokenData?.symbol}`,
    ensoData?.tx,
  );

  return {
    sendTransaction,
    ensoData,
  };
};
