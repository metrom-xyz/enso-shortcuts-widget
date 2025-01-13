export type Address = `${"0x"}${string}`;

export type WidgetProps = {
  apiKey: string;
  obligatedTokenOut?: Address;
};

export enum NotifyType {
  Success = "success",
  Error = "error",
  Info = "info",
  Loading = "loading",
}
