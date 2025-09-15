import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { peerDependencies } from "./package.json";

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.json",
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    emptyOutDir: true,
    lib: {
      entry: { index: "src/index.tsx" },
      cssFileName: "styles",
      formats: ["es"],
    },
    rollupOptions: {
      external: Object.keys(peerDependencies),
    },
  },
});
