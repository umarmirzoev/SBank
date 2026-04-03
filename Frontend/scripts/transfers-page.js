import { apiRequest, formatDate, formatMoney, requireAuth, showToast, unwrapResponse } from "./common.js";

const transferOptions = [
  {
    id: "card",
    title: "На карту",
    subtitle: "По номеру банковской карты",
    label: "Номер карты получателя (12 цифр)",
    placeholder: "0000 0000 0000"
  },
  {
    id: "phone",
    title: "По номеру телефона",
    subtitle: "Телефон получателя",
    label: "Номер телефона получателя",
    placeholder: "+992 000 000 000"
  },
  {
    id: "requisites",
    title: "По реквизитам",
    subtitle: "По номеру счёта",
    label: "Номер счёта получателя",
    placeholder: "Введите номер счёта"
  }
];

const state = {
  selectedType: "card",
  accounts: [],
  resolvedRecipient: null
};

document.addEventListener("DOMContentLoaded", () => {
  ensureToastHost();
  requireAuth(initTransfersPage);
});

async function initTransfersPage(session) {
  const elements = {
    optionsGrid: document.getElementById("optionsGrid"),
    formTitle: document.getElementById("formTitle"),
    transferForm: document.getElementById("transferForm"),
    fromSelect: document.getElementById("fromAccountSelect"),
    toInput: document.getElementById("toAccountInput"),
    toLabel: document.getElementById("toAccountLabel"),
    amountInput: document.getElementById("amountInput"),
    descInput: document.getElementById("descInput"),
    sumAmount: document.getElementById("summaryAmount"),
    sumFee: document.getElementById("summaryFee"),
    sumTotal: document.getElementById("summaryTotal"),
    submitBtn: document.getElementById("submitBtn"),
    rightWidgets: document.querySelector(".t-right"),
    profileName: document.querySelector(".profile strong"),
    profileAvatar: document.querySelector(".avatar span")
  };

  hydrateProfile(session, elements);
  renderTransferOptions(elements);
  renderRightColumn(elements);
  bindEvents(elements);
  await loadAccounts(elements);
  await loadRecentTransfers(elements);
  updateRecipientField(elements);
  updateSummary(elements);
}

function hydrateProfile(session, elements) {
  const displayName = session?.fullName || "Клиент";
  if (elements.profileName) {
    elements.profileName.textContent = displayName;
  }
  if (elements.profileAvatar) {
    elements.profileAvatar.textContent = displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }
}

function ensureToastHost() {
  if (document.getElementById("toast")) {
    return;
  }

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.className = "toast-status";
  document.body.appendChild(toast);
}

function renderTransferOptions(elements) {
  elements.optionsGrid.innerHTML = transferOptions.map((option) => `
    <div class="t-option ${option.id === state.selectedType ? "active" : ""}" data-option-id="${option.id}">
      <div class="t-icon">${iconMarkup(option.id)}</div>
      <strong>${option.title}</strong>
      <span>${option.subtitle}</span>
    </div>
  `).join("");

  elements.optionsGrid.querySelectorAll("[data-option-id]").forEach((optionElement) => {
    optionElement.addEventListener("click", () => {
      state.selectedType = optionElement.dataset.optionId;
      state.resolvedRecipient = null;
      renderTransferOptions(elements);
      updateRecipientField(elements);
      renderRecipientState(elements);
    });
  });
}

function iconMarkup(type) {
  if (type === "phone") {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`;
  }

  if (type === "requisites") {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
  }

  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`;
}

function renderRightColumn(elements) {
  elements.rightWidgets.innerHTML = `
    <div class="widget">
      <div class="w-title">Получатель</div>
      <div id="recipientState" class="w-list">
        <div class="empty-state">Введите номер карты, телефона или счёта, чтобы проверить получателя.</div>
      </div>
    </div>
    <div class="widget">
      <div class="w-title">Последние переводы</div>
      <div id="recentTransfersList" class="w-list">
        <div class="empty-state">Загрузка переводов...</div>
      </div>
    </div>
    <div class="widget" style="margin-bottom:0;">
      <div class="w-title">Лимиты и комиссия</div>
      <div class="empty-state">
        <div>Комиссия рассчитывается автоматически.</div>
        <div style="margin-top:8px;">Перевод можно выполнить только зарегистрированному получателю.</div>
      </div>
    </div>
  `;
}

function bindEvents(elements) {
  elements.amountInput.addEventListener("input", () => updateSummary(elements));

  elements.toInput.addEventListener("input", () => {
    state.resolvedRecipient = null;
    formatRecipientInput(elements);
    renderRecipientState(elements);
  });

  elements.toInput.addEventListener("blur", async () => {
    await resolveRecipient(elements);
  });

  elements.transferForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitTransfer(elements);
  });
}

