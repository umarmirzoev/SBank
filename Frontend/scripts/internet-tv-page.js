import { apiRequest, formatMoney, formatDate, getSession, requireAuth, showToast, unwrapResponse } from "./common.js";

const INTERNET_PROVIDER_PRESET_KEY = "sb-internet-provider-preset";

const state = {
  session: getSession(),
  accounts: [],
  categories: [],
  providers: [],
  selectedProviderId: null,
  payments: []
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
    accountNumberInput: document.getElementById("accountNumberInput"),
    accountSelect: document.getElementById("accountSelect"),
    amountInput: document.getElementById("amountInput"),
    amountCurrency: document.getElementById("amountCurrency"),
    totalInfo: document.getElementById("totalInfo"),
    providersList: document.getElementById("providersList"),
    popularServices: document.getElementById("popularServices"),
    recentPayments: document.getElementById("recentPayments"),
    payButton: document.getElementById("payButton")
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
  elements.payButton.addEventListener("click", async () => {
    await submitPayment(elements);
  });
}

async function loadData(elements) {
  try {
    const [accountsPayload, categoriesPayload, paymentsPayload] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true }),
      apiRequest("/api/BillPayment/categories", { auth: true }),
      apiRequest("/api/BillPayment/my?page=1&pageSize=20", { auth: true })
    ]);

    state.accounts = accountsPayload.Items || accountsPayload.items || [];
    state.categories = extractArray(categoriesPayload);
    state.payments = paymentsPayload.Items || paymentsPayload.items || [];

    renderAccounts(elements);
    await loadProviders(elements);
    renderPopularServices(elements);
    renderRecentPayments(elements);
    updateSummary(elements);
  } catch (error) {
    console.error(error);
    elements.providersList.innerHTML = `<div class="empty-state">Не удалось загрузить провайдеров интернета и ТВ.</div>`;
    elements.recentPayments.innerHTML = `<div class="empty-state">История платежей недоступна.</div>`;
    showToast("Не удалось загрузить страницу Интернет и ТВ");
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

async function loadProviders(elements) {
  const internetCategory = state.categories.find((item) => String(item.Code || item.code || "").toLowerCase() === "internet");
  const tvCategory = state.categories.find((item) => String(item.Code || item.code || "").toLowerCase() === "tv");
  const payloads = await Promise.all(
    [internetCategory, tvCategory]
      .filter(Boolean)
      .map((item) => apiRequest(`/api/BillPayment/categories/${item.Id || item.id}/providers`, { auth: true }))
  );

  state.providers = payloads.flatMap((payload) => extractArray(payload));
  state.selectedProviderId = resolvePresetProviderId(state.providers) || state.providers[0]?.Id || state.providers[0]?.id || null;
  renderProviders(elements);
}

function resolvePresetProviderId(providers) {
  const preset = sessionStorage.getItem(INTERNET_PROVIDER_PRESET_KEY);
  if (!preset) {
    return null;
  }

  const normalizedPreset = normalizeName(preset);
  const matched = providers.find((provider) => {
    const name = normalizeName(provider.Name || provider.name || "");
    const code = normalizeName(provider.Code || provider.code || "");
    return name === normalizedPreset || code === normalizedPreset || name.includes(normalizedPreset) || normalizedPreset.includes(name);
  });

  sessionStorage.removeItem(INTERNET_PROVIDER_PRESET_KEY);
  return matched ? (matched.Id || matched.id) : null;
}

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/tajnet/g, "tojnet")
    .replace(/tv/g, "tv")
    .replace(/[^a-z0-9а-яё]/g, "");
}

