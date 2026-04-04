import { apiRequest, clearSession, formatMoney, formatDate, getSession, requireAuth, showToast, unwrapResponse } from "./common.js";

const state = {
  session: getSession(),
  accounts: [],
  categories: [],
  mobileCategory: null,
  providers: [],
  selectedProviderId: null,
  payments: [],
  autopay: false
};

document.addEventListener("DOMContentLoaded", () => {
  requireAuth(initPage);
});

function initPage(session) {
  state.session = session;
  const elements = getElements();
  hydrateProfile(elements, session);
  bindEvents(elements);
  loadData(elements);
}

function getElements() {
  return {
    userName: document.getElementById("userName"),
    userAvatar: document.getElementById("userAvatar"),
    searchInput: document.getElementById("searchInput"),
    accountSelect: document.getElementById("accountSelect"),
    phoneInput: document.getElementById("phoneInput"),
    amountInput: document.getElementById("amountInput"),
    amountCurrency: document.getElementById("amountCurrency"),
    totalInfo: document.getElementById("totalInfo"),
    providersList: document.getElementById("providersList"),
    popularServices: document.getElementById("popularServices"),
    recentPayments: document.getElementById("recentPayments"),
    categoryName: document.getElementById("categoryName"),
    payButton: document.getElementById("payButton"),
    autopayToggle: document.getElementById("autopayToggle"),
    modeToggle: document.getElementById("modeToggle")
  };
}

function hydrateProfile(elements, session) {
  const fullName = session?.fullName || "Клиент";
  elements.userName.textContent = fullName;
  elements.userAvatar.textContent = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function bindEvents(elements) {
  elements.amountInput.addEventListener("input", () => updateSummary(elements));
  elements.accountSelect.addEventListener("change", () => updateSummary(elements));
  elements.phoneInput.addEventListener("input", () => {
    elements.phoneInput.value = formatPhone(elements.phoneInput.value);
  });
  elements.payButton.addEventListener("click", async () => {
    await submitTopup(elements);
  });
  elements.autopayToggle.addEventListener("click", () => {
    state.autopay = !state.autopay;
    elements.autopayToggle.classList.toggle("active", state.autopay);
    showToast(state.autopay ? "Автоплатеж включён" : "Автоплатеж выключен");
  });
  elements.modeToggle.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      elements.modeToggle.querySelectorAll("[data-mode]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      if (button.dataset.mode === "history") {
        document.getElementById("recentPayments")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

async function loadData(elements) {
  try {
    const [accountsPayload, categoriesPayload, paymentsPayload] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true }),
      apiRequest("/api/BillPayment/categories", { auth: true }),
      apiRequest("/api/BillPayment/my?page=1&pageSize=8", { auth: true })
    ]);

    state.accounts = accountsPayload.Items || accountsPayload.items || [];
    state.categories = extractArray(categoriesPayload);
    state.payments = paymentsPayload.Items || paymentsPayload.items || [];
    state.mobileCategory = findMobileCategory(state.categories);

    renderAccounts(elements);
    renderPopularServices(elements);
    renderRecentPayments(elements);

    if (state.mobileCategory) {
      elements.categoryName.textContent = state.mobileCategory.Name || state.mobileCategory.name || "Мобильная связь";
      await loadProviders(elements, state.mobileCategory.Id || state.mobileCategory.id);
    } else {
      elements.providersList.innerHTML = `<div class="empty-state">Категория мобильной связи пока не настроена в backend.</div>`;
    }

    updateSummary(elements);
  } catch (error) {
    console.error(error);
    elements.providersList.innerHTML = `<div class="empty-state">Не удалось загрузить реальные данные для пополнения.</div>`;
    elements.recentPayments.innerHTML = `<div class="empty-state">История платежей недоступна.</div>`;
    showToast("Не удалось загрузить страницу мобильной связи");
  }
}

function extractArray(payload) {
  const unwrapped = unwrapResponse(payload);
  if (Array.isArray(unwrapped)) {
    return unwrapped;
  }
  if (Array.isArray(unwrapped?.data)) {
    return unwrapped.data;
  }
  return [];
}

function findMobileCategory(categories) {
  return categories.find((item) => {
    const code = String(item.Code || item.code || "").toLowerCase();
    const name = String(item.Name || item.name || "").toLowerCase();
    return code.includes("mobile") || code.includes("phone") || name.includes("мобиль") || name.includes("связ");
  }) || null;
}

async function loadProviders(elements, categoryId) {
  const payload = await apiRequest(`/api/BillPayment/categories/${categoryId}/providers`, { auth: true });
  state.providers = extractArray(payload);
  state.selectedProviderId = state.providers[0]?.Id || state.providers[0]?.id || null;
  renderProviders(elements);
}

function renderProviders(elements) {
  if (!state.providers.length) {
    elements.providersList.innerHTML = `<div class="empty-state">Для мобильной связи пока нет доступных операторов.</div>`;
    return;
  }

  elements.providersList.innerHTML = state.providers.map((provider) => {
    const id = provider.Id || provider.id;
    const name = provider.Name || provider.name;
    const code = provider.Code || provider.code || "";
    const initials = code ? code.slice(0, 3).toUpperCase() : name.slice(0, 2).toUpperCase();
    return `
      <button class="provider-btn ${String(id) === String(state.selectedProviderId) ? "active" : ""}" type="button" data-provider-id="${id}">
        <span class="provider-logo">${initials}</span>
        <span class="provider-copy">
          <strong>${name}</strong>
          <span>${code || "Оператор"}</span>
        </span>
      </button>
    `;
  }).join("");

  elements.providersList.querySelectorAll("[data-provider-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedProviderId = button.dataset.providerId;
      renderProviders(elements);
    });
  });
}

