import { mountHeaderAuth, requireAuth, showToast } from "./common.js";

mountHeaderAuth();

document.querySelectorAll("[data-toast]").forEach((element) => {
  element.addEventListener("click", (event) => {
    if (element.getAttribute("href") === "#") {
      event.preventDefault();
    }
    showToast(element.dataset.toast);
  });
});

document.querySelectorAll("[data-scroll-target]").forEach((element) => {
  element.addEventListener("click", () => {
    document.getElementById(element.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll("[data-benefit]").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll("[data-benefit]").forEach((item) => {
      item.classList.toggle("active", item === card);
    });
  });
});

document.querySelectorAll(".faq-item").forEach((item) => {
  item.querySelector(".faq-button")?.addEventListener("click", () => {
    item.classList.toggle("open");
  });
});

document.querySelector("[data-submit-installment]")?.addEventListener("click", () => {
  requireAuth(() => {
    const name = document.getElementById("inst-name")?.value.trim();
    const phone = document.getElementById("inst-phone")?.value.trim();

    if (!name || !phone) {
      showToast("Заполните имя и номер телефона.");
      return;
    }

    showToast("Заявка партнёра отправлена.");
  });
});
