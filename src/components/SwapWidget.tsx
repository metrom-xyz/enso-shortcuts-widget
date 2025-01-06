import React, { useRef, useState } from "react";
import { arbitrum, base, mainnet } from "viem/chains";
import { useEnsoApprove, useEnsoQuote } from "@/util/enso";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { Flex, Link, Text } from "@chakra-ui/react";
import { useTokenFromList } from "@/util/common";
import { denormalizeValue, formatNumber, normalizeValue } from "@/util";
import SwapInput from "@/components/SwapInput";
import { Button } from "@/components/ui/button";
import { useApproveIfNecessary, useSendEnsoTransaction } from "@/util/wallet";
import { Address } from "@/types";

const USDC_ADDRESS: Record<number, Address> = {
  [mainnet.id]: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  [arbitrum.id]: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  [base.id]: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
};

const SwapWidget = () => {
  const [tokenIn, setTokenIn] = useState<Address>(USDC_ADDRESS[base.id]);
  const [valueIn, setValueIn] = useState("");
  const chainId = useChainId();
  const { address } = useAccount();
  const [tokenOut, setTokenOut] = useState<Address>();
  const { switchChain } = useSwitchChain();

  const tokenInInfo = useTokenFromList(tokenIn);
  const tokenOutInfo = useTokenFromList(tokenOut);

  const amountIn = denormalizeValue(
    valueIn ? +valueIn : 0,
    tokenInInfo?.decimals,
  );

  const { data: quoteData, isFetching: quoteLoading } = useEnsoQuote({
    chainId,
    fromAddress: address,
    amountIn,
    tokenIn,
    tokenOut,
    routingStrategy: "router",
  });
  const valueOut = formatNumber(
    normalizeValue(+quoteData?.amountOut, tokenOutInfo?.decimals),
    true,
  );
  const approveData = useEnsoApprove(tokenIn, amountIn);
  const approve = useApproveIfNecessary(
    tokenIn,
    approveData.data?.spender,
    amountIn,
  );
  const { sendTransaction: sendData } = useSendEnsoTransaction(
    amountIn,
    tokenOut,
    tokenIn,
    3000,
  );
  const approveNeeded = !!approve && +amountIn > 0 && !!tokenIn;

  const wrongChain = false;

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Flex
      flexDirection={"column"}
      layerStyle={"outline.subtle"}
      p={5}
      h={450}
      ref={containerRef}
      overflow={"hidden"}
    >
      <Text>You pay</Text>
      <SwapInput
        containerRef={containerRef}
        tokenValue={tokenIn}
        tokenOnChange={setTokenIn}
        inputValue={valueIn}
        inputOnChange={setValueIn}
      />

      <Text>You receive</Text>
      <SwapInput
        disabled
        loading={quoteLoading}
        containerRef={containerRef}
        tokenValue={tokenOut}
        tokenOnChange={setTokenOut}
        inputValue={valueOut}
        inputOnChange={() => {}}
      />

      <Flex w={"full"} gap={4}>
        {wrongChain ? (
          <Button
            bg="gray.solid"
            _hover={{ bg: "blackAlpha.solid" }}
            onClick={() => switchChain({ chainId: base.id })}
          >
            Switch to Base
          </Button>
        ) : (
          approveNeeded && (
            <Button
              flex={1}
              loading={approve.isLoading}
              // colorPalette={"gray"}
              variant={"subtle"}
              onClick={approve.write}
            >
              Approve
            </Button>
          )
        )}
        <Button
          flex={1}
          variant={"outline"}
          // variant="solid"
          // disabled={!!approve || wrongChain || !(+valueIn > 0)}
          // colorPalette={"gray"}
          loading={sendData.isLoading}
          onClick={sendData.send}
        >
          Swap
        </Button>
      </Flex>

      <Flex h={"full"} flexDirection={"column"} justifyContent={"flex-end"}>
        <Text color={"gray.500"}>
          Powered by <Link href={"https://www.enso.finance/"}>Enso</Link>
        </Text>
      </Flex>
    </Flex>
  );
};

export default SwapWidget;
