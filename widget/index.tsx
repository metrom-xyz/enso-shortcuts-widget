import SwapWidget from "@/components/SwapWidget";
import { Address, WidgetProps } from "@/types";
import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  SystemConfig,
} from "@chakra-ui/react";
import { useStore } from "@/store";
import { useEffect, useMemo } from "react";

export { type SystemConfig };

export default ({
  apiKey,
  obligatedTokenOut,
  obligatedChainId,
  themeConfig,
}: WidgetProps & { themeConfig?: SystemConfig; obligatedChainId?: number }) => {
  const { setObligatedChainId } = useStore();

  const system = useMemo(
    () =>
      createSystem(defaultConfig, themeConfig, {
        disableLayers: true,
      }),
    [themeConfig],
  );

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
