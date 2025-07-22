import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    modules: {
      // Generate readable class names in development
      generateScopedName:
        process.env.NODE_ENV === "development"
          ? "[name]__[local]___[hash:base64:5]"
          : "[hash:base64:8]",
      // Enable CSS modules for all .module.css files
      localsConvention: "camelCase",
    },
    // Enable CSS source maps for better debugging
    devSourcemap: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts", // optional setup file
  },
});