function renderAccounts(elements) {
  const tjsAccounts = state.accounts.filter((account) => String(account.Currency || account.currency || "").toUpperCase() === "TJS");
  const accounts = tjsAccounts.length ? tjsAccounts : state.accounts;

  if (!accounts.length) {
    elements.accountSelect.innerHTML = `<option value="">Нет доступных счетов</option>`;
    elements.payButton.disabled = true;
    return;
  }

  elements.accountSelect.innerHTML = accounts.map((account) => {
    const id = account.Id || account.id;
    const number = account.AccountNumber || account.accountNumber;
    const balance = account.Balance ?? account.balance ?? 0;
    const currency = account.Currency || account.currency || "TJS";
    return `<option value="${id}" data-currency="${currency}">Счёт ${number} • ${formatMoney(balance, currency)}</option>`;
  }).join("");
}

function renderPopularServices(elements) {
  const topCategories = state.categories.slice(0, 4);
  if (!topCategories.length) {
    elements.popularServices.innerHTML = `<div class="empty-state">Список услуг загрузится из backend позже.</div>`;
    return;
  }

  elements.popularServices.innerHTML = topCategories.map((category, index) => `
    <div class="service-item ${index === 0 ? "active" : ""}">
      <div class="service-icon">${index + 1}</div>
      <div class="service-copy">
        <strong>${category.Name || category.name}</strong>
        <span>${category.Code || category.code || "Категория услуг"}</span>
      </div>
    </div>
  `).join("");
}

function renderRecentPayments(elements) {
  const mobilePayments = state.payments.filter((payment) => {
    const category = String(payment.CategoryName || payment.categoryName || "").toLowerCase();
    return category.includes("мобиль") || category.includes("связ");
  });

  if (!mobilePayments.length) {
    elements.recentPayments.innerHTML = `<div class="empty-state">У вас пока нет реальных пополнений мобильной связи.</div>`;
    return;
  }

  elements.recentPayments.innerHTML = mobilePayments.slice(0, 4).map((payment) => `
    <div class="recent-item">
      <div class="recent-icon">✓</div>
      <div class="recent-copy">
        <strong>${payment.AccountNumber || payment.accountNumber}</strong>
        <span>${payment.ProviderName || payment.providerName}</span>
        <em>${formatDate(payment.CreatedAt || payment.createdAt)}</em>
      </div>
      <div class="recent-amount">${formatMoney(payment.Amount || payment.amount || 0, payment.Currency || payment.currency || "TJS")}</div>
    </div>
  `).join("");
}

function updateSummary(elements) {
  const amount = Number(elements.amountInput.value || 0);
  const selectedOption = elements.accountSelect.selectedOptions[0];
  const currency = selectedOption?.dataset.currency || "TJS";
  elements.amountCurrency.textContent = currency;
  elements.totalInfo.textContent = `Итого к списанию: ${formatMoney(amount || 0, currency)}`;
}

function formatPhone(rawValue) {
  const digits = rawValue.replace(/\D/g, "");
  let localDigits = digits;
  if (localDigits.startsWith("992")) {
    localDigits = localDigits.slice(3);
  }
  localDigits = localDigits.slice(0, 9);
  const chunks = [localDigits.slice(0, 3), localDigits.slice(3, 6), localDigits.slice(6, 9)].filter(Boolean);
  return `+992 ${chunks.join(" ")}`.trim();
}

async function submitTopup(elements) {
  const accountId = elements.accountSelect.value;
  const providerId = state.selectedProviderId;
  const amount = Number(elements.amountInput.value || 0);
  const phone = elements.phoneInput.value.replace(/\s+/g, "");
  const selectedOption = elements.accountSelect.selectedOptions[0];
  const currency = selectedOption?.dataset.currency || "TJS";

  if (!accountId) {
    showToast("Выберите счёт для списания");
    return;
  }
  if (!providerId) {
    showToast("Выберите мобильного оператора");
    return;
  }
  if (!/^\+992\d{9}$/.test(phone)) {
    showToast("Введите номер в формате +992 и 9 цифр");
    return;
  }
  if (amount <= 0) {
    showToast("Введите сумму пополнения");
    return;
  }

  try {
    const provider = state.providers.find((item) => String(item.Id || item.id) === String(providerId));
    await apiRequest("/api/BillPayment/pay", {
      method: "POST",
      auth: true,
      body: {
        accountId,
        providerId,
        accountNumber: phone,
        amount,
        currency,
        description: `Пополнение мобильного ${provider?.Name || provider?.name || ""}`.trim()
      }
    });

    showToast("Пополнение выполнено успешно");
    elements.amountInput.value = "";
    await loadData(elements);
  } catch (error) {
    console.error(error);
    showToast(error.message || "Не удалось выполнить пополнение");
  }
}
