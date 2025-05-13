import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Box, chakra, Flex, Skeleton, Text, Button } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { Address, isAddress } from "viem";
import TokenSelector from "@/components/TokenSelector";
import { formatNumber, formatUSD, normalizeValue } from "@/util";
import { useTokenBalance } from "@/util/wallet";
import { useEnsoToken } from "@/util/enso";
import { SupportedChainId } from "@/constants";

const SwapInput = ({
  chainId,
  setChainId,
  tokenValue,
  tokenOnChange,
  inputValue,
  inputOnChange,
  usdValue,
  loading,
  disabled,
  portalRef,
  obligatedToken,
  limitTokens,
  project,
}: {
  chainId?: SupportedChainId;
  setChainId?: (chainId: SupportedChainId) => void;
  tokenValue: Address;
  tokenOnChange: (value: Address) => void;
  inputValue: string;
  inputOnChange: (value: string) => void;
  title?: string;
  usdValue?: number;
  disabled?: boolean;
  loading?: boolean;
  portalRef?: React.RefObject<HTMLDivElement>;
  obligatedToken?: boolean;
  limitTokens?: Address[];
  project?: string;
}) => {
  const { address } = useAccount();
  const balance = useTokenBalance(tokenValue, chainId);
  const {
    tokens: [tokenInInfo],
  } = useEnsoToken({
    address: tokenValue,
    enabled: !!isAddress(tokenValue),
    priorityChainId: chainId,
  });
  const [tempInputValue, setTempInputValue] = useState("");
  const debouncedValue = useDebounce(tempInputValue, 400);

  useEffect(() => {
    inputOnChange(debouncedValue);
  }, [debouncedValue]);
  useEffect(() => {
    setTempInputValue(inputValue);
  }, [inputValue]);

  const balanceValue = normalizeValue(balance, tokenInInfo?.decimals ?? 18);

  return (
    <Flex
      bg="rgba(0, 0, 0, 0.01)"
      borderRadius="xl"
      p={2}
      align="center"
      w={"full"}
    >
      <Box w={"full"}>
        <Flex w={"full"}>
          <Text fontSize="sm" color="gray.600" height="20px">
            {tokenInInfo?.name || " "}
          </Text>
        </Flex>
        <Flex w={"full"}>
          <TokenSelector
            project={project}
            setChainId={setChainId}
            chainId={chainId}
            limitTokens={limitTokens}
            obligatedToken={obligatedToken}
            portalRef={portalRef}
            value={tokenValue}
            onChange={tokenOnChange}
          />

          <Flex
            alignItems={"center"}
            justifyContent={"flex-end"}
            w={"100%"}
            h={"100%"}
          >
            {loading ? (
              <Skeleton h={"30px"} w={130} ml={5} />
            ) : (
              <chakra.input
                css={{
                  "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button":
                    {
                      WebkitAppearance: "none",
                    },
                }}
                h={"36px"}
                lineHeight={"100%"}
                type={"number"}
                disabled={disabled}
                width={"full"}
                minWidth={"120px"}
                fontSize="xl"
                border={"none"}
                outline={"none"}
                background={"transparent"}
                placeholder="0.0"
                ml={1}
                textAlign="right"
                value={tempInputValue}
                onChange={(e) => setTempInputValue(e.target.value)}
              />
            )}
          </Flex>
        </Flex>

        <Flex justifyContent={"space-between"} fontSize="sm">
          <Text
            color={"gray.500"}
            fontSize="sm"
            whiteSpace={"nowrap"}
            visibility={address ? "visible" : "hidden"}
            maxW={"100px"}
          >
            Balance: {formatNumber(balanceValue)}
            <Button
              size="xs"
              ml={1}
              px={2}
              h="18px"
              fontSize="xs"
              colorScheme="blue"
              variant="outline"
              display={address && !disabled ? "inline-flex" : "none"}
              onClick={() =>
                inputOnChange(
                  normalizeValue(balance, tokenInInfo?.decimals).toString()
                )
              }
            >
              Max
            </Button>
          </Text>

          {usdValue ? (
            <Text color={"gray.500"}>~{formatUSD(usdValue)}</Text>
          ) : null}
        </Flex>
      </Box>
    </Flex>
  );
};

export default SwapInput;
