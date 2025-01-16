import { useEffect, useMemo } from "react";
import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  SystemConfig,
} from "@chakra-ui/react";
import { Address } from "viem";
import SwapWidget from "@/components/SwapWidget";
import { useStore } from "@/store";
import { WidgetProps } from "@/types";

export { type SystemConfig };

export default ({
  apiKey,
  tokenOut,
  tokenIn,
  chainId,
  themeConfig,
  enableShare,
  obligateSelection,
}: WidgetProps & {
  themeConfig?: SystemConfig;
  chainId?: number;
  shareRoute?: boolean;
}) => {
  const { setObligatedChainId } = useStore();

  const system = useMemo(
    () =>
      createSystem(defaultConfig, themeConfig, {
        disableLayers: true,
      }),
    [themeConfig],
  );

  useEffect(() => {
    setObligatedChainId(chainId);
  }, [chainId]);

  return (
    <ChakraProvider value={system}>
      <SwapWidget
        obligateSelection={obligateSelection}
        apiKey={apiKey}
        tokenIn={tokenIn?.toLowerCase() as Address}
        tokenOut={tokenOut?.toLowerCase() as Address}
        enableShare={enableShare}
      />
    </ChakraProvider>
  );
};
