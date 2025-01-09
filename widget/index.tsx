import SwapWidget from "@/components/SwapWidget";
import { Address, WidgetProps } from "@/types";
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { useStore } from "@/store";
import { useEffect } from "react";

export const system = createSystem(defaultConfig, {
  disableLayers: true,
});

export default ({
  apiKey,
  obligatedTokenOut,
  obligatedChainId,
}: WidgetProps) => {
  const { setObligatedChainId } = useStore();

  useEffect(() => {
    setObligatedChainId(obligatedChainId);
  }, [obligatedChainId]);

  return (
    <ChakraProvider value={system}>
      <SwapWidget
        apiKey={apiKey}
        obligatedTokenOut={obligatedTokenOut?.toLowerCase() as Address}
      />
    </ChakraProvider>
  );
};
