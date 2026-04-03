import { apiRequest, clearSession, formatMoney, getSession, showToast, unwrapResponse } from "./common.js";

const session = getSession();
const redirectToLogin = () => {
  const target = encodeURIComponent("payments.html");
  window.location.href = `login.html?redirect=${target}`;
};

if (!session?.token) {
  redirectToLogin();
}

const quickActions = document.getElementById("quickActions");
const financeServices = document.getElementById("financeServices");
const connectionServices = document.getElementById("connectionServices");
const stateServices = document.getElementById("stateServices");
const serviceServices = document.getElementById("serviceServices");
const otherServices = document.getElementById("otherServices");
const favoriteChips = document.getElementById("favoriteChips");
const searchInput = document.getElementById("searchInput");
const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");
const currentBalance = document.getElementById("currentBalance");
const recentCount = document.getElementById("recentCount");
const exchangeRate = document.getElementById("exchangeRate");
const monthlySpent = document.getElementById("monthlySpent");
const toast = document.getElementById("toastStatus");

const fallbackUserName = session?.fullName || session?.FullName || "Иван Иванов";
userName.textContent = fallbackUserName;
userAvatar.textContent = fallbackUserName.trim().charAt(0).toUpperCase();

document.getElementById("logoutButton")?.addEventListener("click", () => {
  clearSession();
  window.location.href = "login.html";
});

document.getElementById("searchButton")?.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) {
    showInlineToast("Введите название услуги или сервиса.");
    return;
  }
  filterServices(query);
});

searchInput?.addEventListener("input", () => filterServices(searchInput.value.trim()));

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

function initials(text) {
  return String(text || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function shortMoney(value, currency = "TJS") {
  return formatMoney(value, currency === "TJS" ? "c." : currency);
}

function getPagedItems(payload) {
  return payload?.items || payload?.Items || payload?.data || payload?.Data || [];
}

function normalizeTransactions(items) {
  return items.map((item) => ({
    title: item.description || item.Description || item.type || item.Type || "Платёж",
    amount: Number(item.amount || item.Amount || 0),
    currency: item.currency || item.Currency || "TJS",
    createdAt: item.createdAt || item.CreatedAt || null
  }));
}

function formatRelativeDate(value) {
  if (!value) {
    return "Без даты";
  }

  const date = new Date(value);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short"
  });
}

function createServiceCard(item) {
  return `
    <button class="service-card ${item.variant || ""}" type="button" data-action="${item.action}" data-label="${item.title}">
      <span class="service-icon ${item.iconClass || ""}">${item.icon}</span>
      <span class="service-copy">
        <strong>${item.title}</strong>
        <small>${item.subtitle}</small>
      </span>
    </button>
  `;
}

function createQuickAction(item) {
  return `
    <button class="quick-card" type="button" data-action="${item.action}" data-label="${item.title}">
      <span class="quick-icon ${item.iconClass || ""}">${item.icon}</span>
      <strong>${item.title}</strong>
    </button>
  `;
}

function createFavoriteChip(item) {
  return `
    <button class="favorite-chip" type="button" data-action="${item.action}" data-label="${item.title}">
      <span class="favorite-chip-icon">${item.icon}</span>
      <span>${item.title}</span>
    </button>
  `;
}

const quickActionData = [
  { title: "Запрос денег", subtitle: "Новый запрос", icon: "↓", iconClass: "green", action: "request-money" },
  { title: "Избранные", subtitle: "Частые операции", icon: "☆", iconClass: "mint", action: "show-favorites" },
  { title: "Автоплатежи", subtitle: "Управление", icon: "⌘", iconClass: "cyan", action: "open-autopay" }
];

const favoriteData = [
  { title: "Все", icon: "•", action: "filter-all" },
  { title: "Популярное", icon: "👍", action: "filter-popular" },
  { title: "Финансы", icon: "⌂", action: "filter-finance" },
  { title: "Связь", icon: "◔", action: "filter-connection" },
  { title: "Госуслуги", icon: "▣", action: "filter-state" },
  { title: "Другое", icon: "◎", action: "filter-other" }
];

const financeServiceData = [
  { title: "Кошельки", subtitle: "Интернет", icon: "◫", action: "wallets" },
  { title: "Обмен валют", subtitle: "Выгодный курс", icon: "$", action: "exchange", variant: "banner", iconClass: "money" },
  { title: "Переводы", subtitle: "Перевод денег", icon: "✈", action: "transfers" }
];

const connectionServiceData = [
  { title: "Мобильная связь", subtitle: "Избранный курс", icon: "◧", action: "mobile" },
  { title: "Интернет", subtitle: "Учётка курс", icon: "▤", action: "internet" },
  { title: "Городская связь", subtitle: "Легко дома", icon: "⬒", action: "landline" },
  { title: "Магазины", subtitle: "Сервисдо", icon: "▣", action: "shops" }
];

const stateServiceData = [
  { title: "Налоги", subtitle: "Дампл платежи", icon: "▤", action: "taxes" },
  { title: "Госуслуги", subtitle: "Учётный курс", icon: "◫", action: "state-services" },
  { title: "Домены", subtitle: "Онлайн и хостинг", icon: "◁", action: "domains" }
];

