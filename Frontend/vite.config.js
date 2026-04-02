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
        news: resolve(__dirname, "news.html"),
        addresses: resolve(__dirname, "addresses.html"),
        documents: resolve(__dirname, "documents.html"),
        delivery: resolve(__dirname, "delivery.html"),
        contact: resolve(__dirname, "contact.html"),
        business: resolve(__dirname, "business.html"),
        salaryProject: resolve(__dirname, "salary-project.html"),
        financing: resolve(__dirname, "financing.html"),
        installmentSales: resolve(__dirname, "installment-sales.html"),
        acquiring: resolve(__dirname, "acquiring.html"),
        settlementAccount: resolve(__dirname, "settlement-account.html"),
        businessTransfers: resolve(__dirname, "business-transfers.html"),
        app: resolve(__dirname, "somonibank-app.html"),
        login: resolve(__dirname, "login.html"),
        cards: resolve(__dirname, "cards.html"),
        auto: resolve(__dirname, "auto.html"),
        transfers: resolve(__dirname, "transfers.html"),
        deposits: resolve(__dirname, "deposits.html"),
        visaBusiness: resolve(__dirname, "visa-business.html")
      }
    }
  }
});