async function loadAccounts(elements) {
  try {
    const payload = await apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true });
    state.accounts = payload.items || payload.Items || [];

    if (state.accounts.length === 0) {
      elements.fromSelect.innerHTML = `<option value="">Нет доступных счетов</option>`;
      elements.submitBtn.disabled = true;
      showToast("У вас нет доступных счетов для перевода");
      return;
    }

    elements.fromSelect.innerHTML = state.accounts.map((account) => {
      const id = account.id || account.Id;
      const number = account.accountNumber || account.AccountNumber;
      const balance = account.balance ?? account.Balance ?? 0;
      const currency = account.currency || account.Currency || "TJS";
      return `<option value="${id}">Счёт ${number} • ${formatMoney(balance, currency)}</option>`;
    }).join("");
  } catch (error) {
    console.error(error);
    elements.fromSelect.innerHTML = `<option value="">Не удалось загрузить счета</option>`;
    showToast("Не удалось загрузить ваши счета");
  }
}

async function loadRecentTransfers(elements) {
  const recentTransfersList = document.getElementById("recentTransfersList");
  if (!recentTransfersList) {
    return;
  }

  try {
    const payload = await apiRequest("/api/transfers/my?page=1&pageSize=5", { auth: true });
    const items = payload.items || payload.Items || [];

    if (items.length === 0) {
      recentTransfersList.innerHTML = `<div class="empty-state">У вас пока нет выполненных переводов.</div>`;
      return;
    }

    recentTransfersList.innerHTML = items.map((item) => {
      const amount = item.amount ?? item.Amount ?? 0;
      const currency = item.currency || item.Currency || "TJS";
      const toAccountNumber = item.toAccountNumber || item.ToAccountNumber || "Неизвестно";
      const description = item.description || item.Description || "Перевод";
      const createdAt = item.createdAt || item.CreatedAt;

      return `
        <div class="w-item">
          <div class="w-avatar" style="background:#dbeafe; color:#1d4ed8;">→</div>
          <div class="w-info">
            <strong>${description}</strong>
            <span>Получатель: ${toAccountNumber}</span>
            <span>${formatDate(createdAt)}</span>
          </div>
          <div class="w-val">${formatMoney(amount, currency)}</div>
        </div>
      `;
    }).join("");
  } catch (error) {
    console.error(error);
    recentTransfersList.innerHTML = `<div class="empty-state">Не удалось загрузить реальные переводы.</div>`;
  }
}

function updateRecipientField(elements) {
  const selectedOption = transferOptions.find((option) => option.id === state.selectedType) || transferOptions[0];
  elements.formTitle.textContent = selectedOption.title;
  elements.toLabel.textContent = selectedOption.label;
  elements.toInput.placeholder = selectedOption.placeholder;
  elements.toInput.value = state.selectedType === "phone" ? "+992 " : "";

  if (state.selectedType === "phone") {
    elements.toInput.maxLength = 16;
    elements.toInput.inputMode = "tel";
  } else if (state.selectedType === "card") {
    elements.toInput.maxLength = 14;
    elements.toInput.inputMode = "numeric";
  } else {
    elements.toInput.removeAttribute("maxLength");
    elements.toInput.inputMode = "text";
  }
}

function formatRecipientInput(elements) {
  if (state.selectedType === "card") {
    const digits = elements.toInput.value.replace(/\D/g, "").slice(0, 12);
    elements.toInput.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    return;
  }

  if (state.selectedType === "phone") {
    const digits = elements.toInput.value.replace(/\D/g, "");
    let localDigits = digits;

    if (localDigits.startsWith("992")) {
      localDigits = localDigits.slice(3);
    }

    localDigits = localDigits.slice(0, 9);
    const parts = [];
    if (localDigits.length > 0) parts.push(localDigits.slice(0, 3));
    if (localDigits.length > 3) parts.push(localDigits.slice(3, 6));
    if (localDigits.length > 6) parts.push(localDigits.slice(6, 9));
    elements.toInput.value = `+992${parts.length ? ` ${parts.join(" ")}` : " "}`;
  }
}

function normalizeRecipientValue(elements) {
  const rawValue = elements.toInput.value.trim();

  if (state.selectedType === "card") {
    return rawValue.replace(/\D/g, "");
  }

  if (state.selectedType === "phone") {
    const digits = rawValue.replace(/\D/g, "");
    const localDigits = digits.startsWith("992") ? digits.slice(3) : digits;
    return `+992${localDigits}`;
  }

  return rawValue;
}

