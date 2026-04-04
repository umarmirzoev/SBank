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
  transfers: [],
  billPayments: [],
  historyItems: []
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
    elements.title.textContent = "История операций";
  }

  if (elements.subtitle) {
    elements.subtitle.textContent = "Здесь показываются реальные переводы и платежи, включая мобильную связь.";
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
      <button class="sec-btn active" type="button">Все операции</button>
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
    const [accountsPayload, transfersPayload, billPaymentsPayload] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true }),
      apiRequest("/api/transfers/my?page=1&pageSize=50", { auth: true }),
      apiRequest("/api/BillPayment/my?page=1&pageSize=50", { auth: true })
    ]);

    state.accounts = accountsPayload.items || accountsPayload.Items || [];
    state.transfers = transfersPayload.items || transfersPayload.Items || [];
    state.billPayments = billPaymentsPayload.items || billPaymentsPayload.Items || [];
    state.historyItems = buildHistoryItems();

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
    showToast("История операций пока недоступна");
  }
}

function buildHistoryItems() {
  const myAccountIds = new Set(state.accounts.map((account) => String(account.id || account.Id)));

  const transferItems = state.transfers.map((transaction) => {
    const fromAccountId = String(transaction.fromAccountId || transaction.FromAccountId || "");
    const isOutgoing = Boolean(fromAccountId && myAccountIds.has(fromAccountId));
    const toAccountNumber = transaction.toAccountNumber || transaction.ToAccountNumber || "Неизвестно";
    const fromAccountNumber = transaction.fromAccountNumber || transaction.FromAccountNumber || "Неизвестно";
    const createdAt = transaction.createdAt || transaction.CreatedAt;
    const amount = Number(transaction.amount ?? transaction.Amount ?? 0);
    const currency = transaction.currency || transaction.Currency || "TJS";
    const counterparty = isOutgoing ? toAccountNumber : fromAccountNumber;
    const title = isOutgoing ? `Перевод на ${counterparty}` : `Зачисление от ${counterparty}`;

    return {
      kind: "transfer",
      direction: isOutgoing ? "outgoing" : "incoming",
      title,
      subtitle: transaction.description || transaction.Description || "Перевод",
      amount,
      currency,
      createdAt,
      status: "успешно",
      timeLabel: formatDate(createdAt),
      counterparty,
      sortableDate: new Date(createdAt || Date.now()).getTime()
    };
  });

  const billPaymentItems = state.billPayments.map((payment) => {
    const createdAt = payment.createdAt || payment.CreatedAt;
    const amount = Number(payment.amount ?? payment.Amount ?? 0);
    const currency = payment.currency || payment.Currency || "TJS";
    const phone = payment.accountNumber || payment.AccountNumber || "Неизвестно";
    const providerName = payment.providerName || payment.ProviderName || "Оператор";

    return {
      kind: "bill-payment",
      direction: "outgoing",
      title: `${providerName} ${phone}`,
      subtitle: "Пополнение мобильной связи",
      amount,
      currency,
      createdAt,
      status: "успешно",
      timeLabel: formatDate(createdAt),
      counterparty: phone,
      providerName,
      phone,
      sortableDate: new Date(createdAt || Date.now()).getTime()
    };
  });

  return [...transferItems, ...billPaymentItems].sort((left, right) => right.sortableDate - left.sortableDate);
}

function renderHistory(filter) {
  if (!elements.listCol) {
    return;
  }

  const filteredItems = state.historyItems.filter((item) => {
    if (filter === "outgoing") {
      return item.direction === "outgoing";
    }
    if (filter === "incoming") {
      return item.direction === "incoming";
    }
    return true;
  });

  if (!filteredItems.length) {
    elements.listCol.innerHTML = `
      <div class="analysis-box">
        <div class="box-title">Операций пока нет</div>
        <p style="margin-top:12px;color:#64748b;font-size:14px;">После первого перевода или платежа история появится здесь автоматически.</p>
      </div>
    `;
    return;
  }

  const groups = new Map();
  filteredItems.forEach((item) => {
    const createdAt = new Date(item.createdAt || Date.now());
    const dateKey = createdAt.toDateString();
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey).push(item);
  });

  elements.listCol.innerHTML = Array.from(groups.entries())
    .map(([dateKey, items]) => renderDateGroup(dateKey, items))
    .join("");
}

function renderDateGroup(dateKey, items) {
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
        <div class="date-subtext">${items.length} операций</div>
      </div>
      ${items.map((item) => renderHistoryItem(item)).join("")}
    </div>
  `;
}

function renderHistoryItem(item) {
  const isOutgoing = item.direction === "outgoing";
  const sign = isOutgoing ? "-" : "+";
  const amountClass = isOutgoing ? "" : "pos";
  const icon = item.kind === "bill-payment" ? "☎" : (isOutgoing ? "↗" : "↙");
  const iconBg = item.kind === "bill-payment"
    ? "#ede9fe"
    : (isOutgoing ? "#eff6ff" : "#dcfce7");
  const iconColor = item.kind === "bill-payment"
    ? "#7c3aed"
    : (isOutgoing ? "#2563eb" : "#16a34a");

  return `
    <div class="history-item">
      <div class="hist-icon" style="background:${iconBg};color:${iconColor};font-weight:900;">${icon}</div>
      <div>
        <div class="hist-title">${escapeHtml(item.title)}</div>
        <div class="hist-desc">${escapeHtml(item.subtitle)}</div>
      </div>
      <div class="hist-amt ${amountClass}">${sign} ${escapeHtml(formatMoney(item.amount, item.currency))}</div>
      <div class="hist-status">${escapeHtml(item.status)}</div>
      <div class="hist-time">${escapeHtml(item.timeLabel)}</div>
    </div>
  `;
}

function renderSidebar() {
  if (!elements.analysisSidebar) {
    return;
  }

  const outgoingItems = state.historyItems.filter((item) => item.direction === "outgoing");
  const incomingItems = state.historyItems.filter((item) => item.direction === "incoming");
  const outgoingTotal = outgoingItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const incomingTotal = incomingItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const latestItem = state.historyItems[0];

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
      ${latestItem ? renderLatestItem(latestItem) : '<div style="color:#64748b;font-size:14px;">Операций пока нет.</div>'}
    </div>
    <div class="analysis-box">
      <div class="box-header-row">
        <span class="box-title">Чек</span>
      </div>
      <div style="color:#64748b;font-size:14px;line-height:1.6;">
        В истории сохраняются номер, сумма, оператор и точное время платежа.
      </div>
    </div>
  `;
}

function renderLatestItem(item) {
  const isOutgoing = item.direction === "outgoing";
  const operationTitle = item.kind === "bill-payment"
    ? "Платеж мобильной связи"
    : (isOutgoing ? "Исходящий перевод" : "Входящий перевод");
  const details = item.kind === "bill-payment"
    ? `${item.providerName} • ${item.phone}`
    : item.counterparty;

  return `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:15px;font-weight:800;color:#0f172a;">${escapeHtml(operationTitle)}</div>
      <div style="font-size:14px;color:#64748b;">${escapeHtml(details)}</div>
      <div style="font-size:22px;font-weight:900;color:${isOutgoing ? "#2563eb" : "#16a34a"};">
        ${isOutgoing ? "-" : "+"} ${escapeHtml(formatMoney(item.amount, item.currency))}
      </div>
      <div style="font-size:12px;color:#94a3b8;">${escapeHtml(item.timeLabel)}</div>
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
