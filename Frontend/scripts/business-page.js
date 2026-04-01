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
  element.addEventListener("click", (event) => {
    const target = document.getElementById(element.dataset.scrollTarget);
    if (!target) {
      return;
    }
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelectorAll(".sub-nav a").forEach((link) => {
      link.classList.toggle("active-sub", link === element);
    });
  });
});

document.querySelector("[data-business-start]")?.addEventListener("click", () => {
  requireAuth(() => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Выберите сервис для бизнеса ниже.");
  });
});

document.querySelectorAll("[data-feature]").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll("[data-feature]").forEach((item) => {
      item.classList.toggle("active", item === card);
    });
  });
});

document.querySelectorAll("[data-service]").forEach((card) => {
  card.addEventListener("click", () => {
    const targetHref = card.dataset.href;
    if (targetHref) {
      window.location.href = targetHref;
      return;
    }

    document.querySelectorAll("[data-service]").forEach((item) => {
      item.classList.toggle("active", item === card);
    });
    const title = card.querySelector("h3")?.textContent?.trim() || "Сервис";
    showToast(`${title} выбран.`);
  });
});