function renderProviders(elements) {
  if (!state.providers.length) {
    elements.providersList.innerHTML = `<div class="empty-state">Провайдеры интернета и ТВ пока недоступны.</div>`;
    return;
  }

  elements.providersList.innerHTML = state.providers.map((provider) => {
    const id = provider.Id || provider.id;
    const name = provider.Name || provider.name;
    const code = provider.Code || provider.code || "";
    const initials = code ? code.slice(0, 3).toUpperCase() : String(name).slice(0, 2).toUpperCase();
    return `
      <button class="provider-btn ${String(id) === String(state.selectedProviderId) ? "active" : ""}" type="button" data-provider-id="${id}">
        <span class="provider-logo">${escapeHtml(initials)}</span>
        <span class="provider-copy">
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(code || "Провайдер")}</span>
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
    return `<option value="${id}" data-currency="${currency}">Счет ${escapeHtml(number)} • ${escapeHtml(formatMoney(balance, currency))}</option>`;
  }).join("");
}

function renderPopularServices(elements) {
  if (!state.providers.length) {
    elements.popularServices.innerHTML = `<div class="empty-state">Популярные услуги появятся после загрузки провайдеров.</div>`;
    return;
  }

  elements.popularServices.innerHTML = state.providers.slice(0, 4).map((provider, index) => `
    <div class="service-item ${index === 0 ? "active" : ""}">
      <div class="service-icon">${index + 1}</div>
      <div class="service-copy">
        <strong>${escapeHtml(provider.Name || provider.name || "Провайдер")}</strong>
        <span>${escapeHtml(provider.Code || provider.code || "internet")}</span>
      </div>
    </div>
  `).join("");
}

function renderRecentPayments(elements) {
  const internetTvPayments = state.payments.filter((payment) => {
    const category = String(payment.CategoryName || payment.categoryName || "").toLowerCase();
    return category.includes("internet") || category.includes("tv");
  });

  if (!internetTvPayments.length) {
    elements.recentPayments.innerHTML = `<div class="empty-state">У вас пока нет реальных платежей за интернет и ТВ.</div>`;
    return;
  }

  elements.recentPayments.innerHTML = internetTvPayments.slice(0, 6).map((payment) => {
    const accountNumber = payment.AccountNumber || payment.accountNumber || "Неизвестно";
    const provider = payment.ProviderName || payment.providerName || "Провайдер";
    const createdAt = payment.CreatedAt || payment.createdAt;
    const amount = Number(payment.Amount ?? payment.amount ?? 0);
    const currency = payment.Currency || payment.currency || "TJS";

    return `
      <div class="recent-item">
        <div class="recent-icon">✓</div>
        <div class="recent-copy">
          <strong>${escapeHtml(provider)}</strong>
          <span>Номер: ${escapeHtml(accountNumber)}</span>
          <em>${escapeHtml(formatDate(createdAt))}</em>
        </div>
        <div class="recent-amount">${escapeHtml(formatMoney(amount, currency))}</div>
      </div>
    `;
  }).join("");
}

function updateSummary(elements) {
  const amount = Number(elements.amountInput.value || 0);
  const selectedOption = elements.accountSelect.selectedOptions[0];
  const currency = selectedOption?.dataset.currency || "TJS";
  elements.amountCurrency.textContent = currency;
  elements.totalInfo.textContent = `Итого к списанию: ${formatMoney(amount || 0, currency)}`;
}

async function submitPayment(elements) {
  const accountId = elements.accountSelect.value;
  const providerId = state.selectedProviderId;
  const amount = Number(elements.amountInput.value || 0);
  const accountNumber = String(elements.accountNumberInput.value || "").trim();
  const selectedOption = elements.accountSelect.selectedOptions[0];
  const currency = selectedOption?.dataset.currency || "TJS";
  const provider = state.providers.find((item) => String(item.Id || item.id) === String(providerId));

  if (!accountId) {
    showToast("Выберите счет для списания");
    return;
  }
  if (!providerId) {
    showToast("Выберите интернет или ТВ провайдера");
    return;
  }
  if (!accountNumber) {
    showToast("Введите номер договора или абонента");
    return;
  }
  if (amount <= 0) {
    showToast("Введите сумму оплаты");
    return;
  }

  try {
    await apiRequest("/api/BillPayment/pay", {
      method: "POST",
      auth: true,
      body: {
        accountId,
        providerId,
        accountNumber,
        amount,
        currency,
        description: `Оплата ${provider?.Name || provider?.name || "интернет и ТВ"}`.trim()
      }
    });

    showToast("Оплата выполнена успешно");
    elements.amountInput.value = "";
    await loadData(elements);
  } catch (error) {
    console.error(error);
    showToast(error.message || "Не удалось выполнить оплату");
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
