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
userAvatar.textContent = displayName.trim().charAt(0).toUpperCase();

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
  { title: "Депозиты\nи счета", icon: "▣", action: "deposits" },
  { title: "Обменник\nвалют", icon: "$", action: "exchange" },
  { title: "Кредит\nналичными", icon: "✈", action: "loan" },
  { title: "Карты", icon: "▭", action: "cards" },
  { title: "Карты", icon: "▬", action: "cards" },
  { title: "Перевод\nзарубеж", icon: "◉", action: "transfers" },
  { title: "Снятие\nналичных", icon: "▣", action: "cash" },
  { title: "Покупка\nавто", icon: "◌", action: "auto" }
];

const serviceItems = [
  { title: "Открыть счёт", subtitle: "Онлайн веб минут", icon: "◔", iconClass: "", action: "open-account" },
  { title: "Кредиты", subtitle: "Выдача и заявка", icon: "◫", iconClass: "green", action: "loan" },
  { title: "Карты", subtitle: "Доступные дизайны", icon: "▭", iconClass: "", action: "cards" },
  { title: "Переводы", subtitle: "Карта на карту и QR", icon: "↔", iconClass: "orange", action: "transfers" },
  { title: "Платежи", subtitle: "Коммунальные и другое", icon: "▣", iconClass: "", action: "payments" },
  { title: "Помощь счёт", subtitle: "Обзор и переводы", icon: "◒", iconClass: "", action: "help" },
  { title: "Заказать карту", subtitle: "Добавим за день", icon: "◧", iconClass: "", action: "cards" },
  { title: "Кредитный калькулятор", subtitle: "Платёж и срок", icon: "⌗", iconClass: "", action: "loan-calc" },
  { title: "Отделения и банкоматы", subtitle: "Рядом с вами", icon: "⌖", iconClass: "", action: "branches" },
  { title: "Безопасность", subtitle: "Защита и советы", icon: "✔", iconClass: "green", action: "security" }
];

promoGrid.innerHTML = promoItems.map((item) => `
  <button class="feature-tile" type="button" data-action="${item.action}" data-label="${item.title.replace(/\n/g, " ")}">
    <span class="feature-icon">${item.icon}</span>
    <strong>${item.title.replace(/\n/g, "<br>")}</strong>
  </button>
`).join("");

servicesGrid.innerHTML = serviceItems.map((item) => `
  <button class="service-card" type="button" data-action="${item.action}" data-label="${item.title}">
    <span class="service-icon ${item.iconClass || ""}">${item.icon}</span>
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
      showInlineToast("Курсы валют обновлены.");
      void loadRates(true);
      return;
    case "loan":
    case "loan-calc":
      showInlineToast("Кредитный раздел готов к подключению заявки.");
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
      showInlineToast("Ближайшие банкоматы можно найти в разделе отделений.");
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
