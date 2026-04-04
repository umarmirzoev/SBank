import { apiRequest, clearSession, getSession, showToast } from "./common.js";

const session = getSession();
const redirectToLogin = () => {
  const target = encodeURIComponent("bank.html");
  window.location.href = `login.html?redirect=${target}`;
};

if (!session?.token) {
  redirectToLogin();
}

const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");
const ratesRows = document.getElementById("ratesRows");
const promoGrid = document.getElementById("promoGrid");
const servicesGrid = document.getElementById("servicesGrid");
const searchInput = document.getElementById("searchInput");
const toast = document.getElementById("toastStatus");

const displayName = session?.fullName || session?.FullName || "Иван Иванов";
userName.textContent = displayName;
if (userAvatar) {
  userAvatar.setAttribute("aria-label", displayName);
  userAvatar.innerHTML = `<span>${displayName.trim().charAt(0).toUpperCase()}</span>`;
}

document.getElementById("logoutButton")?.addEventListener("click", () => {
  clearSession();
  window.location.href = "login.html";
});

document.getElementById("searchButton")?.addEventListener("click", () => filterTiles(searchInput.value.trim()));
searchInput?.addEventListener("input", () => filterTiles(searchInput.value.trim()));
document.getElementById("refreshRates")?.addEventListener("click", () => void loadRates(true));
document.getElementById("detailsButton")?.addEventListener("click", () => {
  window.location.href = "somonibank-app.html";
});

function showInlineToast(message) {
  if (!toast) {
    showToast(message);
    return;
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showInlineToast.timer);
  showInlineToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function amountText(value) {
  return Number(value || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });
}

const promoItems = [
  { 
    title: "Депозиты<br>и счета", 
    svg: `<svg viewBox="0 0 64 64" fill="none"><defs><linearGradient id="p1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs><rect x="12" y="16" width="40" height="32" rx="8" fill="url(#p1)"/><circle cx="32" cy="32" r="8" fill="#fff" opacity="0.9"/><circle cx="32" cy="32" r="4" fill="url(#p1)"/></svg>`, 
    action: "deposits" 
  },
  { 
    title: "Обменник<br>валют", 
    svg: `<svg viewBox="0 0 64 64" fill="none"><defs><linearGradient id="p2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs><circle cx="32" cy="32" r="18" fill="url(#p2)"/><path d="M28 24h8v16h-8V24z" fill="#fff"/><circle cx="32" cy="32" r="22" stroke="#4ade80" stroke-width="4" stroke-dasharray="24 12" stroke-linecap="round"/></svg>`, 
    action: "exchange" 
  },
  { 
    title: "Кредит<br>наличными", 
    svg: `<svg viewBox="0 0 64 64" fill="none"><defs><linearGradient id="p3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#93c5fd"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><path d="M12 36l32-20-12 36-6-12L12 36z" fill="url(#p3)"/><path d="M26 40l18-24-12 12v12z" fill="#2563eb" opacity="0.6"/></svg>`, 
    action: "loan" 
  },
  { 
    title: "Карты", 
    svg: `<svg viewBox="0 0 64 64" fill="none"><defs><linearGradient id="p4a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#0284c7"/></linearGradient><linearGradient id="p4b" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0369a1"/></linearGradient></defs><rect x="18" y="16" width="32" height="20" rx="4" fill="url(#p4a)"/><rect x="10" y="26" width="32" height="20" rx="4" fill="url(#p4b)"/><rect x="14" y="32" width="20" height="4" fill="#fff" opacity="0.5" rx="2"/></svg>`, 
    action: "cards" 
  },
  { 
    title: "Карты", 
    svg: `<svg viewBox="0 0 64 64" fill="none"><defs><linearGradient id="p5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs><rect x="10" y="18" width="44" height="28" rx="6" fill="url(#p5)"/><rect x="14" y="24" width="36" height="16" fill="#fff" opacity="0.2" rx="2"/><rect x="24" y="46" width="16" height="4" fill="url(#p5)" rx="2"/></svg>`, 
    action: "cards" 
  },
  { 
    title: "Перевод<br>зарубеж", 
    svg: `<svg viewBox="0 0 64 64" fill="none"><defs><radialGradient id="p6" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#93c5fd"/><stop offset="100%" stop-color="#1e40af"/></radialGradient></defs><circle cx="32" cy="32" r="20" fill="url(#p6)"/><path d="M14 32q18-20 36 0T14 32z" fill="none" stroke="#fff" stroke-width="2" opacity="0.6"/><path d="M32 12c12 0 12 40 0 40S20 12 32 12z" fill="none" stroke="#fff" stroke-width="2" opacity="0.6"/></svg>`, 
    action: "transfers" 
  },
  { 
    title: "Снятие<br>наличных", 
    svg: `<svg viewBox="0 0 64 64" fill="none"><defs><linearGradient id="p7" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a5b4fc"/><stop offset="100%" stop-color="#4f46e5"/></linearGradient><linearGradient id="p7b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs><rect x="16" y="12" width="32" height="36" rx="6" fill="url(#p7)"/><rect x="22" y="18" width="20" height="12" fill="#fff" opacity="0.9" rx="2"/><rect x="24" y="38" width="16" height="16" fill="url(#p7b)" rx="2"/><path d="M26 44h12M26 48h12" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`, 
    action: "cash" 
  },
  { 
    title: "Покупка<br>авто", 
    svg: `<svg viewBox="0 0 64 64" fill="none"><defs><linearGradient id="p8" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs><circle cx="32" cy="32" r="20" fill="none" stroke="url(#p8)" stroke-width="6"/><circle cx="32" cy="32" r="6" fill="url(#p8)"/><path d="M14 32h12M38 32h12M32 14v12" stroke="url(#p8)" stroke-width="6" stroke-linecap="round"/></svg>`, 
    action: "auto" 
  }
];

