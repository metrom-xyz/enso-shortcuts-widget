import { Address } from "viem";

export type Placement =
  | "top-start"
  | "top"
  | "top-end"
  | "bottom-start"
  | "bottom"
  | "bottom-end";

export type WidgetState = {
  tokenIn?: Address;
  tokenOut?: Address;
  chainId?: number;
  outChainId?: number;
  outProject?: string;
};

export type ProjectFilter = {
  include: string[];
  exclude: string[];
};

export type WidgetComponentProps = {
  onSuccess?: (hash: string, details?: any) => void;
  adaptive?: boolean;
  tokenOut?: Address;
  tokenIn?: Address;
  notificationPlacement?: Placement;
  obligateSelection?: boolean;
  enableShare?: boolean;
  indicateRoute?: boolean;
  rotateObligated?: boolean | ObligatedToken;
  outProject?: string;
  outProjects?: ProjectFilter;
  inProjects?: ProjectFilter;
  onChange?: (newState: WidgetState) => void;
  referralCode?: string;
  outTokens?: {
    include: Address[];
    exclude: Address[];
  };
  inTokens?: {
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
