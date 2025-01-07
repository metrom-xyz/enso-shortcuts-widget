# Shortcuts Widget

## Overview

This widget is a React component designed to provide a user-friendly interface for swapping tokens. It integrates with Enso API to allow not only simple swaps but also operations like zap-in.

## Features

- Swap any-to any tokens
- Perform zap-in operations
- Display of token details including balance, USD cost, slippage and etc
- Enabled DeFi operations composition since Enso API is used

## Installation

To install the widget, you need to have Node.js and npm installed. Then, run the following command in your project directory:

```bash
npm install @ensofinance/shortcuts-widget
```

## Usage
`wagmi` and `viem` are peer dependencies. Your project should be using them.
To use the widget in your React application, import the `ShortcutsWidget` component and include it in your JSX:

```typescript
import React, { useState } from 'react';
import ShortcutsWidget from '@ensofinance/shortcuts-widget';

const App = () => {
  return (
    <div>
      <ShortcutsWidget apiKey={"YOUR_API_KEY"} />
    </div>
  );
};

export default App;
```

## Configuration

### Environment Variables

### Props

The `ShortcutsWidget` component accepts the following props:

- `apiKey` (string): Enso API key (required)
- `obligatedTokenOut` (string): Token address if needed to lock `tokenOut` selection

## License

This project is licensed under the ISC License. See the `LICENSE` file for more details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## Contact

For any questions or support, please contact the Enso Finance team at [support@ensofinance.com](mailto:support@ensofinance.com).