import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5142",
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        app: resolve(__dirname, "somonibank-app.html"),
        cards: resolve(__dirname, "cards.html"),
        auto: resolve(__dirname, "auto.html"),
        transfers: resolve(__dirname, "transfers.html")
      }
    }
  }
});
