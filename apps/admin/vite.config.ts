import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter(), tailwindcss(), cloudflare({ viteEnvironment: { name: "ssr" } })],
  resolve: {
    tsconfigPaths: true,
  },
});
