import SwapWidget from "@/components/SwapWidget";
import { Provider } from "@/components/ui/provider";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { Address, WidgetProps } from "@/types";

export default ({ apiKey, obligatedTokenOut }: WidgetProps) => (
  <Provider>
    <ColorModeProvider>
      <SwapWidget
        apiKey={apiKey}
        obligatedTokenOut={obligatedTokenOut?.toLowerCase() as Address}
      />
    </ColorModeProvider>
  </Provider>
);