async function resolveRecipient(elements) {
  const value = normalizeRecipientValue(elements);
  if (!value) {
    return false;
  }

  if (state.selectedType === "card" && value.length !== 12) {
    showToast("Введите 12 цифр номера карты");
    return false;
  }

  if (state.selectedType === "phone" && !/^\+992\d{9}$/.test(value)) {
    showToast("Введите номер в формате +992 и 9 цифр");
    return false;
  }

  try {
    const payload = await apiRequest(`/api/transfers/lookup?type=${encodeURIComponent(state.selectedType)}&value=${encodeURIComponent(value)}`, { auth: true });
    const response = unwrapResponse(payload);
    state.resolvedRecipient = response.data;
    renderRecipientState(elements);
    return true;
  } catch (error) {
    state.resolvedRecipient = null;
    renderRecipientState(elements, error.message);
    showToast(error.message);
    return false;
  }
}

function renderRecipientState(elements, errorMessage = "") {
  const recipientState = document.getElementById("recipientState");
  if (!recipientState) {
    return;
  }

  if (errorMessage) {
    recipientState.innerHTML = `<div class="empty-state">${errorMessage}</div>`;
    return;
  }

  if (!state.resolvedRecipient) {
    recipientState.innerHTML = `<div class="empty-state">Введите номер получателя и дождитесь проверки регистрации.</div>`;
    return;
  }

  recipientState.innerHTML = `
    <div class="w-item">
      <div class="w-avatar" style="background:#dbeafe; color:#1d4ed8;">✓</div>
      <div class="w-info">
        <strong>${state.resolvedRecipient.recipientName || state.resolvedRecipient.RecipientName}</strong>
        <span>Телефон: ${state.resolvedRecipient.maskedPhone || state.resolvedRecipient.MaskedPhone}</span>
        <span>${recipientSubtitle(state.resolvedRecipient)}</span>
      </div>
      <div class="w-val">Найден</div>
    </div>
  `;
}

function recipientSubtitle(recipient) {
  const account = recipient.resolvedAccountNumber || recipient.ResolvedAccountNumber;
  const card = recipient.maskedCardNumber || recipient.MaskedCardNumber;
  return card ? `Карта: ${card} • Счёт: ${account}` : `Счёт: ${account}`;
}

function updateSummary(elements) {
  const amount = Number(elements.amountInput.value || 0);
  const fee = state.selectedType === "requisites" ? 0 : Number((amount * 0.01).toFixed(2));
  const total = amount + fee;

  elements.sumAmount.textContent = formatMoney(amount, "с.");
  elements.sumFee.textContent = formatMoney(fee, "с.");
  elements.sumTotal.textContent = formatMoney(total, "с.");
  elements.submitBtn.textContent = `Перевести ${formatMoney(total, "с.")}`;
}

async function submitTransfer(elements) {
  const accountId = elements.fromSelect.value;
  const amount = Number(elements.amountInput.value || 0);

  if (!accountId) {
    showToast("Выберите счёт списания");
    return;
  }

  if (amount <= 0) {
    showToast("Сумма перевода должна быть больше 0");
    return;
  }

  const recipientReady = state.resolvedRecipient && normalizeRecipientValue(elements) === (state.resolvedRecipient.inputValue || state.resolvedRecipient.InputValue);
  const lookupOk = recipientReady ? true : await resolveRecipient(elements);
  if (!lookupOk || !state.resolvedRecipient) {
    return;
  }

  const resolvedAccountNumber = state.resolvedRecipient.resolvedAccountNumber || state.resolvedRecipient.ResolvedAccountNumber;
  const originalText = elements.submitBtn.textContent;
  elements.submitBtn.disabled = true;
  elements.submitBtn.textContent = "Отправка...";

  try {
    await apiRequest("/api/transfers", {
      method: "POST",
      auth: true,
      body: {
        fromAccountId: accountId,
        toAccountNumber: resolvedAccountNumber,
        amount,
        description: elements.descInput.value.trim() || transferDescription()
      }
    });

    showToast("Перевод выполнен успешно");
    elements.toInput.value = state.selectedType === "phone" ? "+992 " : "";
    elements.descInput.value = "";
    elements.amountInput.value = "100";
    state.resolvedRecipient = null;
    renderRecipientState(elements);
    updateSummary(elements);
    await loadAccounts(elements);
    await loadRecentTransfers(elements);
  } catch (error) {
    showToast(error.message || "Не удалось выполнить перевод");
  } finally {
    elements.submitBtn.disabled = false;
    elements.submitBtn.textContent = originalText;
  }
}

function transferDescription() {
  if (state.selectedType === "phone") {
    return "Перевод по номеру телефона";
  }

  if (state.selectedType === "requisites") {
    return "Перевод по реквизитам";
  }

  return "Перевод на карту";
}
