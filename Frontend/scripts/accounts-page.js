import {
  apiRequest,
  formatMoney,
  formatDate,
  getSession,
  showToast,
  isAuthenticated
} from "./common.js";

let accounts = [];
let transactions = [];
let selectedAccount = null;
let selectedPeriod = "week";

const elements = {
  accountsList: document.getElementById("accountsList"),
  profileName: document.getElementById("profileName"),
  detailTitle: document.getElementById("detailTitle"),
  selectedAccLabel: document.getElementById("selectedAccLabel"),
  selectedAccNumber: document.getElementById("selectedAccNumber"),
  selectedAccBalance: document.getElementById("selectedAccBalance"),
  selectedAccTrend: document.getElementById("selectedAccTrend"),
  selectedAccIban: document.getElementById("selectedAccIban"),
  balanceSecondary: document.getElementById("balanceSecondary"),
  miniBars: document.getElementById("miniBars"),
  operationsListMiddle: document.getElementById("operationsListMiddle"),
  operationsListWidget: document.getElementById("operationsListWidget"),
  transferActionBtn: document.getElementById("transferActionBtn"),
  periodButtons: Array.from(document.querySelectorAll(".date-controls .date-btn")).slice(0, 3),
  statLabels: document.querySelectorAll(".bottom-bar .stat-label"),
  statValues: document.querySelectorAll(".bottom-bar .stat-val"),
  statPrimaryValue: document.querySelector(".bottom-bar .income-sum"),
  statLineFill: document.querySelector(".stat-line-fill")
};

async function init() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  const session = getSession();
  if (elements.profileName) {
    elements.profileName.textContent = session.fullName || "Пользователь";
  }

  configurePeriodButtons();
  await loadData();
  setupEventListeners();
}

function configurePeriodButtons() {
  const labels = [
    { key: "day", text: "День" },
    { key: "week", text: "Неделя" },
    { key: "month", text: "Месяц" }
  ];

  elements.periodButtons.forEach((button, index) => {
    const config = labels[index];
    if (!config) {
      return;
    }

    button.dataset.period = config.key;
    button.textContent = config.text;
    button.classList.toggle("active", config.key === selectedPeriod);
  });
}

async function loadData() {
  try {
    const [accountsPayload, transfersPayload] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true }),
      apiRequest("/api/transfers/my?page=1&pageSize=50", { auth: true })
    ]);

    accounts = accountsPayload.items || accountsPayload.Items || [];
    transactions = transfersPayload.items || transfersPayload.Items || [];

    renderTopCards();

    if (accounts.length > 0) {
      selectAccount(accounts[0].id || accounts[0].Id);
    } else {
      renderEmptyState("У вас пока нет реальных счетов.");
    }
  } catch (error) {
    console.error("Failed to load accounts page", error);
    showToast("Ошибка загрузки счетов");
    renderEmptyState(error.message || "Не удалось загрузить реальные данные.");
  }
}

function renderTopCards() {
  if (!elements.accountsList) {
    return;
  }

  if (accounts.length === 0) {
    elements.accountsList.innerHTML = `
      <div class="empty-state" style="grid-column: span 4;">
        У вас пока нет реальных счетов.
      </div>
    `;
    return;
  }

  const colorClasses = ["blue", "teal", "yellow", "green"];
  const icons = ["💳", "🏦", "💼", "📈"];

  elements.accountsList.innerHTML = accounts.map((account, index) => {
    const id = account.id || account.Id;
    const type = account.type || account.Type || "Account";
    const currency = account.currency || account.Currency || "TJS";
    const balance = Number(account.balance ?? account.Balance ?? 0);
    const accountNumber = account.accountNumber || account.AccountNumber || "Без номера";
    const status = account.status || account.Status || "Active";
    const colorClass = colorClasses[index % colorClasses.length];
    const icon = icons[index % icons.length];

    return `
      <div class="acc-card ${colorClass}" data-account-id="${id}">
        <div class="card-top">
          <div class="card-icon-box" style="font-size:20px;">${icon}</div>
          <div class="card-check">${status === "Active" ? "✓" : "!"}</div>
        </div>
        <div>
          <div class="card-label">${escapeHtml(type)}</div>
          <div class="card-balance">${escapeHtml(formatMoney(balance, currency))}</div>
          <div class="card-number">${escapeHtml(accountNumber)}</div>
          <div class="card-sub">${escapeHtml(status)}</div>
        </div>
      </div>
    `;
  }).join("");

  elements.accountsList.querySelectorAll(".acc-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectAccount(card.dataset.accountId);
    });
  });
}

