import React, { useState } from "react";
import { Box, createListCollection, Flex, Input, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { Token, useOneInchTokenList } from "@/util/common";
import { normalizeValue } from "@/util";
import { useEnsoBalances, useEnsoToken } from "@/util/enso";
import { MOCK_IMAGE_URL } from "@/constants";
import { Address } from "@/types";

type TokenWithBalance = Token & { balance?: string; costUsd?: number };

const TokenIndicator = ({ token }: { token: Token }) => (
  <Flex align="center">
    <img
      src={token?.logoURI ?? MOCK_IMAGE_URL}
      alt={token?.symbol}
      width={24}
      height={24}
    />
    <Text ml={2}>{token?.symbol}</Text>
  </Flex>
);

const DetailedTokenIndicator = ({ token }: { token: TokenWithBalance }) => (
  <Flex align="center" w={"full"}>
    <Box>
      <img
        src={token?.logoURI ?? MOCK_IMAGE_URL}
        alt={token?.symbol}
        width={24}
        height={24}
      />
    </Box>

    <Flex ml={2} flexDirection={"column"} flex={1}>
      <Text fontSize={"md"}>{token?.symbol}</Text>

      <Text color={"gray.400"}>{token.name}</Text>
    </Flex>

    <Flex flexDirection={"column"} flex={1} alignItems={"flex-end"}>
      <Text fontSize={"md"}>
        {token.balance
          ? `${normalizeValue(+token.balance, token.decimals)}`
          : ""}
      </Text>

      <Text ml={2} color={"gray.400"}>
        {token.costUsd ? `$${token.costUsd.toFixed(2)}` : ""}
      </Text>
    </Flex>
  </Flex>
);

const TokenSelector = ({
  value,
  onChange,
  containerRef,
}: {
  value: string;
  onChange: (value: string) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}) => {
  const { data: tokenMap } = useOneInchTokenList();
  const [searchText, setSearchText] = useState("");
  const { data: balances } = useEnsoBalances();
  const foundToken = useEnsoToken(searchText as Address);

  const tokenList = useMemo(() => {
    const tokens = tokenMap ? Object.values(tokenMap) : [];
    if (foundToken) {
      tokens.unshift(foundToken);
    }
    const selectedToken = tokens.find((token) => token.address === value);

    const balancesWithTotals = tokens?.map((token) => {
      const balance = balances?.find((b) => b.token === token.address);

      return balance
        ? {
            ...token,
            balance: balance.amount,
            costUsd:
              +normalizeValue(+balance.amount, balance.decimals) *
              +balance.price,
          }
        : token;
    });

    //sort by costUsd
    balancesWithTotals.sort((a, b) => {
      if (b?.address === selectedToken?.address) return 1e18;
      // @ts-expect-error typing is not recognized
      return (b.costUsd ?? 0) - (a.costUsd ?? 0);
    });

    return balancesWithTotals;
  }, [balances, tokenMap, foundToken, value]);

  console.log(tokenList);

  const tokenOptions = useMemo(() => {
    const items = searchText
      ? tokenList.filter(
          (token) =>
            token.symbol.toLowerCase().includes(searchText.toLowerCase()) ||
            token.address.toLowerCase().includes(searchText.toLowerCase()),
        )
      : tokenList;

    return createListCollection({
      items,
      itemToValue: (item) => item.address,
      itemToString: (item) => item.symbol,
    });
  }, [tokenList, searchText]);

  return (
    <SelectRoot
      collection={tokenOptions}
      value={[value]}
      onValueChange={({ value }) => onChange(value[0] as string)}
      size="sm"
      minWidth="150px"
    >
      <SelectTrigger>
        <SelectValueText placeholder="Select token">
          {(tokens: Token[]) => <TokenIndicator token={tokens[0]} />}
        </SelectValueText>
      </SelectTrigger>

      <SelectContent
        portalRef={containerRef}
        position={"fixed"}
        width={"420px"}
        overflow={"hidden"}
      >
        <Flex
          w={"full"}
          height={"full"}
          flexDirection={"column"}
          gap={2}
          marginY={2}
        >
          <Text fontSize={"lg"}>Select a token</Text>
          <Input
            autoFocus
            outline={"none"}
            placeholder="Search by name or paste address"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Box height={"350px"} overflow={"scroll"}>
            {tokenOptions.items.map((token) => (
              <SelectItem item={token} key={token.address}>
                <DetailedTokenIndicator token={token} />
              </SelectItem>
            ))}
          </Box>
        </Flex>
      </SelectContent>
    </SelectRoot>
  );
};

export default TokenSelector;
