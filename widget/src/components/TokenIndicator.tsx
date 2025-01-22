import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Token } from "@/util/common";
import { MOCK_IMAGE_URL } from "@/constants";

const GECKO_HOSTNAME = "coingecko";

// uplift default image quality
const transformGeckoUrl = (originalUrl: string): string =>
  originalUrl.includes(GECKO_HOSTNAME)
    ? originalUrl.replace("/thumb/", "/large/")
    : originalUrl;

export const TokenIcon = ({ token }: { token: Token }) => (
  <Box borderRadius={"50%"} overflow={"hidden"}>
    <img
      src={token?.logoURI ? transformGeckoUrl(token.logoURI) : MOCK_IMAGE_URL}
      title={token?.symbol}
      alt={token?.symbol}
      width={"28px"}
      height={"28px"}
    />
  </Box>
);

export const TokenIndicator = ({ token }: { token: Token }) => (
  <Flex align="center" gap={2}>
    {token.symbol === "UNI-V2" && token.underlyingTokens ? (
      <Box position="relative" width={"28px"} height={"28px"}>
        <Box
          position="absolute"
          width="100%"
          height="100%"
          overflow="hidden"
          clipPath={"polygon(0 0, 46% 0, 46% 100%, 0% 100%)"}
        >
          <TokenIcon token={token.underlyingTokens[0]} />
        </Box>
        <Box
          position="absolute"
          width="100%"
          height="100%"
          overflow="hidden"
          clipPath={"polygon(54% 0, 100% 0, 100% 100%, 54% 100%)"}
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
