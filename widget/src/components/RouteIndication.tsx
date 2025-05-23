import { Box, Text, Flex, Skeleton } from "@chakra-ui/react";
import { ChevronRightIcon, ChevronsRight } from "lucide-react";
import { Address, isAddress } from "viem";
import { RouteData } from "@ensofinance/sdk";
import { capitalize, Token, useTokenFromList } from "@/util/common";
import { useEnsoToken } from "@/util/enso";
import { TokenIcon } from "@/components/TokenIndicator";

const TokenBadge = ({ address }: { address: Address }) => {
  const token = useTokenFromList(address);
  const {
    tokens: [ensoToken],
  } = useEnsoToken({ address, enabled: !!isAddress(address) });
  const symbol = ensoToken?.symbol ?? token?.symbol;
  const logoURI = token?.logoURI ?? ensoToken?.logoURI;

  return <TokenIcon token={{ logoURI, symbol } as Token} />;
};

type RouteSegment = RouteData["route"][0] & { chainId: number };

const RouteSegment = ({ step }: { step: RouteSegment }) => (
  <Flex flexDirection={"column"} alignItems={"center"} p={1} w={100}>
    <Box>
      <Text
        fontSize={"sm"}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >{`${capitalize(step.protocol)}`}</Text>
      <Text color={"fg.subtle"} fontSize={"xs"} mt={-2}>
        ({step.action})
      </Text>
    </Box>
    <Flex alignItems={"center"}>
      <Flex flexDirection={"column"} gap={1}>
        {step.tokenIn?.map((token, i) => (
          <TokenBadge address={token} key={i} />
        ))}
      </Flex>
      {step.tokenIn.length && step.tokenOut.length && (
        <Box color={"fg.subtle"}>
          <ChevronRightIcon />
        </Box>
      )}
      <Flex flexDirection={"column"} gap={1}>
        {step.tokenOut.map((token, i) => (
          <TokenBadge address={token} key={i} />
        ))}
      </Flex>
    </Flex>
  </Flex>
);

const RouteIndication = ({
  route,
  loading,
}: {
  route?: RouteSegment[];
  loading?: boolean;
}) => (
  <Flex w={"full"} justifyContent={"center"} minHeight={"77px"}>
    {loading ? (
      <Skeleton h="full" w="100px" />
    ) : (
      route?.length > 0 && (
        <Flex
          border={"solid 1px"}
          borderColor="border.emphasized"
          borderRadius="xl"
          p={1}
          alignItems={"center"}
        >
          {route.reduce((acc, step, currentIndex) => {
            acc.push(
              <Box key={`route-segment-${currentIndex}`}>
                {step.action === "split" ? (
                  step.internalRoutes?.map(([internalStep], i) => (
                    <RouteSegment
                      step={{ ...internalStep, chainId: step.chainId }}
                      key={i}
                    />
                  ))
                ) : (
                  <RouteSegment step={step} />
                )}
              </Box>
            );

            if (route.length - 1 !== currentIndex) {
              const nextStep = route[currentIndex + 1];
              const isCrosschainBridge = step.chainId !== nextStep.chainId;

              acc.push(
                <Flex
                  key={`connector-${currentIndex}`}
                  color={"fg.subtle"}
                  flexDirection="column"
                  alignItems="center"
                >
                  {isCrosschainBridge ? (
                    <>
                      <Text color="fg" fontSize="xs">
                        Stargate
                      </Text>
                      <Text fontSize="xs">(bridge)</Text>
                    </>
                  ) : (
                    <ChevronsRight />
                  )}
                </Flex>
              );
            }

            return acc;
          }, [])}
        </Flex>
      )
    )}
  </Flex>
);

export default RouteIndication;
