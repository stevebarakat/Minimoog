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
      // Security Headers (relaxed for local development)
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy":
        "camera=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
      // Removed strict CORS headers for local network access
    },
  },
  preview: {
    headers: {
      // Security Headers for production preview
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy":
        "camera=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
      // Removed strict CORS headers for local development
    },
  },
  build: {
    // Increase chunk size warning limit to 1000kb for audio processing apps
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Security: Prevent source map exposure in production
        sourcemap: process.env.NODE_ENV === "development",
        // Manual chunk splitting for better caching and loading performance
        manualChunks: {
          // Vendor chunks for better caching
          "react-vendor": ["react", "react-dom"],
          "radix-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-toast",
            "@radix-ui/react-toggle",
            "@radix-ui/react-tooltip",
          ],
          "ui-vendor": ["react-rnd", "clsx"],
          "utils-vendor": ["loglevel", "lucide-react"],
          "state-vendor": ["zustand"],
        },
        // Optimize chunk naming for better debugging
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split("/")
                .pop()
                ?.replace(".tsx", "")
                .replace(".ts", "")
            : "chunk";
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    // Enable minification for smaller bundle sizes
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: process.env.NODE_ENV === "production",
      },
    },
  },
});
