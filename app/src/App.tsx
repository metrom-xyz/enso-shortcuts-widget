import React from "react";
import Providers from "@/components/Providers";
import SwapWidget from "@ensofinance/shortcuts-widget";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import "@rainbow-me/rainbowkit/styles.css";
import "./App.css";

const EnsoApiKey = import.meta.env.VITE_ENSO_API_KEY;

function App() {
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
          <SwapWidget apiKey={EnsoApiKey} />
        </div>
      </div>
    </Providers>
  );
}

export default App;
