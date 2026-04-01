import { mountHeaderAuth, requireAuth, showToast } from "./common.js";

mountHeaderAuth();

const prefetchedPages = new Set();

function prefetchPage(href) {
  const targetHref = String(href || "").trim();
  if (!targetHref || prefetchedPages.has(targetHref)) {
    return;
  }

  const absoluteHref = new URL(targetHref, window.location.href);
  if (absoluteHref.origin !== window.location.origin) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = absoluteHref.href;
  document.head.appendChild(link);
  prefetchedPages.add(targetHref);
}

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

document.querySelectorAll('.service-card[href]').forEach((card) => {
  const href = card.getAttribute("href");
  card.addEventListener("pointerenter", () => prefetchPage(href));
  card.addEventListener("touchstart", () => prefetchPage(href), { passive: true });
});
