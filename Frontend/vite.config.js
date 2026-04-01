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
        somonibank: resolve(__dirname, "somonibank.html"),
        business: resolve(__dirname, "business.html"),
        salaryProject: resolve(__dirname, "salary-project.html"),
        financing: resolve(__dirname, "financing.html"),
        installmentSales: resolve(__dirname, "installment-sales.html"),
        acquiring: resolve(__dirname, "acquiring.html"),
        settlementAccount: resolve(__dirname, "settlement-account.html"),
        businessTransfers: resolve(__dirname, "business-transfers.html"),
        app: resolve(__dirname, "somonibank-app.html"),
        cards: resolve(__dirname, "cards.html"),
        auto: resolve(__dirname, "auto.html"),
        transfers: resolve(__dirname, "transfers.html")
      }
    }
  }
});
