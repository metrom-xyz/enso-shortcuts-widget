import React from "react";
import { Box, Center, Flex } from "@chakra-ui/react";
import Providers from "@/components/Providers";
import SwapWidget from "@/components/SwapWidget";

import "./App.css";
import "@rainbow-me/rainbowkit/styles.css";

import { ConnectButton } from "@rainbow-me/rainbowkit";

function App() {
  return (
    <Providers>
      <Flex flexDirection={"column"} h={"100%"}>
        <Box position={"absolute"} top={"1%"} right={"10%"}>
          <ConnectButton />
        </Box>
        <Center>
          {/*
          TODO: Integration point, should integrate a widget here
          */}
          <SwapWidget />
        </Center>
      </Flex>
    </Providers>
  );
}

export default App;
