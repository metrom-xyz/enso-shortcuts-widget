import { useStore } from "@/store";
import { CircleCheck, CircleX, ExternalLink, Info } from "lucide-react";
import { CloseButton } from "@/components/ui/close-button";
import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";

export enum NotifyType {
  Success = "success",
  Error = "error",
  Info = "info",
}

const NOTIFICATION_COLORS = {
  [NotifyType.Success]: "green.400",
  [NotifyType.Error]: "red.400",
  [NotifyType.Info]: "blue.400",
};

const NotificationIcons = {
  [NotifyType.Success]: CircleCheck,
  [NotifyType.Error]: CircleX,
  [NotifyType.Info]: Info,
};

const getIcon = (variant: NotifyType) => {
  const Component = NotificationIcons[variant];

  return <Component size={96} />;
};

export const Notification = () => {
  const { notification, setNotification } = useStore();
  // // Testing purposes
  // useEffect(() => {
  //   setNotification({
  //     variant: NotifyType.Info,
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
      <Flex
        width={"100%"}
        position={"absolute"}
        justifyContent={"flex-end"}
        paddingX={5}
      >
        <CloseButton onClick={handleClose} />
      </Flex>
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
