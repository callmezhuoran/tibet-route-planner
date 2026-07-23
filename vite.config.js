import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  publicDir: "data",
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        routeMap: resolve(import.meta.dirname, "route-map-cartoon.html")
      }
    }
  }
});
