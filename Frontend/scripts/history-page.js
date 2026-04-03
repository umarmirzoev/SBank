import {
  apiRequest,
  formatMoney,
  formatDate,
  getSession,
  showToast,
  isAuthenticated
} from "./common.js";

const elements = {
  profileName: document.querySelector(".user-name"),
  donuts: document.querySelectorAll(".donut-val")
};

async function init() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  const session = getSession();
  if (elements.profileName) elements.profileName.textContent = session.fullName || "Иван Иванов";

  animateDonuts();
  setupEventListeners();
}

function animateDonuts() {
  // SVG Donut calculation: 2 * PI * R (R=15.915) approx 100
  // dasharray: "filled empty"
  // For Traty (Red): 40% filled
  // For Inflow (Green): 75% filled
  if (elements.donuts.length >= 2) {
    elements.donuts[0].style.strokeDasharray = "40 60";
    elements.donuts[1].style.strokeDasharray = "75 25";
  }
}

function setupEventListeners() {
  document.querySelectorAll(".filter-btn, .sec-btn").forEach(btn => {
    btn.onclick = () => {
        // Toggle Active
        const parent = btn.parentElement;
        parent.querySelectorAll(".filter-btn, .sec-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        showToast(`Фильтр: ${btn.textContent.trim()}`);
    };
  });

  document.querySelectorAll(".offer-box").forEach(box => {
    box.onclick = () => {
        const title = box.querySelector(".offer-text").textContent;
        showToast(`Открываем: ${title}`);
    };
  });

  document.querySelectorAll(".history-item").forEach(item => {
    item.addEventListener("click", () => {
        const title = item.querySelector(".hist-title").textContent;
        showToast(`Детали операции: ${title}`);
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
