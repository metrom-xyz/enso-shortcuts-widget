import { useEffect } from "react";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { Widget } from "@metrom-xyz/enso-shortcuts-widget";
import logoUrl from "./logo_black_white.png";

import "@rainbow-me/rainbowkit/styles.css";

const EnsoApiKey = import.meta.env.VITE_ENSO_API_KEY;

function App() {
  const { openConnectModal } = useConnectModal();

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
    <>
      <div
        style={{
          position: "fixed",
          width: "100%",
          height: "60px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "5px",
        }}
      >
        <img src={logoUrl} alt={"Enso"} style={{ height: "50px" }} />

        <ConnectButton chainStatus={"none"} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          height: "100%",
        }}
      >
        <div style={{ marginTop: "70px" }}>
          <Widget
            apiKey={EnsoApiKey}
            tokenIn="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
            chainId={1}
            tokenOut="0x2b4b2a06c0fdebd8de1545abdffa64ec26416796"
            outChainId={1}
            enableShare
            onConnectWallet={openConnectModal}
          />
        </div>
        <div />
      </div>
    </>
  );
}

export default App;
