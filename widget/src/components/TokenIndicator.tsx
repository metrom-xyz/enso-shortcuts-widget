import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Token } from "@/util/common";
import { MOCK_IMAGE_URL } from "@/constants";

export const TokenIcon = ({ token }: { token: Token }) => (
  <Box borderRadius={"50%"} overflow={"hidden"}>
    <img
      src={token?.logoURI ?? MOCK_IMAGE_URL}
      title={token?.symbol}
      alt={token?.symbol}
      width={24}
      height={24}
    />
  </Box>
);

export const TokenIndicator = ({ token }: { token: Token }) => (
  <Flex align="center" gap={2}>
    {token.symbol === "UNI-V2" && token.underlyingTokens ? (
      <Box position="relative" width={"24px"} height={"24px"}>
        <Box
          position="absolute"
          width="100%"
          height="100%"
          overflow="hidden"
          clipPath={"polygon(0 0, 45% 0, 45% 100%, 0% 100%)"}
        >
          <TokenIcon token={token.underlyingTokens[0]} />
        </Box>
        <Box
          position="absolute"
          width="100%"
          height="100%"
          overflow="hidden"
          clipPath={"polygon(55% 0, 100% 0, 100% 100%, 55% 100%)"}
        >
          <TokenIcon token={token.underlyingTokens[1]} />
        </Box>
      </Box>
    ) : (
      <TokenIcon token={token} />
    )}
    <Text>{token?.symbol}</Text>
  </Flex>
);