const serviceItems = [
  { title: "Открыть счёт", subtitle: "Счёт за 5 минут", bgClass: "bg-blue-soft", svg: `<path d="M6 6h12v12H6z" fill="currentColor"/>`, action: "open-account" },
  { title: "Кредиты", subtitle: "Выгодная заявка", bgClass: "bg-green-soft", svg: `<path d="M4 6h16v12H4zM6 8h12v2H6z" fill="currentColor"/>`, action: "loan" },
  { title: "Карты", subtitle: "Доступные дизайны", bgClass: "bg-blue-soft", svg: `<rect x="2" y="6" width="20" height="12" rx="2" fill="currentColor"/><path d="M2 10h20v4H2z" fill="#fff" opacity="0.3"/>`, action: "cards" },
  { title: "Переводы", subtitle: "Карта, номер и QR", bgClass: "bg-orange-soft", svg: `<path d="M4 10l4-4v3h12v2H8v3l-4-4zm16 4l-4 4v-3H4v-2h12v-3l4 4z" fill="currentColor"/>`, action: "transfers" },
  { title: "Платежи", subtitle: "Коммунальные и другие", bgClass: "bg-blue-soft", svg: `<rect x="4" y="6" width="16" height="12" rx="3" fill="currentColor"/><circle cx="12" cy="12" r="3" fill="#fff"/>`, action: "payments" },
  { title: "Помощь счёт", subtitle: "Обзор и переводы", bgClass: "bg-blue-soft", svg: `<path d="M4 4h16v12H4z" fill="currentColor"/><path d="M6 16l4 4v-4z" fill="currentColor"/>`, action: "help" },
  { title: "Заказать карту", subtitle: "Добавим за день", bgClass: "bg-blue-soft", svg: `<rect x="4" y="4" width="12" height="16" rx="2" fill="currentColor"/><rect x="8" y="8" width="12" height="16" rx="2" fill="#2563eb" opacity="0.8"/>`, action: "cards" },
  { title: "Кредитный калькулятор", subtitle: "Платёж и срок", bgClass: "bg-blue-soft", svg: `<rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="#fff"/><circle cx="12" cy="8" r="1.5" fill="#fff"/><circle cx="16" cy="8" r="1.5" fill="#fff"/><rect x="7" y="12" width="10" height="4" fill="#fff" rx="1"/>`, action: "loan-calc" },
  { title: "Отделения и банкоматы", subtitle: "Рядом с вами", bgClass: "bg-blue-soft", svg: `<path d="M12 2c-3.3 0-6 2.7-6 6 0 4.5 6 12 6 12s6-7.5 6-12c0-3.3-2.7-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="currentColor"/>`, action: "branches" },
  { title: "Безопасность", subtitle: "Защита и советы", bgClass: "bg-green-soft", svg: `<path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z" fill="currentColor"/><path d="M10 16l-4-4 1.4-1.4 2.6 2.6 6-6L17.4 8z" fill="#fff"/>`, action: "security" }
];

promoGrid.innerHTML = promoItems.map((item) => `
  <button class="feature-tile" type="button" data-action="${item.action}" data-label="${item.title.replace(/<[^>]*>?/gm, " ")}">
    <span class="feature-icon" aria-hidden="true">${item.svg}</span>
    <strong>${item.title}</strong>
  </button>
`).join("");