function selectAccount(id) {
  selectedAccount = accounts.find((account) => String(account.id || account.Id) === String(id));
  if (!selectedAccount) {
    return;
  }

  const accountType = selectedAccount.type || selectedAccount.Type || "Счёт";
  const accountNumber = selectedAccount.accountNumber || selectedAccount.AccountNumber || "Без номера";
  const iban = selectedAccount.iban || selectedAccount.Iban || "";
  const currency = selectedAccount.currency || selectedAccount.Currency || "TJS";
  const balance = Number(selectedAccount.balance ?? selectedAccount.Balance ?? 0);

  if (elements.detailTitle) {
    elements.detailTitle.textContent = "Детали счёта";
  }
  if (elements.selectedAccLabel) {
    elements.selectedAccLabel.textContent = accountType;
  }
  if (elements.selectedAccNumber) {
    elements.selectedAccNumber.textContent = accountNumber;
  }
  if (elements.selectedAccBalance) {
    elements.selectedAccBalance.textContent = formatMoney(balance, currency);
  }
  if (elements.selectedAccIban) {
    elements.selectedAccIban.textContent = iban ? `IBAN ${iban}` : "IBAN не указан";
  }
  if (elements.selectedAccTrend) {
    elements.selectedAccTrend.textContent = periodTitle();
  }
  if (elements.balanceSecondary) {
    elements.balanceSecondary.textContent = `${formatMoney(balance, currency)} доступно`;
  }

  updateMiniBars(balance);
  renderOperations();
  updateBottomStats();
}

function updateMiniBars(balance) {
  if (!elements.miniBars) {
    return;
  }

  const bars = elements.miniBars.querySelectorAll(".mini-bar");
  const numericBalance = Number(balance || 0);
  const seed = Math.max(1, Math.round(numericBalance) || 1);

  bars.forEach((bar, index) => {
    const height = 18 + ((seed + index * 17) % 70);
    bar.style.height = `${height}%`;
    bar.classList.toggle("active", index === bars.length - 1);
  });
}

function renderOperations() {
  if (elements.operationsListMiddle) {
    elements.operationsListMiddle.innerHTML = "";
  }
  if (elements.operationsListWidget) {
    elements.operationsListWidget.innerHTML = "";
  }

  const filteredTransactions = getFilteredTransactions()
    .sort((left, right) => new Date(right.createdAt || right.CreatedAt || 0) - new Date(left.createdAt || left.CreatedAt || 0));

  if (filteredTransactions.length === 0) {
    const emptyMarkup = `<div class="empty-state">По этому счёту нет реальных операций за ${periodText()}.</div>`;
    if (elements.operationsListMiddle) {
      elements.operationsListMiddle.innerHTML = emptyMarkup;
    }
    if (elements.operationsListWidget) {
      elements.operationsListWidget.innerHTML = emptyMarkup;
    }
    return;
  }

  filteredTransactions.forEach((transaction, index) => {
    if (elements.operationsListMiddle) {
      elements.operationsListMiddle.innerHTML += renderOpItem(transaction, true);
    }
    if (elements.operationsListWidget && index < 4) {
      elements.operationsListWidget.innerHTML += renderOpItem(transaction, false);
    }
  });
}

function getFilteredTransactions() {
  const currentId = String(selectedAccount?.id || selectedAccount?.Id || "");
  const start = getPeriodStart();

  return transactions.filter((transaction) => {
    const createdAt = new Date(transaction.createdAt || transaction.CreatedAt || 0).getTime();
    if (Number.isNaN(createdAt) || createdAt < start) {
      return false;
    }

    const fromAccountId = String(transaction.fromAccountId || transaction.FromAccountId || "");
    const toAccountId = String(transaction.toAccountId || transaction.ToAccountId || "");
    return fromAccountId === currentId || toAccountId === currentId;
  });
}

function getPeriodStart() {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  if (selectedPeriod === "day") {
    return now - day;
  }

  if (selectedPeriod === "month") {
    return now - 30 * day;
  }

  return now - 7 * day;
}

function renderOpItem(transaction, isFull) {
  const amount = Number(transaction.amount ?? transaction.Amount ?? 0);
  const currency = transaction.currency || transaction.Currency || "TJS";
  const description = transaction.description || transaction.Description || "Операция";
  const createdAt = transaction.createdAt || transaction.CreatedAt;
  const toAccountNumber = transaction.toAccountNumber || transaction.ToAccountNumber || "";
  const fromAccountNumber = transaction.fromAccountNumber || transaction.FromAccountNumber || "";
  const currentId = String(selectedAccount?.id || selectedAccount?.Id || "");
  const fromAccountId = String(transaction.fromAccountId || transaction.FromAccountId || "");
  const isOutgoing = currentId && currentId === fromAccountId;
  const sign = isOutgoing ? "-" : "+";
  const amountClass = isOutgoing ? "minus" : "plus";
  const subtitle = isOutgoing
    ? `Получатель: ${toAccountNumber || "Счёт"}`
    : `Отправитель: ${fromAccountNumber || "Счёт"}`;

  if (isFull) {
    return `
      <div class="op-card" style="margin-bottom:8px;">
        <div class="avatar-sm" style="display:grid;place-items:center;background:#eff6ff;color:#2563eb;font-weight:800;">${isOutgoing ? "↑" : "↓"}</div>
        <div class="op-info">
          <div class="op-name">${escapeHtml(description)}</div>
          <div class="op-sub">${escapeHtml(subtitle)}</div>
        </div>
        <div class="op-amount-side">
          <div class="op-amt ${amountClass}">
            ${sign}${escapeHtml(formatMoney(Math.abs(amount), currency))}
          </div>
          <div class="op-time">${escapeHtml(formatDate(createdAt))}</div>
        </div>
      </div>
    `;
  }

  return `
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
       <div style="width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:#eff6ff;color:#2563eb;font-weight:800;">${isOutgoing ? "↑" : "↓"}</div>
       <div style="flex:1">
          <div style="font-size:12px; font-weight:700;">${escapeHtml(description)}</div>
          <div style="font-size:10px; color:#94a3b8;">${escapeHtml(formatDate(createdAt))}</div>
       </div>
       <div style="font-size:12px; font-weight:800; color: ${isOutgoing ? "#1e293b" : "#10b981"}">
          ${sign}${escapeHtml(formatMoney(Math.abs(amount), currency))}
       </div>
    </div>
  `;
}

