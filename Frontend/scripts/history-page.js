import {
  apiRequest,
  formatDate,
  formatMoney,
  getSession,
  isAuthenticated,
  showToast
} from "./common.js";

const state = {
  accounts: [],
  transactions: []
};

const elements = {
  profileName: document.querySelector(".user-name"),
  userProfile: document.querySelector(".user-profile"),
  title: document.querySelector(".page-title-row h1"),
  subtitle: document.querySelector(".page-title-row p"),
  topFilterBar: document.querySelector(".top-filter-bar"),
  secondaryFilter: document.querySelector(".secondary-filter"),
  listCol: document.querySelector(".list-col"),
  analysisSidebar: document.querySelector(".analysis-sidebar")
};

async function init() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  hydrateProfile();
  simplifyControls();
  await loadHistory();
}

function hydrateProfile() {
  const session = getSession();
  const fullName = session?.fullName || "Пользователь";

  if (elements.profileName) {
    elements.profileName.textContent = fullName;
  }

  const avatar = elements.userProfile?.querySelector(".user-avatar");
  if (avatar) {
    const initials = fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "SB";

    const badge = document.createElement("div");
    badge.className = "user-avatar";
    badge.textContent = initials;
    badge.style.display = "grid";
    badge.style.placeItems = "center";
    badge.style.background = "linear-gradient(135deg, #2563eb, #16a34a)";
    badge.style.color = "#fff";
    badge.style.fontWeight = "800";
    avatar.replaceWith(badge);
  }
}

function simplifyControls() {
  if (elements.title) {
    elements.title.textContent = "История переводов";
  }

  if (elements.subtitle) {
    elements.subtitle.textContent = "Здесь показываются ваши реальные переводы и зачисления без мок-данных.";
  }

  if (elements.topFilterBar) {
    elements.topFilterBar.innerHTML = `
      <div class="date-range-pill">
        Реальные операции
      </div>
    `;
  }

  if (elements.secondaryFilter) {
    elements.secondaryFilter.innerHTML = `
      <button class="sec-btn active" type="button">Все переводы</button>
      <button class="sec-btn" type="button" data-filter="outgoing">Исходящие</button>
      <button class="sec-btn" type="button" data-filter="incoming">Входящие</button>
    `;

    elements.secondaryFilter.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        elements.secondaryFilter.querySelectorAll(".sec-btn").forEach((node) => node.classList.remove("active"));
        button.classList.add("active");
        renderHistory(button.dataset.filter || "all");
      });
    });

    const firstButton = elements.secondaryFilter.querySelector(".sec-btn");
    if (firstButton) {
      firstButton.addEventListener("click", () => {
        elements.secondaryFilter.querySelectorAll(".sec-btn").forEach((node) => node.classList.remove("active"));
        firstButton.classList.add("active");
        renderHistory("all");
      });
    }
  }
}

async function loadHistory() {
  try {
    const [accountsPayload, transfersPayload] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true }),
      apiRequest("/api/transfers/my?page=1&pageSize=50", { auth: true })
    ]);

    state.accounts = accountsPayload.items || accountsPayload.Items || [];
    state.transactions = transfersPayload.items || transfersPayload.Items || [];

    renderHistory("all");
    renderSidebar();
  } catch (error) {
    console.error(error);
    if (elements.listCol) {
      elements.listCol.innerHTML = `
        <div class="analysis-box">
          <div class="box-title">Не удалось загрузить историю</div>
          <p style="margin-top:12px;color:#64748b;font-size:14px;">${escapeHtml(error.message || "Попробуйте обновить страницу.")}</p>
        </div>
      `;
    }
    if (elements.analysisSidebar) {
      elements.analysisSidebar.innerHTML = "";
    }
    showToast("История переводов пока недоступна");
  }
}

function renderHistory(filter) {
  if (!elements.listCol) {
    return;
  }

  const myAccountIds = new Set(state.accounts.map((account) => account.id || account.Id));
  const filteredTransactions = state.transactions.filter((transaction) => {
    const fromAccountId = transaction.fromAccountId || transaction.FromAccountId;
    const isOutgoing = fromAccountId && myAccountIds.has(fromAccountId);

    if (filter === "outgoing") {
      return Boolean(isOutgoing);
    }

    if (filter === "incoming") {
      return !isOutgoing;
    }

    return true;
  });

  if (filteredTransactions.length === 0) {
    elements.listCol.innerHTML = `
      <div class="analysis-box">
        <div class="box-title">Операций пока нет</div>
        <p style="margin-top:12px;color:#64748b;font-size:14px;">После первого перевода история появится здесь автоматически.</p>
      </div>
    `;
    return;
  }

  const groups = new Map();
  filteredTransactions.forEach((transaction) => {
    const createdAt = new Date(transaction.createdAt || transaction.CreatedAt || Date.now());
    const dateKey = createdAt.toDateString();

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }

    groups.get(dateKey).push(transaction);
  });

  elements.listCol.innerHTML = Array.from(groups.entries())
    .map(([dateKey, transactions]) => renderDateGroup(dateKey, transactions, myAccountIds))
    .join("");
}

function renderDateGroup(dateKey, transactions, myAccountIds) {
  const date = new Date(dateKey);
  const heading = date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return `
    <div class="date-group">
      <div class="date-header">
        <div class="date-label">${escapeHtml(capitalize(heading))}</div>
        <div class="date-subtext">${transactions.length} операций</div>
      </div>
      ${transactions.map((transaction) => renderHistoryItem(transaction, myAccountIds)).join("")}
    </div>
  `;
}

