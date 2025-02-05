import React, { ComponentProps, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Providers from "@/components/Providers";
import { isAddress } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import SwapWidget from "@ensofinance/shortcuts-widget";

import logoUrl from "./logo_black_white.png";
import wordmarkUrl from "./wordmark_black.png";

import "@rainbow-me/rainbowkit/styles.css";
import "./App.css";

const EnsoApiKey = import.meta.env.VITE_ENSO_API_KEY;

function App() {
  const location = useLocation();
  const props = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenInParam = searchParams.get("tokenIn");
    const tokenOutParam = searchParams.get("tokenOut");
    const chainIdParam = searchParams.get("chainId");

    const props: ComponentProps<typeof SwapWidget> = {
      apiKey: EnsoApiKey,
    };

    if (chainIdParam) {
      props.chainId = parseInt(chainIdParam);
      if (isAddress(tokenInParam)) props.tokenIn = tokenInParam;
      if (isAddress(tokenOutParam)) props.tokenOut = tokenOutParam;
    }

    return props;
  }, [location]);

  useEffect(() => {
    // Set the title of the page from the environment variable
    if (import.meta.env.VITE_APP_TITLE) {
      document.title = `ENSO | ${import.meta.env.VITE_APP_TITLE}`;
    }

    // Set the favicon of the page from the environment variable
    if (import.meta.env.VITE_APP_LOGO_URL) {
      const favicon = document.querySelector("link[rel='icon']");
      if (favicon instanceof HTMLLinkElement) {
        favicon.href = import.meta.env.VITE_APP_LOGO_URL;
      }
    }
  }, []);

  return (
    <Providers>
      <div
        style={{
          flexDirection: "column",
          display: "flex",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          gap: "10px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "1%",
            left: "0%",
            display: "flex",
            width: "100%",
            justifyContent: "space-around",
          }}
        >
          <img src={logoUrl} alt={"Enso"} style={{ height: "50px" }} />

          <ConnectButton />
        </div>

        <img
          src={wordmarkUrl}
          alt={"Enso"}
          style={{ height: "50px", opacity: 0.5 }}
        />

        <SwapWidget {...props} enableShare indicateRoute adaptive />
      </div>
    </Providers>
  );
}

export default App;