function updateBottomStats() {
  const filteredTransactions = getFilteredTransactions();
  const currentId = String(selectedAccount?.id || selectedAccount?.Id || "");
  const currency = selectedAccount?.currency || selectedAccount?.Currency || "TJS";
  let incoming = 0;
  let outgoing = 0;

  filteredTransactions.forEach((transaction) => {
    const amount = Math.abs(Number(transaction.amount ?? transaction.Amount ?? 0));
    const fromAccountId = String(transaction.fromAccountId || transaction.FromAccountId || "");

    if (fromAccountId === currentId) {
      outgoing += amount;
    } else {
      incoming += amount;
    }
  });

  const turnover = incoming + outgoing;
  const accountBalance = Number(selectedAccount?.balance ?? selectedAccount?.Balance ?? 0);
  const fill = accountBalance > 0 ? Math.min(100, Math.round((turnover / accountBalance) * 100)) : 0;

  if (elements.statLabels[0]) {
    elements.statLabels[0].textContent = `Оборот за ${periodText()}`;
  }
  if (elements.statPrimaryValue) {
    elements.statPrimaryValue.textContent = formatMoney(turnover, currency);
  }
  if (elements.statLabels[1]) {
    elements.statLabels[1].textContent = `Входящие за ${periodText()}`;
  }
  if (elements.statValues[1]) {
    elements.statValues[1].textContent = formatMoney(incoming, currency);
  }
  if (elements.statLabels[2]) {
    elements.statLabels[2].textContent = `Исходящие за ${periodText()}`;
  }
  if (elements.statValues[2]) {
    elements.statValues[2].textContent = formatMoney(outgoing, currency);
  }
  if (elements.statLineFill) {
    elements.statLineFill.style.width = `${fill}%`;
  }
}

function renderEmptyState(message) {
  const text = message || "Реальные данные пока недоступны.";
  if (elements.accountsList) {
    elements.accountsList.innerHTML = `
      <div class="empty-state" style="grid-column: span 4;">
        ${escapeHtml(text)}
      </div>
    `;
  }

  if (elements.operationsListMiddle) {
    elements.operationsListMiddle.innerHTML = `<div class="empty-state">${escapeHtml(text)}</div>`;
  }
  if (elements.operationsListWidget) {
    elements.operationsListWidget.innerHTML = `<div class="empty-state">${escapeHtml(text)}</div>`;
  }
}

function periodTitle() {
  if (selectedPeriod === "day") {
    return "За день";
  }
  if (selectedPeriod === "month") {
    return "За месяц";
  }
  return "За неделю";
}

function periodText() {
  if (selectedPeriod === "day") {
    return "день";
  }
  if (selectedPeriod === "month") {
    return "месяц";
  }
  return "неделю";
}

function setupEventListeners() {
  elements.periodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedPeriod = button.dataset.period || "week";
      elements.periodButtons.forEach((node) => node.classList.toggle("active", node === button));
      if (selectedAccount) {
        if (elements.selectedAccTrend) {
          elements.selectedAccTrend.textContent = periodTitle();
        }
        renderOperations();
        updateBottomStats();
      }
    });
  });

  if (elements.transferActionBtn) {
    elements.transferActionBtn.onclick = () => {
      if (!selectedAccount) {
        showToast("Сначала выберите счёт");
        return;
      }

      const id = selectedAccount.id || selectedAccount.Id;
      window.location.href = `transfers.html?from=${id}`;
    };
  }

  document.querySelectorAll(".copy-icon").forEach((button) => {
    button.onclick = () => {
      const targetId = button.dataset.copy;
      const target = document.getElementById(targetId);
      const text = target?.textContent?.trim();
      if (!text) {
        showToast("Нечего копировать");
        return;
      }

      navigator.clipboard.writeText(text).then(() => {
        showToast("Скопировано в буфер обмена");
      });
    };
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

document.addEventListener("DOMContentLoaded", init);

