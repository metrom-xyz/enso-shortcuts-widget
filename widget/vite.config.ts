import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => ({
  plugins: [
    mode === "development" ? react() : undefined,
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      bundledPackages: ["./src/types"],
    }), // generates *.d.ts beside the JS
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    lib: {
      entry: "./index.tsx", // Entry point for your component
      name: "ShortcutsWidget", // Global name for UMD builds
      fileName: (format) => `shortcuts-widget.${format}.js`, // Output file naming
    },
    rollupOptions: {
      external: [
        /^wagmi($|\/)/,
        /^react($|\/)/,
        /^react-dom($|\/)/, // removes legacy react-dom/server
        "react",
        "react-dom",
        "wagmi",
        "@tanstack/react-query",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "ReactJsxRuntime",
        },
      },
    },
    sourcemap: true,
    target: "es2018",
  },
  esbuild: {
    jsxImportSource: "react",
  },
}));
