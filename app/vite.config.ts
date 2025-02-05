import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// @ts-expect-error  env is accessible
const basePath = process.env.VITE_BASE_PATH;

console.log(basePath);
// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
