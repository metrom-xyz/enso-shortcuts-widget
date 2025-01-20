import React from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { ChevronRightIcon, ChevronsRight } from "lucide-react";
import { Address } from "viem";
import { RouteData } from "@ensofinance/sdk";
import { capitalize, useTokenFromList } from "@/util/common";
import { MOCK_IMAGE_URL } from "@/constants";
import { useEnsoToken } from "@/util/enso";

const TokenBadge = ({ address }: { address: Address }) => {
  const token = useTokenFromList(address);
  const ensoToken = useEnsoToken(address);
  const symbol = ensoToken?.symbol ?? token?.symbol;
  const logoURI = token?.logoURI ?? ensoToken.logoURI ?? MOCK_IMAGE_URL;

  return (
    <img title={symbol} src={logoURI} alt={symbol} width={24} height={24} />
  );
};

type RouteSegment = RouteData["route"][0];

const RouteSegment = ({ step }: { step: RouteSegment }) => (
  <Flex flexDirection={"column"} alignItems={"center"} p={1} w={100}>
    <Box>
      <Text
        fontSize={"sm"}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >{`${capitalize(step.protocol)}`}</Text>
      <Text color={"gray.400"} fontSize={"xs"} mt={-2}>
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
        <Box color={"gray.400"}>
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

const RouteIndication = ({ route }: { route?: RouteSegment[] }) => {
  return (
    <Flex w={"full"} justifyContent={"center"}>
      <Flex
        border={"solid 1px"}
        borderColor="gray.200"
        borderRadius="md"
        p={1}
        alignItems={"center"}
      >
        {route?.reduce((acc, step, currentIndex) => {
          acc.push(
            <Box>
              {step.action === "split" ? (
                step.internalRoutes?.map(([step], i) => (
                  <RouteSegment step={step} key={i} />
                ))
              ) : (
                <RouteSegment step={step} />
              )}
            </Box>,
          );

          if (route.length - 1 !== currentIndex) {
            acc.push(
              <Box color={"gray.400"}>
                <ChevronsRight />
              </Box>,
            );
          }

          return acc;
        }, [])}
      </Flex>
    </Flex>
  );
};

export default RouteIndication;
