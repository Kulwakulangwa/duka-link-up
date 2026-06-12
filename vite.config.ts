import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    preset: "vercel",
    output: {
      dir: "dist",
      serverDir: "api/server",
      publicDir: "dist/client",
    },
  },
});