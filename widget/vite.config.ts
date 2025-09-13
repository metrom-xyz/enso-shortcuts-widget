import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { peerDependencies } from "./package.json";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      bundledPackages: ["./src/types"],
      outDir: "dist",
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    emptyOutDir: true,
    lib: {
      entry: "src/index.ts",
      cssFileName: "styles",
      formats: ["es"],
    },
    rollupOptions: {
      external: [...Object.keys(peerDependencies), "react/jsx-runtime"],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
