import {
  createListCollection,
  Select,
  Text,
  Box,
  Flex,
} from "@chakra-ui/react";
import { useMemo } from "react";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { CloseButton } from "@/components/ui/close-button";
import { useChainProtocols } from "@/util/enso";
import { SupportedChainId } from "@/constants";

// Simple protocol icon component
const ProtocolIcon = ({ logoUri }: { logoUri?: string }) => (
  <Box
    borderRadius={"50%"}
    overflow={"hidden"}
    width={"24px"}
    height={"24px"}
    minWidth={"24px"}
    marginRight={"8px"}
    display={"flex"}
    alignItems={"center"}
    justifyContent={"center"}
    backgroundColor={"gray.50"}
  >
    {logoUri && <img src={logoUri} alt="" width={"24px"} height={"24px"} />}
  </Box>
);

const ProtocolSelector = ({
  value,
  onChange,
  chainId,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  chainId?: SupportedChainId;
  disabled?: boolean;
}) => {
  const protocols = useChainProtocols(chainId);
  const projectOptions = useMemo(() => {
    const sortedByName = protocols?.sort((a, b) =>
      a.name?.localeCompare(b.name)
    );

    return createListCollection({
      items: sortedByName || [],
      itemToValue: (item) => item.slug,
      itemToString: (item) => item.name,
    });
  }, [protocols]);

  return (
    <SelectRoot
      variant="outline"
      disabled={disabled}
      value={[value]}
      onValueChange={({ value }) => onChange(value[0])}
      size="md"
      w={"fit-content"}
      minWidth={"180px"}
      transition="all 0.2s ease-in-out"
      collection={projectOptions}
    >
      <Select.Control>
        <SelectTrigger maxWidth={"100%"} borderRadius={"xl"}>
          <SelectValueText placeholder="Protocol (opt.)">
            {([protocol]) =>
              protocol ? (
                <Flex alignItems={"center"}>
                  <ProtocolIcon logoUri={protocol?.logosUri?.[0]} />
                  <Text whiteSpace={"nowrap"}>{protocol?.name}</Text>
                </Flex>
              ) : (
                <Flex alignItems={"center"}>
                  <Text whiteSpace={"nowrap"}>Select protocol (opt.)</Text>
                </Flex>
              )
            }
          </SelectValueText>
        </SelectTrigger>

        <Select.IndicatorGroup>
          {value && !disabled && <Select.ClearTrigger />}
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>

      <Select.Positioner>
        <SelectContent portalled={false}>
          {projectOptions.items.map((item) => {
            return (
              <SelectItem
                key={item.slug}
                item={item}
                _hover={{ background: "gray.100" }}
              >
                <Flex alignItems={"center"}>
                  <ProtocolIcon logoUri={item.logosUri?.[0]} />
                  {item.name}
                </Flex>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select.Positioner>
    </SelectRoot>
  );
};

export default ProtocolSelector;
