import { create } from "zustand";
import { NotifyType } from "@/types";

type Notification = {
  message: string;
  variant: NotifyType;
  link?: string;
};

type Store = {
  obligatedChainId?: number | undefined;
  setObligatedChainId: (chainId: number) => void;

  notification?: Notification;
  setNotification: (notification: Notification) => void;
};

export const useStore = create<Store>((set) => ({
  // used if parent app has chain id context
  obligatedChainId: undefined,
  setObligatedChainId: (chainId: number) => set({ obligatedChainId: chainId }),

  // notification
  notification: undefined,
  setNotification: (notification: Notification) => set({ notification }),
}));
