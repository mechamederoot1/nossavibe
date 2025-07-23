import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    host: "0.0.0.0", // Allow external connections
    port: 5173,
    strictPort: false,
    hmr: {
      host: "localhost", // HMR should work on localhost
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
});
