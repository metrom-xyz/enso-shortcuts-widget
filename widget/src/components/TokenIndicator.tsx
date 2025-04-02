import { Box, Flex, Text } from "@chakra-ui/react";
import { Token } from "@/util/common";
import {
  MOCK_IMAGE_URL,
  SupportedChainId,
  STARGATE_CHAIN_NAMES,
} from "@/constants";

const GECKO_HOSTNAME = "coingecko";

// uplift default image quality
const transformGeckoUrl = (originalUrl: string): string =>
  originalUrl.includes(GECKO_HOSTNAME)
    ? originalUrl.replace("/thumb/", "/large/")
    : originalUrl;

export const TokenIcon = ({
  token,
  chainId,
}: {
  token: Token;
  chainId?: SupportedChainId;
}) => (
  <Box position="relative" borderRadius={"50%"} minW={"28px"} minH={"28px"}>
    <Box
      borderRadius={"50%"}
      overflow={"hidden"}
      width={"28px"}
      height={"28px"}
    >
      <img
        src={
          token?.logoURI ? transformGeckoUrl(token?.logoURI) : MOCK_IMAGE_URL
        }
        title={token?.symbol}
        alt={token?.symbol}
        width={"28px"}
        height={"28px"}
      />
    </Box>
    {chainId && (
      <Box
        position="absolute"
        bottom="0"
        right="-2px"
        width="14px"
        height="14px"
        borderRadius="50%"
        overflow="hidden"
        border="1px solid white"
        zIndex="1"
      >
        <img
          src={`https://icons-ckg.pages.dev/stargate-light/networks/${STARGATE_CHAIN_NAMES[chainId]}.svg`}
          alt={`Chain ${chainId}`}
          width="100%"
          height="100%"
        />
      </Box>
    )}
  </Box>
);

export const TokenIndicator = ({
  token,
  chainId,
  ...rest
}: {
  token?: Token;
  chainId?: SupportedChainId;
  pr?: number;
}) => (
  <Flex align="center" gap={2} {...rest}>
    {token?.symbol === "UNI-V2" && token.underlyingTokens ? (
      <Box position="relative" width={"28px"} height={"28px"}>
        <Box
          position="absolute"
          width="100%"
          height="100%"
          overflow="hidden"
          clipPath={"polygon(0 0, 46% 0, 46% 100%, 0% 100%)"}
        >
          <TokenIcon token={token.underlyingTokens[0]} chainId={chainId} />
        </Box>
        <Box
          position="absolute"
          width="100%"
          height="100%"
          overflow="hidden"
          clipPath={"polygon(54% 0, 100% 0, 100% 100%, 54% 100%)"}
        >
          <TokenIcon token={token.underlyingTokens[1]} chainId={chainId} />
        </Box>
      </Box>
    ) : (
      <TokenIcon token={token} chainId={chainId} />
    )}
    <Text>{token?.symbol}</Text>
  </Flex>
);
