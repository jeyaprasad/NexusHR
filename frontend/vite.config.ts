import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tanstackStart(), react(), tailwindcss(), tsConfigPaths()],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: process.env.BACKEND_URL || "http://backend:8080",
        changeOrigin: true,
      },
    },
  },
});
