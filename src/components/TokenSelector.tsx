import React from "react";
import { createListCollection, Flex, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { Token, useOneInchTokenList } from "@/util/common";

// type TokenWithBalance = Token & { balance: string };

const TokenIndicator = ({ token }: { token: Token }) => (
  <Flex align="center">
    <img src={token.logoURI} alt={token.symbol} width={24} height={24} />
    <Text ml={2}>{token.symbol}</Text>
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
  const tokenList = useMemo(
    () =>
      createListCollection({
        items: tokenMap ? Object.values(tokenMap) : [],
        itemToValue: (item) => item.address,
        itemToString: (item) => item.symbol,
      }),
    [tokenMap],
  );

  return (
    <SelectRoot
      collection={tokenList}
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

      <SelectContent portalRef={containerRef} position={"fixed"} width={"400px"}>
        <Flex w={"full"} flexDirection={"column"}>
          <Text>Select a token</Text>
        {tokenList.items.map((token) => (
          <SelectItem item={token} key={token.address}>
            <TokenIndicator token={token} />
          </SelectItem>
        ))}
        </Flex>
      </SelectContent>
    </SelectRoot>
  );
};

export default TokenSelector;
