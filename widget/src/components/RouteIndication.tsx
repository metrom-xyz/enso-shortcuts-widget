import {
  Box,
  Text,
  Flex,
  Skeleton,
  Badge,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { ChevronsRight, ArrowRight } from "lucide-react";
import { Address, isAddress } from "viem";
import { RouteData } from "@ensofinance/sdk";
import { capitalize, Token, useTokenFromList } from "@/util/common";
import { useEnsoToken } from "@/util/enso";
import { TokenIcon } from "@/components/TokenIndicator";

const TokenBadge = ({
  address,
  chainId,
}: {
  address: Address;
  chainId: number;
}) => {
  const token = useTokenFromList(address);
  const {
    tokens: [ensoToken],
  } = useEnsoToken({
    address,
    enabled: !!isAddress(address),
    priorityChainId: chainId,
  });
  const symbol = ensoToken?.symbol ?? token?.symbol;
  const logoURI = ensoToken?.logoURI;

  return (
    <Box
      p={0.5}
      borderRadius="sm"
      bg="bg.subtle"
      border="1px solid"
      borderColor="border.subtle"
      transition="all 0.2s"
      _hover={{ borderColor: "border.emphasized", transform: "scale(1.05)" }}
    >
      <TokenIcon token={{ logoURI, symbol } as Token} />
    </Box>
  );
};

type RouteSegment = RouteData["route"][0] & { chainId?: number };

const RouteSegment = ({ step }: { step: RouteSegment }) => (
  <VStack minW="80px" maxW="100px" gap={0}>
    <VStack gap={0}>
      <Badge
        colorScheme="blue"
        variant="subtle"
        px={1}
        py={0.5}
        borderRadius="md"
        fontSize="2xs"
        fontWeight="medium"
        textTransform="none"
      >
        {capitalize(step.protocol)}
      </Badge>
      <Text
        color="fg.muted"
        fontSize="2xs"
        fontWeight="normal"
        textTransform="capitalize"
        cursor="default"
      >
        {step.action}
      </Text>
    </VStack>

    <HStack alignItems="center" gap={0}>
      <VStack gap={0}>
        {step.tokenIn?.map((token, i) => (
          <TokenBadge address={token} key={i} chainId={step.chainId} />
        ))}
      </VStack>

      {step.tokenIn.length > 0 && step.tokenOut.length > 0 && (
        <Box
          color="fg.muted"
          p={0.5}
          borderRadius="sm"
          bg="bg.subtle"
          transition="all 0.2s"
          _hover={{ color: "fg", bg: "bg.emphasized" }}
        >
          <ArrowRight size={10} />
        </Box>
      )}

      <VStack gap={0}>
        {step.tokenOut.map((token, i) => (
          <TokenBadge address={token} key={i} chainId={step.chainId} />
        ))}
      </VStack>
    </HStack>
  </VStack>
);

const BridgeConnector = ({
  bridgeName = "Stargate",
}: {
  bridgeName?: string;
}) => (
  <VStack gap={0}>
    <VStack gap={0}>
      <Badge
        colorScheme="purple"
        variant="solid"
        px={1}
        py={0.5}
        borderRadius="md"
        fontSize="2xs"
        fontWeight="medium"
      >
        {bridgeName}
      </Badge>
      <Text
        color="fg.muted"
        fontSize="2xs"
        fontWeight="normal"
        cursor="default"
      >
        bridge
      </Text>
    </VStack>
    <Box
      color="purple.400"
      p={1}
      borderRadius="sm"
      bg="purple.50"
      _dark={{ bg: "purple.900" }}
    >
      <ChevronsRight size={12} />
    </Box>
  </VStack>
);

const StepConnector = () => (
  <Box
    color="fg.muted"
    borderRadius="sm"
    bg="bg.subtle"
    transition="all 0.2s"
    _hover={{ color: "fg", bg: "bg.emphasized" }}
  >
    <ChevronsRight size={12} />
  </Box>
);

const RouteIndication = ({
  route,
  loading,
}: {
  route?: RouteSegment[];
  loading?: boolean;
}) => (
  <Flex w="full" justifyContent="center" minHeight="100px" py={1}>
    {loading ? (
      <Skeleton h="full" w="150px" borderRadius="lg" />
    ) : (
      route?.length > 0 && (
        <Box
          border="1px solid"
          borderColor="border.emphasized"
          borderRadius="lg"
          bg="bg.surface"
          p={2}
          _hover={{ shadow: "sm" }}
          transition="all 0.3s"
          maxW="full"
          overflow="auto"
        >
          <HStack alignItems="center" flexWrap="nowrap" gap={0}>
            {route.reduce((acc, step, currentIndex) => {
              acc.push(
                <Box key={`route-segment-${currentIndex}`}>
                  {step.action === "split" ? (
                    <VStack>
                      {step.internalRoutes?.map(([internalStep], i) => (
                        <RouteSegment
                          step={{ ...internalStep, chainId: step.chainId }}
                          key={i}
                        />
                      ))}
                    </VStack>
                  ) : (
                    <RouteSegment step={step} />
                  )}
                </Box>
              );

              if (route.length - 1 !== currentIndex) {
                const nextStep = route[currentIndex + 1];
                const isCrosschainBridge = step.chainId !== nextStep.chainId;

                acc.push(
                  <Box key={`connector-${currentIndex}`} p={1}>
                    {isCrosschainBridge ? (
                      <BridgeConnector />
                    ) : (
                      <StepConnector />
                    )}
                  </Box>
                );
              }

              return acc;
            }, [])}
          </HStack>
        </Box>
      )
    )}
  </Flex>
);

export default RouteIndication;
