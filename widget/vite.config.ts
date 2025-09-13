import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
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
    // tailwindcss(),
    // cssInjectedByJsPlugin(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    // emptyOutDir: true,
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
  // build: {
  //   lib: {
  //     entry: "./index.tsx", // Entry point for your component
  //     name: "ShortcutsWidget", // Global name for UMD builds
  //     fileName: (format) => `shortcuts-widget.${format}.js`, // Output file naming
  //   },
  //   rollupOptions: {
  //     external: [
  //       /^wagmi($|\/)/,
  //       /^react($|\/)/,
  //       /^react-dom($|\/)/, // removes legacy react-dom/server
  //       "react",
  //       "react-dom",
  //       "wagmi",
  //       "@tanstack/react-query",
  //       "react/jsx-runtime",
  //       "react/jsx-dev-runtime",
  //     ],
  //     output: {
  //       globals: {
  //         react: "React",
  //         "react-dom": "ReactDOM",
  //         "react/jsx-runtime": "ReactJsxRuntime",
  //       },
  //     },
  //   },
  //   sourcemap: true,
  //   target: "es2018",
  // },
  // esbuild: {
  //   jsxImportSource: "react",
  // },
});
