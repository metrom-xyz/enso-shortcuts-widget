import { useEffect } from "react";
import { CircleCheck, CircleX, ExternalLink, Info } from "lucide-react";
import { Box, Flex, Link, Text, Center, Spinner } from "@chakra-ui/react";
import { useStore } from "@/store";
import { CloseButton } from "@/components/ui/close-button";
import { Button } from "@/components/ui/button";
import { NotifyType } from "@/types";

const NOTIFICATION_COLORS = {
  [NotifyType.Success]: "green.500",
  [NotifyType.Error]: "red.400",
  [NotifyType.Info]: "blue.400",
  [NotifyType.Loading]: "blue.400",
};

const NotificationIcons = {
  [NotifyType.Success]: CircleCheck,
  [NotifyType.Error]: CircleX,
  [NotifyType.Info]: Info,
};

const getIcon = (variant: NotifyType) => {
  if (variant === NotifyType.Loading) {
    return (
      <Center w={"96px"} h={"96px"}>
        <Spinner size={"xl"} borderWidth={"5px"} />
      </Center>
    );
  }

  const Component = NotificationIcons[variant];

  return <Component size={96} />;
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
    <Flex
      width={"full"}
      p={5}
      layerStyle={"outline.subtle"}
      zIndex={1000}
      background={"white"}
      flexDirection={"column"}
    >
      <CloseButton
        position={"absolute"}
        top={5}
        right={0}
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
        <Box color={NOTIFICATION_COLORS[notification.variant]}>
          {getIcon(notification.variant)}
        </Box>
        <Text fontSize={"xl"}>{notification.message}</Text>
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
  );
};

export default Notification;
