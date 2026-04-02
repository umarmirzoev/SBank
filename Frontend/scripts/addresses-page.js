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

const branchItems = Array.from(document.querySelectorAll(".branch-item"));
const showMoreBtn = document.getElementById("showMoreBtn");
let expandedList = false;

function applyVisibleBranches() {
  branchItems.forEach((item, index) => {
    item.hidden = !expandedList && index > 3;
  });
}

applyVisibleBranches();

showMoreBtn?.addEventListener("click", () => {
  expandedList = !expandedList;
  applyVisibleBranches();
  showMoreBtn.textContent = expandedList ? "Скрыть" : "Показать ещё";
});

branchItems.forEach((button) => {
  button.addEventListener("click", () => {
    const details = button.querySelector(".branch-details");
    const arrow = button.querySelector(".branch-arrow");
    const isHidden = details.hasAttribute("hidden");

    if (isHidden) {
      details.removeAttribute("hidden");
      arrow.textContent = "⌃";
    } else {
      details.setAttribute("hidden", "");
      arrow.textContent = "⌄";
    }
  });
});

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    showToast(`Показаны точки: ${button.textContent.trim()}`);
  });
});
