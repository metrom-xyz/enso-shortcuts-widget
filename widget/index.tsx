import { useEffect, useMemo, useState } from "react";
import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  SystemConfig,
  EnvironmentProvider,
} from "@chakra-ui/react";
import { Address } from "viem";
import root from "react-shadow/emotion";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import SwapWidget from "@/components/SwapWidget";
import { useStore } from "@/store";
import { setApiKey } from "@/util/enso";
import { WidgetProps } from "@/types";

export { type SystemConfig };

const varRoot = ":host";

export default ({
  apiKey,
  tokenOut,
  tokenIn,
  chainId,
  themeConfig,
  enableShare,
  obligateSelection,
  indicateRoute,
}: WidgetProps & {
  apiKey: string;
  themeConfig?: SystemConfig;
  chainId?: number;
}) => {
  const [shadow, setShadow] = useState<HTMLElement | null>(null);
  const [cache, setCache] = useState<ReturnType<typeof createCache> | null>(
    null,
  );

  useEffect(() => {
    if (!shadow?.shadowRoot || cache) return;
    const emotionCache = createCache({
      key: "root",
      container: shadow.shadowRoot,
    });
    setCache(emotionCache);
  }, [shadow, cache]);

  const { setObligatedChainId } = useStore();

  const system = useMemo(
    () =>
      createSystem(defaultConfig, themeConfig, {
        cssVarsRoot: varRoot,
        preflight: { scope: varRoot },
        conditions: {
          light: `${varRoot} &, .light &`,
        },
        globalCss: {
          [varRoot]: defaultConfig.globalCss?.html ?? {},
        },
      }),
    [themeConfig],
  );

  useEffect(() => {
    setObligatedChainId(chainId);
  }, [chainId]);

  // initialize client with key before it is used
  useEffect(() => {
    if (apiKey) setApiKey(apiKey);
    else alert("Provide Enso API key to the widget");
  }, []);

  return (
    <root.div ref={setShadow}>
      {shadow && cache && (
        <EnvironmentProvider value={() => shadow.shadowRoot ?? document}>
          <CacheProvider value={cache}>
            <ChakraProvider value={system}>
              <SwapWidget
                indicateRoute={indicateRoute}
                obligateSelection={obligateSelection}
                tokenIn={tokenIn?.toLowerCase() as Address}
                tokenOut={tokenOut?.toLowerCase() as Address}
                enableShare={enableShare}
              />
            </ChakraProvider>
          </CacheProvider>
        </EnvironmentProvider>
      )}
    </root.div>
  );
};
