import { useCallback, useEffect, useState } from "react";
import { createListCollection, Flex, Input, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { Address, isAddress } from "viem";
import { FixedSizeList as List } from "react-window";
import { Token, useCurrentChainList } from "@/util/common";
import { formatNumber, normalizeValue } from "@/util";
import { useEnsoBalances, useEnsoToken } from "@/util/enso";
import { ETH_ADDRESS, SupportedChainId } from "@/constants";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { TokenIndicator } from "@/components/TokenIndicator";
import ChainSelector from "./ChainSelector";
import ProtocolSelector from "./ProtocolSelector";

type TokenWithBalance = Token & {
  balance?: string;
  costUsd?: number;
  apy?: number;
  tvl?: number;
  type: string;
};

const DetailedTokenIndicator = ({ token }: { token: TokenWithBalance }) => (
  <Flex align="center" w={"full"} justifyContent={"space-between"}>
    <TokenIndicator token={token} />

    <Flex flexDirection={"column"} alignItems={"flex-end"}>
      <Text
        color={"gray.400"}
        textOverflow={"ellipsis"}
        whiteSpace={"nowrap"}
        overflow={"hidden"}
        maxWidth={"150px"}
        title={token.symbol}
      >
        {`${
          token.balance
            ? formatNumber(normalizeValue(token.balance, token.decimals))
            : ""
        } ${token.symbol}`}
      </Text>

      <Text ml={2} fontSize={"md"}>
        {token.costUsd ? `$${token.costUsd.toFixed(2)}` : ""}
      </Text>
    </Flex>
  </Flex>
);

const hasCoincidence = (tokens: Token[], address: Address) =>
  tokens.findIndex(
    (token) =>
      token.address?.toLocaleLowerCase() === address?.toLocaleLowerCase(),
  );

const TokenSelector = ({
  value,
  onChange,
  portalRef,
  obligatedToken,
  limitTokens,
  chainId,
  setChainId,
  protocol,
}: {
  setChainId?: (chainId: SupportedChainId) => void;
  chainId?: SupportedChainId;
  value: Address;
  onChange: (value: string) => void;
  portalRef?: React.RefObject<HTMLDivElement>;
  obligatedToken?: boolean;
  limitTokens?: Address[];
  protocol?: string;
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectionChainId, setSelectionChainId] = useState(chainId);
  const [selectedProtocol, setSelectedProtocol] = useState(protocol);
  const { data: balances } = useEnsoBalances(selectionChainId);
  const { data: currentChainTokenList } = useCurrentChainList(selectionChainId);
  const protocolTokens = useEnsoToken({
    priorityChainId: selectionChainId,
    protocolSlug: selectedProtocol,
    enabled: !!selectedProtocol,
  });

  useEffect(() => {
    setSelectionChainId(chainId);
  }, [chainId]);

  const currentTokenList = selectedProtocol
    ? protocolTokens
    : currentChainTokenList;

  const searchAddress =
    currentTokenList?.length &&
    hasCoincidence(currentTokenList, searchText as Address) === -1 &&
    !limitTokens
      ? (searchText as Address)
      : undefined;
  const [searchedToken] = useEnsoToken({
    address: searchAddress,
    priorityChainId: selectionChainId,
    enabled: isAddress(searchAddress),
  });
  const [valueToken] = useEnsoToken({
    address: value,
    priorityChainId: selectionChainId,
    enabled: isAddress(value),
  });

  const tokenList = useMemo(() => {
    let tokens = currentTokenList ? currentTokenList.slice() : [];

    if (limitTokens) {
      tokens = tokens.filter((token) => limitTokens.includes(token.address));
    }

    if (searchedToken) {
      tokens = [...tokens, searchedToken];
    }
    if (valueToken) {
      tokens.splice(hasCoincidence(tokens, valueToken?.address), 1);
      tokens.unshift(valueToken);
    }

    const balancesWithTotals = tokens?.map((token) => {
      let balanceValue = balances?.find?.((b) => b.token === token.address);

      // debank return ''arb" and "zksync" native token names instead of token address
      if (token.address === ETH_ADDRESS) {
        balanceValue = balances?.find?.(
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
    balancesWithTotals.sort((a: TokenWithBalance, b: TokenWithBalance) => {
      return (b.costUsd ?? 0) - (a.costUsd ?? 0);
    });

    return balancesWithTotals;
  }, [balances, currentTokenList, searchedToken, valueToken]);

  const tokenOptions = useMemo(() => {
    let items = tokenList;

    if (searchText) {
      const search = searchText.toLocaleLowerCase();

      items = tokenList.filter((token) =>
        [token.symbol, token.name, token.address].some((val) =>
          val?.toLocaleLowerCase().includes(search),
        ),
      );
    }

    return createListCollection({
      items,
      itemToValue: (item) => item.address,
      itemToString: (item) => item.symbol,
    });
  }, [tokenList, searchText]);

  const onValueChange = useCallback(
    ({ value }: { value: string[] }) => {
      onChange(value[0] as string);
      setChainId(selectionChainId);
      setSelectionChainId(selectionChainId);
    },
    [onChange, selectionChainId],
  );
  const selectValue = useMemo(() => [value], [value]);
  const onOpenChange = useCallback(
    ({ open }: { open: boolean }) => {
      if (open || obligatedToken || searchedToken) setSearchText("");
      setSelectionChainId(chainId);
    },
    [obligatedToken, searchedToken, setSearchText, chainId],
  );

  return (
    <SelectRoot
      disabled={!!obligatedToken}
      collection={tokenOptions}
      value={selectValue}
      onValueChange={onValueChange}
      size="md"
      w={"fit-content"}
      onOpenChange={onOpenChange}
      background={"gray.100"}
      _hover={obligatedToken ? undefined : { background: "gray.200" }}
      borderRadius={"xl"}
      transition="all 0.2s ease-in-out"
    >
      <SelectTrigger
        w={"fit-content"}
        maxWidth={"100%"}
        noIndicator
        opacity={1}
        css={{
          "& > button": {
            opacity: "1 !important",
          },
        }}
      >
        {value ? (
          <SelectValueText
            placeholder="Select token"
            width={"fit-content"}
            maxWidth={"100%"}
          >
            {(tokens: Token[]) =>
              tokens[0] ? (
                <TokenIndicator
                  chainId={selectionChainId}
                  token={tokens[0] || undefined}
                />
              ) : (
                <Text whiteSpace={"nowrap"}>Select token</Text>
              )
            }
          </SelectValueText>
        ) : (
          <Text whiteSpace={"nowrap"}>Select Token</Text>
        )}
      </SelectTrigger>

      <SelectContent
        portalRef={portalRef}
        w={"100%"}
        minWidth={"300px"}
        minHeight={"400px"}
      >
        <Flex
          height={"100%"}
          flexDirection={"column"}
          gap={2}
          p={2}
          width={"100%"}
        >
          <Flex justifyContent={"space-between"} gap={2}>
            <ChainSelector
              disabled={!!protocol}
              value={selectionChainId}
              onChange={useCallback(
                (chainId) => {
                  setSelectionChainId(chainId);
                },
                [setSelectionChainId],
              )}
            />
            <ProtocolSelector
              disabled={!!protocol}
              value={selectedProtocol}
              onChange={setSelectedProtocol}
              chainId={selectionChainId}
            />
          </Flex>

          <Input
            autoFocus
            paddingX={2}
            placeholder="Search by name or paste address"
            value={searchText}
            onChange={(e) => obligatedToken || setSearchText(e.target.value)}
          />

          <List
            height={350}
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
                  borderRadius={"md"}
                  _hover={{ background: "gray.100" }}
                >
                  <DetailedTokenIndicator token={token as TokenWithBalance} />
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
