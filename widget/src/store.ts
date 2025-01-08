import { create } from "zustand";

type Store = {
  obligatedChainId?: number | undefined;
  setObligatedChainId: (chainId: number) => void;
};

export const useStore = create<Store>((set) => ({
  obligatedChainId: undefined,
  setObligatedChainId: (chainId: number) => set({ obligatedChainId: chainId }),
}));
