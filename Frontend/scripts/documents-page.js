import { showToast } from "./common.js";

document.querySelectorAll("[data-toast]").forEach((element) => {
  element.addEventListener("click", (event) => {
    if (element.getAttribute("href") === "#") {
      event.preventDefault();
    }

    showToast(element.dataset.toast);
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const selectedDocTitle = document.getElementById("selectedDocTitle");

document.querySelectorAll(".doc-link").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".doc-link").forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    const nextTitle = button.dataset.docTitle || button.textContent.trim();
    selectedDocTitle.textContent = nextTitle;
    showToast(`Выбран раздел: ${nextTitle}`);
  });
});

const archiveToggle = document.getElementById("archiveToggle");
const archiveList = document.getElementById("archiveList");

archiveToggle?.addEventListener("click", () => {
  const isHidden = archiveList.hasAttribute("hidden");
  if (isHidden) {
    archiveList.removeAttribute("hidden");
  } else {
    archiveList.setAttribute("hidden", "");
  }

  archiveToggle.classList.toggle("open", isHidden);
});
