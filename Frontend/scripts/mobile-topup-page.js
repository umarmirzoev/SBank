import { apiRequest, formatMoney, formatDate, getSession, requireAuth, showToast, unwrapResponse } from "./common.js";

const MOBILE_PROVIDER_PRESET_KEY = "sb-mobile-provider-preset";

const state = {
  session: getSession(),
  accounts: [],
  categories: [],
  mobileCategory: null,
  providers: [],
  selectedProviderId: null,
  payments: [],
  autopay: false,
  mode: "mobile"
};

document.addEventListener("DOMContentLoaded", () => {
  requireAuth(initPage);
});

function initPage(session) {
  state.session = session;
  const elements = getElements();
  hydrateProfile(elements, session);
  ensureHistoryPanel(elements);
  bindEvents(elements);
  loadData(elements);
}

function getElements() {
  return {
    userName: document.getElementById("userName"),
    userAvatar: document.getElementById("userAvatar"),
    topupCard: document.querySelector(".topup-card"),
    toggleRow: document.querySelector(".topup-card .toggle-row"),
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
    modeToggle: document.getElementById("modeToggle"),
    pageTitle: document.querySelector(".page-head h1"),
    pageSubtitle: document.querySelector(".page-head p")
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

function ensureHistoryPanel(elements) {
  if (!elements.topupCard || document.getElementById("historyPaymentsPanel")) {
    return;
  }

  const panel = document.createElement("div");
  panel.id = "historyPaymentsPanel";
  panel.style.display = "none";
  panel.style.flexDirection = "column";
  panel.style.gap = "12px";
  panel.style.marginTop = "16px";
  elements.topupCard.appendChild(panel);
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
    showToast(state.autopay ? "Автоплатеж включен" : "Автоплатеж выключен");
  });

  elements.modeToggle.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode || "mobile";
      elements.modeToggle.querySelectorAll("[data-mode]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderMode(elements);
    });
  });
}

async function loadData(elements) {
  try {
    const [accountsPayload, categoriesPayload, paymentsPayload] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true }),
      apiRequest("/api/BillPayment/categories", { auth: true }),
      apiRequest("/api/BillPayment/my?page=1&pageSize=50", { auth: true })
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
    renderMode(elements);
  } catch (error) {
    console.error(error);
    elements.providersList.innerHTML = `<div class="empty-state">Не удалось загрузить реальные данные для пополнения.</div>`;
    elements.recentPayments.innerHTML = `<div class="empty-state">История платежей недоступна.</div>`;
    showToast("Не удалось загрузить страницу мобильной связи");
  }
}

function renderMode(elements) {
  const historyPanel = document.getElementById("historyPaymentsPanel");
  const contentNodes = Array.from(elements.topupCard.children).filter((node) => node !== elements.toggleRow && node !== historyPanel);
  const isHistory = state.mode === "history";

  if (elements.pageTitle) {
    elements.pageTitle.textContent = isHistory ? "Мои пополнения" : "Пополнение мобильного";
  }
  if (elements.pageSubtitle) {
    elements.pageSubtitle.textContent = isHistory
      ? "Здесь показываются все ваши реальные платежи мобильной связи."
      : "Оплатите услуги любого мобильного оператора";
  }

  contentNodes.forEach((node) => {
    node.style.display = isHistory ? "none" : "";
  });

  if (historyPanel) {
    historyPanel.style.display = isHistory ? "flex" : "none";
    if (isHistory) {
      renderHistoryPayments(historyPanel);
    }
  }
}

function renderHistoryPayments(container) {
  if (!state.payments.length) {
    container.innerHTML = `<div class="empty-state">У вас пока нет реальных пополнений мобильной связи.</div>`;
    return;
  }

  container.innerHTML = state.payments.map((payment) => {
    const phone = payment.AccountNumber || payment.accountNumber || "Неизвестно";
    const provider = payment.ProviderName || payment.providerName || "Оператор";
    const createdAt = payment.CreatedAt || payment.createdAt;
    const amount = Number(payment.Amount ?? payment.amount ?? 0);
    const currency = payment.Currency || payment.currency || "TJS";

    return `
      <div style="display:flex;justify-content:space-between;gap:14px;padding:14px 16px;border-radius:18px;background:#f8fbff;border:1px solid #e4edf9;">
        <div style="min-width:0;flex:1;">
          <div style="font-size:15px;font-weight:800;color:#0f172a;">${escapeHtml(provider)}</div>
          <div style="margin-top:4px;font-size:13px;color:#64748b;display:flex;flex-direction:column;gap:4px;">
            <span>Номер: ${escapeHtml(phone)}</span>
            <span>Чек: пополнение мобильной связи</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;white-space:nowrap;">
          <div style="font-size:16px;font-weight:900;color:#0f172a;">${escapeHtml(formatMoney(amount, currency))}</div>
          <div style="font-size:12px;color:#94a3b8;">${escapeHtml(formatDate(createdAt))}</div>
        </div>
      </div>
    `;
  }).join("");
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
  state.selectedProviderId = resolvePresetProviderId(state.providers) || state.providers[0]?.Id || state.providers[0]?.id || null;
  renderProviders(elements);
}

