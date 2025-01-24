import { useEffect } from "react";
import {
  CircleCheck,
  CircleX,
  ExternalLink,
  Info,
  TriangleAlert,
} from "lucide-react";
import { Box, Center, Flex, Link, Text } from "@chakra-ui/react";
import { useStore } from "@/store";
import { CloseButton } from "@/components/ui/close-button";
import { Button } from "@/components/ui/button";
import {
  ProgressCircleRing,
  ProgressCircleRoot,
} from "@/components/ui/progress-circle";
import { NotifyType } from "@/types";

const NOTIFICATION_COLORS = {
  [NotifyType.Success]: "green.500",
  [NotifyType.Error]: "red.400",
  [NotifyType.Info]: "blue.400",
  [NotifyType.Loading]: "blue.400",
  [NotifyType.Warning]: "yellow.400",
};

const NotificationIcons = {
  [NotifyType.Success]: CircleCheck,
  [NotifyType.Error]: CircleX,
  [NotifyType.Info]: Info,
  [NotifyType.Warning]: TriangleAlert,
};

const getIcon = (variant: NotifyType) => {
  if (variant === NotifyType.Loading) {
    return (
      <Center w={"96px"} h={"96px"}>
        <ProgressCircleRoot value={null} size={"xl"} colorPalette={"blue"}>
          <ProgressCircleRing />
        </ProgressCircleRoot>
      </Center>
    );
  }

  const Component = NotificationIcons[variant];

  return (
    <Box color={NOTIFICATION_COLORS[variant]}>
      <Component size={96} />
    </Box>
  );
};

export const Notification = () => {
  const { notification, setNotification } = useStore();
  // Testing purposes
  // useEffect(() => {
  //   setNotification({
  //     variant: NotifyType.Loading,
  //     message: "Transaction submitted",
  //     link: "https://basescan.org/tx/0xf7fd0e5153288af243be2dbc97884a766ca316d49a908bdd01191a3a8f8ac95f",
  //   });
  // }, []);

  if (!notification) return null;

  const handleClose = () => {
    setNotification(undefined);
  };

  return (
    <Center w={"full"} h={"full"}>
      <Flex
        width={"95%"}
        height={"95%"}
        p={5}
        boxShadow={"lg"}
        zIndex={1000}
        background={"white"}
        flexDirection={"column"}
      >
        <CloseButton
          position={"absolute"}
          top={10}
          right={5}
          onClick={handleClose}
          mr={5}
        />
        <Flex
          flexDirection={"column"}
          width={"full"}
          height={"full"}
          justifyContent={"center"}
          alignItems={"center"}
          gap={2}
        >
          {getIcon(notification.variant)}
          <Text
            fontSize={notification.variant === NotifyType.Warning ? "lg" : "xl"}
          >
            {notification.message}
          </Text>
          <Button mt={5} w={200} variant={"subtle"} onClick={handleClose}>
            Close
          </Button>
          {notification.link && (
            <Link href={notification.link} target={"_blank"}>
              View details
              <ExternalLink size={14} />
            </Link>
          )}
        </Flex>
      </Flex>
    </Center>
  );
};

export default Notification;
