import TokenSelector from "@/components/TokenSelector";
import { chakra, Flex, Grid, Skeleton, Text } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { formatNumber, formatUSD, normalizeValue } from "@/util";
import { useTokenFromList } from "@/util/common";
import { useTokenBalance } from "@/util/wallet";
import { Address } from "@/types";

//TODO: set default USDC address
const SwapInput = ({
  tokenValue,
  tokenOnChange,
  inputValue,
  inputOnChange,
  usdValue,
  title,
  loading,
  disabled,
  containerRef,
  obligatedToken,
}: {
  tokenValue: Address;
  tokenOnChange: (value: Address) => void;
  inputValue: string;
  inputOnChange: (value: string) => void;
  title?: string;
  usdValue?: number;
  disabled?: boolean;
  loading?: boolean;
  containerRef?: React.RefObject<HTMLDivElement>;
  obligatedToken?: Address;
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
        <Grid
          gridTemplateRows="0.5fr 2fr 0.5fr"
          gridTemplateColumns="1fr 2fr"
          alignItems={"flex-start"}
          w={"100%"}
          pr={2}
        >
          <Flex
            gridColumn={"span 2"}
            color={"gray.500"}
            fontSize={"sm"}
            alignContent={"center"}
          >
            {title}
          </Flex>

          <Flex height={"100%"} alignItems={"center"}>
            <TokenSelector
              obligatedToken={obligatedToken}
              containerRef={containerRef}
              value={tokenValue}
              onChange={tokenOnChange}
            />
          </Flex>
          <Flex
            alignItems={"center"}
            justifyContent={"flex-end"}
            w={"100%"}
            h={"100%"}
          >
            {loading ? (
              <Skeleton h={"30px"} w={150} ml={5} />
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

          <Flex>
            <Text
              color={notEnoughBalance ? "red" : "gray.500"}
              fontSize="sm"
              whiteSpace={"nowrap"}
              visibility={address ? "visible" : "hidden"}
            >
              Balance:{" "}
              {formatNumber(normalizeValue(+balance, tokenInInfo?.decimals))}{" "}
              {tokenInInfo?.symbol}
            </Text>
          </Flex>
          <Flex justifyContent={"flex-end"}>
            {usdValue ? (
              <Text color={"gray.500"}>~{formatUSD(usdValue)}</Text>
            ) : null}
          </Flex>
        </Grid>
      </Flex>
    </Flex>
  );
};

export default SwapInput;
