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

document.querySelectorAll("[data-mini]").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll("[data-mini]").forEach((item) => {
      item.classList.toggle("active", item === card);
    });
  });
});

document.querySelectorAll(".faq-item").forEach((item) => {
  item.querySelector(".faq-button")?.addEventListener("click", () => {
    item.classList.toggle("open");
  });
});

document.querySelector("[data-submit-consult]")?.addEventListener("click", () => {
  requireAuth(() => {
    const name = document.getElementById("salary-name")?.value.trim();
    const phone = document.getElementById("salary-phone")?.value.trim();

    if (!name || !phone) {
      showToast("Заполните имя и номер телефона.");
      return;
    }

    showToast("Заявка на консультацию отправлена.");
  });
});
