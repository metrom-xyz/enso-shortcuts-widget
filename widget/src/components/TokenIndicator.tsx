import React from "react";
import {Flex, Text} from "@chakra-ui/react";
import {Token} from "@/util/common";
import {MOCK_IMAGE_URL} from "@/constants";

export const TokenIndicator = ({ token }: { token: Token }) => (
    <Flex align="center" gap={2}>
        <img
            src={token?.logoURI ?? MOCK_IMAGE_URL}
            alt={token?.symbol}
            width={24}
            height={24}
        />
        <Text>{token?.symbol}</Text>
    </Flex>
);