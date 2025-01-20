import { Address } from "viem";

export type WidgetProps = {
  tokenOut?: Address;
  tokenIn?: Address;
  obligateSelection?: boolean;
  enableShare?: boolean;
  indicateRoute?: boolean;
};

export enum NotifyType {
  Success = "success",
  Error = "error",
  Info = "info",
  Loading = "loading",
}
