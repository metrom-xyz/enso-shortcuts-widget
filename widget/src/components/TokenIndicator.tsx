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
    <TokenIcon token={token} />
    <Text>{token?.symbol}</Text>
  </Flex>
);
