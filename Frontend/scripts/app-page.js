import { getSession, showToast, formatMoney } from "./common.js";

// DOM Elements
const userNameEl = document.querySelectorAll(".user-name")[0];
const userAvatarEl = document.querySelector(".user-avatar");
const totalBalEl = document.querySelector(".hero-bal");
const bonusEl = document.querySelector(".hero-bonus span");

const session = getSession();

// Setup Profile
if (session) {
    // We override for demo purposes to match photo "Алексей" if no session name exists
    const displayName = session.fullName || "Алексей";
    if (userNameEl) userNameEl.textContent = displayName;
    if (userAvatarEl) userAvatarEl.src = `https://i.pravatar.cc/100?u=${displayName}`;
}

// Initial Data matching photo
function initDashboard() {
    if (totalBalEl) totalBalEl.textContent = "0.05 с.";
    if (bonusEl) bonusEl.textContent = "1.44 бонусов";

    // Setup Toasts for all buttons
    document.querySelectorAll("button, .pop-card, .svc-box").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const text = btn.innerText || btn.querySelector(".pop-label")?.innerText || "Действие";
            showToast(`Функция "${text.trim()}" в разработке`);
        });
    });

    // Verification Close
    const secClose = document.querySelector(".sec-close");
    if (secClose) {
        secClose.addEventListener("click", () => {
            document.querySelector(".security-widget").style.display = "none";
        });
    }

    // Redirects for Sidebar (if any are still #)
    document.querySelectorAll(".nav-item a").forEach(link => {
        if (link.getAttribute("href") === "#") {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                showToast("Эта страница скоро появится!");
            });
        }
    });

    console.log("Dashboard initialized with photo-exact data.");
}

document.addEventListener("DOMContentLoaded", initDashboard);
initDashboard();