function resolvePresetProviderId(providers) {
  const preset = sessionStorage.getItem(MOBILE_PROVIDER_PRESET_KEY);
  if (!preset) {
    return null;
  }

  const normalizedPreset = normalizeProviderName(preset);
  const matched = providers.find((provider) => {
    const name = normalizeProviderName(provider.Name || provider.name || "");
    const code = normalizeProviderName(provider.Code || provider.code || "");
    return name === normalizedPreset || code === normalizedPreset || name.includes(normalizedPreset) || normalizedPreset.includes(name);
  });

  sessionStorage.removeItem(MOBILE_PROVIDER_PRESET_KEY);
  return matched ? (matched.Id || matched.id) : null;
}

function normalizeProviderName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/mega\s*fon/g, "megafon")
    .replace(/мега\s*фон/g, "megafon")
    .replace(/megafontj/g, "megafon")
    .replace(/билайн/g, "beeline")
    .replace(/t\s*cell/g, "tcell")
    .replace(/тселл/g, "tcell")
    .replace(/t-?cell/g, "tcell")
    .replace(/babylon/g, "babilon")
    .replace(/babi\s*lon/g, "babilon")
    .replace(/вавилон/g, "babilon")
    .replace(/babilon-?t/g, "babilon")
    .replace(/[^a-z0-9а-яё]/g, "");
}

function getProviderKind(provider) {
  const normalized = normalizeProviderName(`${provider?.Name || provider?.name || ""} ${provider?.Code || provider?.code || ""}`);
  if (normalized.includes("megafon")) return "megafon";
  if (normalized.includes("tcell")) return "tcell";
  if (normalized.includes("babilon")) return "babilon";
  if (normalized.includes("beeline")) return "beeline";
  if (normalized.includes("zagros")) return "zagros";
  return "other";
}

function validatePhoneForProvider(phone, provider) {
  const digits = String(phone || "").replace(/\D/g, "");
  const localNumber = digits.startsWith("992") ? digits.slice(3) : digits;
  const prefix = localNumber.slice(0, 2);
  const providerKind = getProviderKind(provider);
  const providerPrefixes = {
    megafon: ["97"],
    tcell: ["93"],
    babilon: ["98"],
    beeline: ["90"],
    zagros: ["99"]
  };
  const allowedPrefixes = providerPrefixes[providerKind];

  if (!allowedPrefixes || !allowedPrefixes.length) {
    return { ok: true };
  }
  if (allowedPrefixes.includes(prefix)) {
    return { ok: true };
  }

  return {
    ok: false,
    message: "Такой номер не относится к выбранному оператору"
  };
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
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(code || "Оператор")}</span>
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
  const topCategories = state.categories.slice(0, 4);
  if (!topCategories.length) {
    elements.popularServices.innerHTML = `<div class="empty-state">Список услуг загрузится из backend позже.</div>`;
    return;
  }

  elements.popularServices.innerHTML = topCategories.map((category, index) => `
    <div class="service-item ${index === 0 ? "active" : ""}">
      <div class="service-icon">${index + 1}</div>
      <div class="service-copy">
        <strong>${escapeHtml(category.Name || category.name)}</strong>
        <span>${escapeHtml(category.Code || category.code || "Категория услуг")}</span>
      </div>
    </div>
  `).join("");
}

function renderRecentPayments(elements) {
  if (!state.payments.length) {
    elements.recentPayments.innerHTML = `<div class="empty-state">У вас пока нет реальных пополнений мобильной связи.</div>`;
    return;
  }

  elements.recentPayments.innerHTML = state.payments.slice(0, 6).map((payment) => {
    const phone = payment.AccountNumber || payment.accountNumber || "Неизвестно";
    const provider = payment.ProviderName || payment.providerName || "Оператор";
    const createdAt = payment.CreatedAt || payment.createdAt;
    const amount = Number(payment.Amount ?? payment.amount ?? 0);
    const currency = payment.Currency || payment.currency || "TJS";

    return `
      <div class="recent-item">
        <div class="recent-icon">✓</div>
        <div class="recent-copy">
          <strong>${escapeHtml(provider)}</strong>
          <span>Номер: ${escapeHtml(phone)}</span>
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
  const provider = state.providers.find((item) => String(item.Id || item.id) === String(providerId));

  if (!accountId) {
    showToast("Выберите счет для списания");
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

  const phoneValidation = validatePhoneForProvider(phone, provider);
  if (!phoneValidation.ok) {
    showToast(phoneValidation.message);
    return;
  }

  if (amount <= 0) {
    showToast("Введите сумму пополнения");
    return;
  }

  try {
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
    state.mode = "history";
    elements.modeToggle.querySelectorAll("[data-mode]").forEach((item) => {
      item.classList.toggle("active", item.dataset.mode === "history");
    });
    renderMode(elements);
  } catch (error) {
    console.error(error);
    showToast(error.message || "Не удалось выполнить пополнение");
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
