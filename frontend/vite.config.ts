import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      proxy: {
        "/health": {
          target: `http://127.0.0.1:${process.env["API_PORT"] ?? 8787}`,
          changeOrigin: true,
        },
        "/api": {
          target: `http://127.0.0.1:${process.env["API_PORT"] ?? 8787}`,
          changeOrigin: true,
        },
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
});
