import React, { useEffect, useState } from "react";
import {
  Box,
  Center,
  createListCollection,
  Flex,
  Input,
  Text,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { Address, isAddress } from "viem";
import { FixedSizeList as List } from "react-window";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { Token, useGeckoList, usePriorityChainId } from "@/util/common";
import { normalizeValue } from "@/util";
import { useEnsoBalances, useEnsoToken } from "@/util/enso";
import {
  ETH_ADDRESS,
  ETH_TOKEN,
  MOCK_IMAGE_URL,
  NATIVE_ETH_CHAINS,
} from "@/constants";

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
      <Text
        fontSize={"md"}
        textOverflow={"ellipsis"}
        whiteSpace={"nowrap"}
        overflow={"hidden"}
        w={"150px"}
        title={token?.symbol}
      >
        {token?.symbol}
      </Text>

      <Text
        color={"gray.400"}
        textOverflow={"ellipsis"}
        whiteSpace={"nowrap"}
        overflow={"hidden"}
        w={"150px"}
        title={token.name}
      >
        {token.name}
      </Text>
    </Flex>

    <Flex flexDirection={"column"} flex={1} alignItems={"flex-end"}>
      <Text fontSize={"md"}>
        {token.balance
          ? `${normalizeValue(token.balance, token.decimals)}`
          : ""}
      </Text>

      <Text ml={2} color={"gray.400"}>
        {token.costUsd ? `$${token.costUsd.toFixed(2)}` : ""}
      </Text>
    </Flex>
  </Flex>
);

const hasCoincidence = (tokens: Token[], address: Address) =>
  tokens.some(
    (token) =>
      token.address?.toLocaleLowerCase() === address?.toLocaleLowerCase(),
  );

const TokenSelector = ({
  value,
  onChange,
  portalRef,
  obligatedToken,
}: {
  value: Address;
  onChange: (value: string) => void;
  portalRef?: React.RefObject<HTMLDivElement>;
  obligatedToken?: boolean;
}) => {
  const geckoTokens = useGeckoList();
  const [searchText, setSearchText] = useState("");
  const { data: balances } = useEnsoBalances();

  const searchedToken = useEnsoToken(
    geckoTokens.length && !hasCoincidence(geckoTokens, searchText as Address)
      ? (searchText as Address)
      : undefined,
  );
  const valueToken = useEnsoToken(
    geckoTokens.length && !hasCoincidence(geckoTokens, value)
      ? value
      : undefined,
  );

  const tokenList = useMemo(() => {
    let tokens = geckoTokens;

    if (searchedToken) {
      tokens = [...tokens, searchedToken];
    }
    if (valueToken) {
      tokens = [...tokens, valueToken];
    }

    const balancesWithTotals = tokens?.map((token) => {
      let balanceValue = balances?.find((b) => b.token === token.address);

      // debank return ''arb" and "zksync" native token names instead of token address
      if (token.address === ETH_ADDRESS) {
        balanceValue = balances?.find(
          ({ token }) => token && !isAddress(token),
        );
      }

      // cut scientific notation
      const balance = Number(balanceValue?.amount).toLocaleString("fullwide", {
        useGrouping: false,
      });

      return balanceValue
        ? {
            ...token,
            balance,
            costUsd:
              +normalizeValue(balance, balanceValue?.decimals) *
              +balanceValue?.price,
          }
        : token;
    });

    //sort by costUsd
    balancesWithTotals.sort((a, b) => {
      // @ts-expect-error typing is not recognized
      return (b.costUsd ?? 0) - (a.costUsd ?? 0);
    });

    return balancesWithTotals;
  }, [balances, geckoTokens, searchedToken]);

  const tokenOptions = useMemo(() => {
    let items = tokenList;

    if (searchText) {
      const search = searchText.toLocaleLowerCase();

      items = tokenList.filter((token) =>
        [token.symbol, token.name, token.address].some((val) =>
          val.toLocaleLowerCase().includes(search),
        ),
      );
    }

    return createListCollection({
      items,
      itemToValue: (item) => item.address,
      itemToString: (item) => item.symbol,
    });
  }, [tokenList, searchText]);

  return (
    <SelectRoot
      disabled={!!obligatedToken}
      collection={tokenOptions}
      value={[value]}
      onValueChange={({ value }) => onChange(value[0] as string)}
      size="sm"
      minWidth="140px"
      onOpenChange={({ open }) =>
        open || obligatedToken || searchedToken || setSearchText("")
      }
    >
      <SelectTrigger noIndicator={!!obligatedToken}>
        <SelectValueText placeholder="Select token">
          {(tokens: Token[]) => <TokenIndicator token={tokens[0]} />}
        </SelectValueText>
      </SelectTrigger>

      <SelectContent portalRef={portalRef} w={"100%"} minWidth={"350px"}>
        <Flex
          height={"350px"}
          flexDirection={"column"}
          gap={2}
          p={1}
          width={"100%"}
        >
          <Center>
            <Text fontSize={"lg"}>Select a token</Text>
          </Center>

          <Input
            autoFocus
            paddingX={2}
            placeholder="Search by name or paste address"
            value={searchText}
            onChange={(e) => obligatedToken || setSearchText(e.target.value)}
          />

          <List
            height={400}
            itemCount={tokenOptions.items.length}
            itemSize={48}
            width={"100%"}
          >
            {({ index, style }) => {
              const token = tokenOptions.items[index];

              return (
                <SelectItem
                  item={token}
                  key={token.address}
                  style={style}
                  _hover={{ background: "gray.100" }}
                >
                  <DetailedTokenIndicator token={token} />
                </SelectItem>
              );
            }}
          </List>
        </Flex>
      </SelectContent>
    </SelectRoot>
  );
};

export default TokenSelector;
