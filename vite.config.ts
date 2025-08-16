import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import { securityPlugin } from "./vite-security-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), securityPlugin()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@test": path.resolve(__dirname, "./src/test"),
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
  server: {
    headers: {
      // Security Headers
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy":
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Origin-Isolation": "require-corp",
      "Strict-Transport-Security":
        "max-age=31536000; includeSubDomains; preload",
    },
    https: process.env.NODE_ENV === "production" ? true : false,
  },
  preview: {
    headers: {
      // Security Headers for production preview
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy":
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Origin-Isolation": "require-corp",
      "Strict-Transport-Security":
        "max-age=31536000; includeSubDomains; preload",
    },
    https: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Security: Prevent source map exposure in production
        sourcemap: process.env.NODE_ENV === "development",
      },
    },
  },
});
