import { Address } from "viem";

export type WidgetState = {
  tokenIn?: Address;
  tokenOut?: Address;
  chainId?: number;
  outChainId?: number;
  outProject?: string;
  outTokens?: {
    include: Address[];
    exclude: Address[];
  };
};

export type WidgetProps = {
  adaptive?: boolean;
  tokenOut?: Address;
  tokenIn?: Address;
  obligateSelection?: boolean;
  enableShare?: boolean;
  indicateRoute?: boolean;
  rotateObligated?: boolean | ObligatedToken;
  outProject?: string;
  onChange?: (newState: WidgetState) => void;
  outTokens?: {
    include: Address[];
    exclude: Address[];
  };
};

export enum NotifyType {
  Success = "success",
  Error = "error",
  Info = "info",
  Loading = "loading",
  Warning = "warning",
  Blocked = "blocked",
}

export enum ObligatedToken {
  TokenIn,
  TokenOut,
}