const serviceServiceData = [
  { title: "Магазины", subtitle: "Госуслуги", icon: "▣", action: "shops" },
  { title: "Фонды, помощь", subtitle: "Платежи", icon: "◌", action: "charity" },
  { title: "Юридические услуги", subtitle: "Оформление", icon: "☰", action: "legal" }
];

const otherServiceData = [
  { title: "Домены", subtitle: "Реклама", icon: "⌁", action: "domains" },
  { title: "Юридические услуги", subtitle: "Документы", icon: "☷", action: "legal" }
];

quickActions.innerHTML = quickActionData.map(createQuickAction).join("");
favoriteChips.innerHTML = favoriteData.map(createFavoriteChip).join("");
financeServices.innerHTML = financeServiceData.map(createServiceCard).join("");
connectionServices.innerHTML = connectionServiceData.map(createServiceCard).join("");
stateServices.innerHTML = stateServiceData.map(createServiceCard).join("");
serviceServices.innerHTML = serviceServiceData.map(createServiceCard).join("");
otherServices.innerHTML = otherServiceData.map(createServiceCard).join("");

function bindActions() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action, button.dataset.label || ""));
  });
}

function filterServices(query) {
  const normalized = query.toLowerCase();
  const cards = Array.from(document.querySelectorAll(".service-card"));

  if (!normalized) {
    cards.forEach((card) => {
      card.hidden = false;
    });
    return;
  }

  let visibleCount = 0;
  cards.forEach((card) => {
    const matches = card.textContent.toLowerCase().includes(normalized);
    card.hidden = !matches;
    if (matches) {
      visibleCount += 1;
    }
  });

  if (visibleCount === 0) {
    showInlineToast("По запросу ничего не найдено.");
  }
}

function handleAction(action, label) {
  switch (action) {
    case "transfers":
      window.location.href = "transfers.html";
      return;
    case "exchange":
      showInlineToast("Курсы валют обновлены. Откройте обмен ниже в финансовом блоке.");
      document.getElementById("financeTitle")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    case "open-autopay":
      showInlineToast("Загружаем ваши автоплатежи.");
      loadRecurringPayments();
      return;
    case "show-favorites":
      document.getElementById("favoriteBlock")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    case "request-money":
      showInlineToast("Запрос денег будет доступен в следующем шаге продукта.");
      return;
    case "filter-all":
      filterServices("");
      return;
    case "filter-popular":
      showInlineToast("Показаны популярные сервисы.");
      return;
    case "filter-finance":
      document.getElementById("financeTitle")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    case "filter-connection":
      document.getElementById("connectionTitle")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    case "filter-state":
      document.getElementById("stateTitle")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    case "filter-other":
      document.getElementById("otherTitle")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    default:
      showInlineToast(`${label || "Раздел"} открыт.`);
  }
}

async function loadRecurringPayments() {
  try {
    const payload = await apiRequest("/api/recurring-payments/my?page=1&pageSize=3", { auth: true });
    const items = getPagedItems(payload);
    if (!items.length) {
      showInlineToast("У вас пока нет автоплатежей.");
      return;
    }
    showInlineToast(`Найдено автоплатежей: ${items.length}.`);
  } catch {
    showInlineToast("Не удалось загрузить автоплатежи.");
  }
}

async function loadMetrics() {
  try {
    const [accountsPayload, transactionsPayload, ratesPayload] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true }),
      apiRequest("/api/transactions/recent", { auth: true }),
      apiRequest("/api/exchange/rates?page=1&pageSize=20", { auth: true })
    ]);

    const accounts = getPagedItems(accountsPayload);
    const transactions = normalizeTransactions(getPagedItems(transactionsPayload));
    const rates = getPagedItems(ratesPayload);

    const total = accounts.reduce((sum, item) => sum + Number(item.balance || item.Balance || 0), 0);
    const spent = transactions
      .filter((item) => item.amount < 0)
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    currentBalance.textContent = shortMoney(total || 0);
    recentCount.textContent = `${transactions.length} операций`;
    monthlySpent.textContent = shortMoney(spent || 0);

    const usdRate = rates.find((item) => String(item.toCurrency || item.ToCurrency || "").toUpperCase() === "TJS");
    if (usdRate) {
      const amount = Number(usdRate.rate || usdRate.Rate || 0);
      exchangeRate.textContent = amount > 0 ? `1 USD = ${formatMoney(amount, "TJS")}` : "Курс уточняется";
    }
  } catch {
    currentBalance.textContent = "0 c.";
    recentCount.textContent = "0 операций";
    exchangeRate.textContent = "Курс уточняется";
    monthlySpent.textContent = "0 c.";
  }
}

async function loadProviders() {
  try {
    const payload = unwrapResponse(await apiRequest("/api/BillPayment/categories", { auth: true }));
    const items = Array.isArray(payload.data) ? payload.data : [];
    if (items.length) {
      const topNames = items.slice(0, 3).map((item) => item.name || item.Name).filter(Boolean);
      if (topNames.length) {
        showInlineToast(`Доступны категории: ${topNames.join(", ")}.`);
      }
    }
  } catch {
    // Silent fallback: the layout still works without categories.
  }
}

bindActions();
void loadMetrics();
void loadProviders();
