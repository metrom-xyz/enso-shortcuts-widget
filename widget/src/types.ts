export type Address = `${"0x"}${string}`;

export type WidgetProps = {
  apiKey: string;
  obligatedTokenOut?: Address;
};
