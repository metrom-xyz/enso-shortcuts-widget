import React, { ComponentProps, useMemo } from "react";
import Providers from "@/components/Providers";
import { isAddress } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import SwapWidget from "@ensofinance/shortcuts-widget";

import "@rainbow-me/rainbowkit/styles.css";
import "./App.css";

const EnsoApiKey = import.meta.env.VITE_ENSO_API_KEY;

function App() {
  const props = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenInParam = searchParams.get("tokenIn");
    const tokenOutParam = searchParams.get("tokenOut");
    const chainIdParam = searchParams.get("chainId");

    const props: ComponentProps<typeof SwapWidget> = {
      apiKey: EnsoApiKey,
      enableShare: true,
      indicateRoute: true,
    };

    if (chainIdParam) {
      props.chainId = parseInt(chainIdParam);
      if (isAddress(tokenInParam)) props.tokenIn = tokenInParam;
      if (isAddress(tokenOutParam)) props.tokenOut = tokenOutParam;
    }

    return props;
  }, []);

  return (
    <Providers>
      <div style={{ flexDirection: "column", display: "flex", height: "100%" }}>
        <div
          style={{
            position: "absolute",
            top: "1%",
            right: "10%",
          }}
        >
          <ConnectButton />
        </div>
        <div>
          {/*
          TODO: Integration point, should integrate a widget here
          */}
          <SwapWidget {...props} />
        </div>
      </div>
    </Providers>
  );
}

export default App;
