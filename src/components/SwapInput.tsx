import TokenSelector from "@/components/TokenSelector";
import { chakra, Flex, Skeleton, Text } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { formatNumber, normalizeValue } from "@/util";
import { useTokenFromList } from "@/util/common";
import { useTokenBalance } from "@/util/wallet";
import { Address } from "@/types";

//TODO: set default USDC address
const SwapInput = ({
  tokenValue,
  tokenOnChange,
  inputValue,
  inputOnChange,
  loading,
  disabled,
  containerRef,
}: {
  tokenValue: Address;
  tokenOnChange: (value: Address) => void;
  inputValue: string;
  inputOnChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  containerRef?: React.RefObject<HTMLDivElement>;
}) => {
  const { address } = useAccount();
  const balance = useTokenBalance(tokenValue);
  const tokenInInfo = useTokenFromList(tokenValue);

  const balanceValue = balance?.toString() ?? "0.0";

  const notEnoughBalance = +balanceValue < +inputValue && !disabled;

  return (
    <Flex align="space-between" mb={4}>
      <Flex
        border="solid 1px"
        borderColor="gray.200"
        borderRadius="md"
        p={2}
        align="center"
        flex={1}
      >
        <Flex flexDirection="column" alignItems={"flex-start"}>
          <TokenSelector
            containerRef={containerRef}
            value={tokenValue}
            onChange={tokenOnChange}
          />
          <Text
            color={notEnoughBalance ? "red" : "gray.500"}
            fontSize="sm"
            mb={1}
            whiteSpace={"nowrap"}
            visibility={address ? "visible" : "hidden"}
          >
            Balance:{" "}
            {formatNumber(normalizeValue(+balance, tokenInInfo?.decimals))}{" "}
            {tokenInInfo?.symbol}
          </Text>
        </Flex>

        <Flex mr={5} w={"100%"}>
          {loading ? (
            <Flex justifyContent={"flex-end"} w={"100%"}>
              <Skeleton h={"30px"} w={150} ml={5} />
            </Flex>
          ) : (
            <chakra.input
              disabled={disabled}
              fontSize="xl"
              border={"none"}
              outline={"none"}
              background={"transparent"}
              placeholder="0.0"
              textAlign="right"
              value={inputValue}
              onChange={(e) => inputOnChange(e.target.value)}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default SwapInput;