servicesGrid.innerHTML = serviceItems.map((item) => `
  <button class="service-card" type="button" data-action="${item.action}" data-label="${item.title}">
    <span class="service-icon ${item.bgClass}" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">${item.svg}</svg>
    </span>
    <span class="service-copy">
      <strong>${item.title}</strong>
      <small>${item.subtitle}</small>
    </span>
  </button>
`).join("");

function bindActions() {
  document.querySelectorAll("[data-action]").forEach((node) => {
    node.addEventListener("click", () => handleAction(node.dataset.action, node.dataset.label || ""));
  });
}

function handleAction(action, label) {
  switch (action) {
    case "deposits":
    case "open-account":
      window.location.href = "deposits.html";
      return;
    case "exchange":
      window.location.href = "index.html";
      return;
    case "loan":
    case "loan-calc":
      window.location.href = "somonibank-app.html";
      return;
    case "cards":
      window.location.href = "cards.html";
      return;
    case "transfers":
      window.location.href = "transfers.html";
      return;
    case "payments":
      window.location.href = "payments.html";
      return;
    case "auto":
      window.location.href = "auto.html";
      return;
    case "branches":
      window.location.href = "addresses.html";
      return;
    case "security":
      showInlineToast("Профиль защищён. Используйте проверенные устройства и не передавайте SMS-коды.");
      return;
    case "cash":
      window.location.href = "addresses.html";
      return;
    case "help":
      showInlineToast("Раздел помощи открывается из поддержки и истории операций.");
      return;
    default:
      showInlineToast(`${label || "Раздел"} открыт.`);
  }
}

function filterTiles(query) {
  const value = String(query || "").trim().toLowerCase();
  const cards = Array.from(document.querySelectorAll(".feature-tile, .service-card"));

  if (!value) {
    cards.forEach((card) => {
      card.hidden = false;
    });
    return;
  }

  let visible = 0;
  cards.forEach((card) => {
    const matches = card.textContent.toLowerCase().includes(value);
    card.hidden = !matches;
    if (matches) {
      visible += 1;
    }
  });

  if (!visible) {
    showInlineToast("По запросу ничего не найдено.");
  }
}

function renderRates(rows) {
  if (!rows.length) {
    ratesRows.innerHTML = `
      <div class="rate-row">
        <div class="currency"><span class="flag">🇺🇸</span><strong>USD</strong></div>
        <strong>9,50</strong>
        <strong>9,60</strong>
      </div>
      <div class="rate-row">
        <div class="currency"><span class="flag">🇪🇺</span><strong>EUR</strong></div>
        <strong>10,94</strong>
        <strong>11,15</strong>
      </div>
      <div class="rate-row">
        <div class="currency"><span class="flag">🇷🇺</span><strong>RUB</strong></div>
        <strong>0,1184</strong>
        <strong>0,1207</strong>
      </div>
    `;
    return;
  }

  ratesRows.innerHTML = rows.map((row) => `
    <div class="rate-row">
      <div class="currency"><span class="flag">${row.flag}</span><strong>${row.code}</strong></div>
      <strong>${row.buy}</strong>
      <strong>${row.sell}</strong>
    </div>
  `).join("");
}

async function loadRates(withToast = false) {
  try {
    const payload = await apiRequest("/api/exchange/rates?page=1&pageSize=30", { auth: true });
    const items = payload?.items || payload?.Items || [];
    const desired = ["USD", "EUR", "RUB"];
    const flags = { USD: "🇺🇸", EUR: "🇪🇺", RUB: "🇷🇺" };

    const mapped = desired.map((code) => {
      const match = items.find((item) => String(item.fromCurrency || item.FromCurrency || "").toUpperCase() === code);
      const buyRate = Number(match?.rate || match?.Rate || 0);
      const sellRate = buyRate ? buyRate * 1.011 : 0;
      return {
        code,
        flag: flags[code] || "•",
        buy: buyRate ? amountText(buyRate) : code === "USD" ? "9,50" : code === "EUR" ? "10,94" : "0,1184",
        sell: sellRate ? amountText(sellRate) : code === "USD" ? "9,60" : code === "EUR" ? "11,15" : "0,1207"
      };
    });

    renderRates(mapped);
    if (withToast) {
      showInlineToast("Курс валют обновлён.");
    }
  } catch {
    renderRates([]);
    if (withToast) {
      showInlineToast("Не удалось загрузить курсы, показаны базовые значения.");
    }
  }
}

bindActions();
void loadRates();