function renderHistoryItem(transaction, myAccountIds) {
  const fromAccountId = transaction.fromAccountId || transaction.FromAccountId;
  const toAccountNumber = transaction.toAccountNumber || transaction.ToAccountNumber || "Неизвестно";
  const fromAccountNumber = transaction.fromAccountNumber || transaction.FromAccountNumber || "Неизвестно";
  const description = transaction.description || transaction.Description || "Перевод";
  const createdAt = transaction.createdAt || transaction.CreatedAt;
  const amount = Number(transaction.amount ?? transaction.Amount ?? 0);
  const currency = transaction.currency || transaction.Currency || "TJS";
  const isOutgoing = fromAccountId && myAccountIds.has(fromAccountId);
  const counterparty = isOutgoing ? toAccountNumber : fromAccountNumber;
  const sign = isOutgoing ? "-" : "+";
  const amountClass = isOutgoing ? "" : "pos";
  const title = isOutgoing ? `Перевод на ${counterparty}` : `Зачисление от ${counterparty}`;
  const icon = isOutgoing ? "↗" : "↙";
  const iconBg = isOutgoing ? "#eff6ff" : "#dcfce7";
  const iconColor = isOutgoing ? "#2563eb" : "#16a34a";

  return `
    <div class="history-item">
      <div class="hist-icon" style="background:${iconBg};color:${iconColor};font-weight:900;">${icon}</div>
      <div>
        <div class="hist-title">${escapeHtml(title)}</div>
        <div class="hist-desc">${escapeHtml(description)}</div>
      </div>
      <div class="hist-amt ${amountClass}">${sign} ${escapeHtml(formatMoney(amount, currency))}</div>
      <div class="hist-status">успешно</div>
      <div class="hist-time">${escapeHtml(formatDate(createdAt))}</div>
    </div>
  `;
}

function renderSidebar() {
  if (!elements.analysisSidebar) {
    return;
  }

  const myAccountIds = new Set(state.accounts.map((account) => account.id || account.Id));
  const outgoingTransactions = state.transactions.filter((transaction) => myAccountIds.has(transaction.fromAccountId || transaction.FromAccountId));
  const incomingTransactions = state.transactions.filter((transaction) => !myAccountIds.has(transaction.fromAccountId || transaction.FromAccountId));
  const outgoingTotal = outgoingTransactions.reduce((sum, transaction) => sum + Number(transaction.amount ?? transaction.Amount ?? 0), 0);
  const incomingTotal = incomingTransactions.reduce((sum, transaction) => sum + Number(transaction.amount ?? transaction.Amount ?? 0), 0);
  const latestTransaction = state.transactions[0];

  elements.analysisSidebar.innerHTML = `
    <div class="analysis-box">
      <div class="box-header-row">
        <span class="box-title">Сводка</span>
      </div>
      <div class="summary-bars">
        <div style="font-size:12px;font-weight:800;color:#64748b;display:flex;justify-content:space-between;">
          <span>Исходящие</span>
          <span>${escapeHtml(formatMoney(outgoingTotal, "TJS"))}</span>
        </div>
        <div class="sum-bar"><div class="sum-bar-fill" style="width:100%;background:#2563eb;"></div></div>
        <div style="font-size:12px;font-weight:800;color:#64748b;display:flex;justify-content:space-between;margin-top:12px;">
          <span>Входящие</span>
          <span>${escapeHtml(formatMoney(incomingTotal, "TJS"))}</span>
        </div>
        <div class="sum-bar"><div class="sum-bar-fill" style="width:100%;background:#16a34a;"></div></div>
      </div>
    </div>
    <div class="analysis-box">
      <div class="box-header-row">
        <span class="box-title">Последняя операция</span>
      </div>
      ${latestTransaction ? renderLatestTransaction(latestTransaction, myAccountIds) : '<div style="color:#64748b;font-size:14px;">Операций пока нет.</div>'}
    </div>
    <div class="analysis-box">
      <div class="box-header-row">
        <span class="box-title">SMS</span>
      </div>
      <div style="color:#64748b;font-size:14px;line-height:1.6;">
        После успешного перевода отправляется SMS с датой, временем, суммой и получателем.
      </div>
    </div>
  `;
}

function renderLatestTransaction(transaction, myAccountIds) {
  const fromAccountId = transaction.fromAccountId || transaction.FromAccountId;
  const isOutgoing = fromAccountId && myAccountIds.has(fromAccountId);
  const accountNumber = isOutgoing
    ? (transaction.toAccountNumber || transaction.ToAccountNumber || "Неизвестно")
    : (transaction.fromAccountNumber || transaction.FromAccountNumber || "Неизвестно");

  return `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:15px;font-weight:800;color:#0f172a;">${isOutgoing ? "Исходящий перевод" : "Входящий перевод"}</div>
      <div style="font-size:14px;color:#64748b;">${escapeHtml(accountNumber)}</div>
      <div style="font-size:22px;font-weight:900;color:${isOutgoing ? "#2563eb" : "#16a34a"};">
        ${isOutgoing ? "-" : "+"} ${escapeHtml(formatMoney(transaction.amount ?? transaction.Amount ?? 0, transaction.currency || transaction.Currency || "TJS"))}
      </div>
      <div style="font-size:12px;color:#94a3b8;">${escapeHtml(formatDate(transaction.createdAt || transaction.CreatedAt))}</div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function capitalize(value) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

document.addEventListener("DOMContentLoaded", init);

