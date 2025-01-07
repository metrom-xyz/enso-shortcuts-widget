import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts()],
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
        "react",
        "react-dom",
        "wagmi",
        "viem",
        "@tanstack/react-query",
      ], // Mark React as a peer dependency
      output: {
        globals: {
          react: "React",
        },
      },
    },
  },
});
