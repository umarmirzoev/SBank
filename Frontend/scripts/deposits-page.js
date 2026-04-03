import {
  apiRequest,
  formatMoney,
  formatDate,
  getSession,
  showToast,
  isAuthenticated
} from "./common.js";

const state = {
  deposits: [],
  transactions: [],
  accounts: [],
  selectedDepositId: null
};

const elements = {
  profileName: document.querySelector(".user-name"),
  depositsOverview: document.getElementById("depositsOverview"),
  middleList: document.querySelector(".middle-col .dep-list"),
  mainFocusBox: document.querySelector(".focus-box"),
  totalDisplay: document.querySelector(".total-val"),
  pageTitle: document.querySelector(".page-title-row h1"),
  pageSubtitle: document.querySelector(".page-title-row p"),
  datePill: document.querySelector(".date-pill"),
  quickTabs: document.querySelector(".quick-tabs"),
  rightCol: document.querySelector(".right-col")
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getDepositTheme(index) {
  const themes = [
    { className: "pink", icon: "🏦", gradient: "linear-gradient(135deg, #be185d 0%, #3b82f6 100%)" },
    { className: "teal", icon: "💎", gradient: "linear-gradient(135deg, #0f766e 0%, #1d4ed8 100%)" },
    { className: "yellow", icon: "💰", gradient: "linear-gradient(135deg, #b45309 0%, #1d4ed8 100%)" },
    { className: "purple", icon: "🎯", gradient: "linear-gradient(135deg, #6d28d9 0%, #1d4ed8 100%)" }
  ];

  return themes[index % themes.length];
}

function getDepositLabel(deposit, index) {
  const termMonths = Math.max(1, Math.round((new Date(deposit.endDate) - new Date(deposit.startDate)) / (1000 * 60 * 60 * 24 * 30)));
  if (termMonths <= 3) {
    return `Вклад на ${termMonths} мес.`;
  }
  if (termMonths <= 12) {
    return `Срочный вклад ${index + 1}`;
  }
  return `Долгосрочный вклад ${index + 1}`;
}

function getDepositStatusLabel(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "active") {
    return "Активен";
  }
  if (normalized === "closed") {
    return "Закрыт";
  }
  return status || "Неизвестно";
}

function hydrateProfile() {
  const session = getSession();
  if (elements.profileName) {
    elements.profileName.textContent = session?.fullName || "Пользователь";
  }
}

async function init() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  hydrateProfile();
  setupStaticUi();
  await loadData();
}

function setupStaticUi() {
  if (elements.pageTitle) {
    elements.pageTitle.textContent = "Депозиты";
  }

  if (elements.pageSubtitle) {
    elements.pageSubtitle.textContent = "Здесь показываются только ваши реальные вклады без мок-данных.";
  }

  if (elements.datePill) {
    elements.datePill.innerHTML = `
      <button class="date-btn active" type="button">Реальные данные</button>
      <button class="date-btn" type="button">Без демо-вкладов</button>
    `;
  }

  if (elements.quickTabs) {
    elements.quickTabs.innerHTML = `
      <a href="#" class="tab-link" data-deposit-action="topup">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Пополнить
      </a>
      <a href="app-transfers.html" class="tab-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        Переводы
      </a>
      <a href="#" class="tab-link" data-deposit-action="statement">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Выписка
      </a>
    `;

    elements.quickTabs.querySelectorAll("[data-deposit-action]").forEach((node) => {
      node.addEventListener("click", (event) => {
        event.preventDefault();
        showToast(
          node.dataset.depositAction === "topup"
            ? "Пополнение депозита будет подключено к реальному API."
            : "Выписка по депозиту будет подключена к реальному API."
        );
      });
    });
  }
}

async function loadData() {
  try {
    const [depositPayload, transactionPayload, accountsPayload] = await Promise.all([
      apiRequest("/api/deposit/my?page=1&pageSize=50", { auth: true }),
      apiRequest("/api/transactions/my?page=1&pageSize=50", { auth: true }),
      apiRequest("/api/accounts/my?page=1&pageSize=50", { auth: true })
    ]);

    state.deposits = (depositPayload.items || depositPayload.Items || []).map((deposit, index) => {
      const theme = getDepositTheme(index);
      const account = (accountsPayload.items || accountsPayload.Items || []).find(
        (item) => String(item.id || item.Id) === String(deposit.accountId || deposit.AccountId)
      );

      return {
        ...deposit,
        theme,
        amount: Number(deposit.amount ?? deposit.Amount ?? 0),
        interestRate: Number(deposit.interestRate ?? deposit.InterestRate ?? 0),
        expectedProfit: Number(deposit.expectedProfit ?? deposit.ExpectedProfit ?? 0),
        currency: deposit.currency || deposit.Currency || "TJS",
        status: deposit.status || deposit.Status || "Unknown",
        startDate: deposit.startDate || deposit.StartDate,
        endDate: deposit.endDate || deposit.EndDate,
        accountNumber: account?.accountNumber || account?.AccountNumber || "",
        iban: account?.iban || account?.Iban || "",
        label: getDepositLabel(
          {
            startDate: deposit.startDate || deposit.StartDate,
            endDate: deposit.endDate || deposit.EndDate
          },
          index
        )
      };
    });

    state.transactions = (transactionPayload.items || transactionPayload.Items || []).filter((item) => {
      const type = String(item.type || item.Type || "").toLowerCase();
      return type === "deposit" || type === "depositinterest";
    });
    state.accounts = accountsPayload.items || accountsPayload.Items || [];
    state.selectedDepositId = state.deposits[0]?.id || state.deposits[0]?.Id || null;

    renderPage();
  } catch (error) {
    console.error("Failed to load deposits", error);
    renderLoadError(error);
    showToast("Не удалось загрузить депозиты");
  }
}

function renderPage() {
  renderOverview();
  renderMiddleList();
  renderFocusBox();
  renderRightColumn();
  renderTotal();
}

function renderOverview() {
  if (!elements.depositsOverview) {
    return;
  }

  if (!state.deposits.length) {
    elements.depositsOverview.innerHTML = `
      <div class="row-card pink" style="grid-column:1 / -1;cursor:default;">
        <div class="row-card-top">
          <div class="card-icon-sq">🏦</div>
        </div>
        <div>
          <div class="card-label">У вас пока нет депозитов</div>
          <div class="card-bal">0 TJS</div>
          <div class="card-details">Как только вы откроете вклад, он отобразится здесь.</div>
        </div>
      </div>
    `;
    return;
  }

  elements.depositsOverview.innerHTML = state.deposits.map((deposit) => {
    const id = deposit.id || deposit.Id;
    return `
      <div class="row-card ${deposit.theme.className}" data-deposit-id="${id}">
        <div class="row-card-top">
          <div class="card-icon-sq">${deposit.theme.icon}</div>
          <div class="card-rate">${escapeHtml(String(deposit.interestRate))}%</div>
        </div>
        <div>
          <div class="card-label">${escapeHtml(deposit.label)}</div>
          <div class="card-bal">${escapeHtml(formatMoney(deposit.amount, deposit.currency))}</div>
          <div class="card-details">До ${escapeHtml(formatDate(deposit.endDate))} · ${escapeHtml(getDepositStatusLabel(deposit.status))}</div>
        </div>
        <div class="card-link">Подробнее ></div>
      </div>
    `;
  }).join("");

  elements.depositsOverview.querySelectorAll("[data-deposit-id]").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedDepositId = node.dataset.depositId;
      renderPage();
    });
  });
}

function renderMiddleList() {
  if (!elements.middleList) {
    return;
  }

  if (!state.deposits.length) {
    elements.middleList.innerHTML = `
      <div class="box-header">
        <span class="box-title">Ваши депозиты</span>
      </div>
      <div class="dep-item">
        <div class="dep-icon-sq">ℹ️</div>
        <div class="dep-info">
          <div class="dep-name">Депозитов нет</div>
          <div class="dep-sub">Здесь будет список ваших реальных вкладов.</div>
        </div>
      </div>
    `;
    return;
  }

  elements.middleList.innerHTML = `
    <div class="box-header">
      <span class="box-title">Ваши депозиты</span>
    </div>
    ${state.deposits.map((deposit) => {
      const id = deposit.id || deposit.Id;
      return `
        <div class="dep-item" data-deposit-id="${id}" style="cursor:pointer;">
          <div class="dep-icon-sq">${deposit.theme.icon}</div>
          <div class="dep-info">
            <div class="dep-name">${escapeHtml(deposit.label)}</div>
            <div class="dep-sub">${escapeHtml(deposit.accountNumber || "Счёт не найден")}</div>
          </div>
          <div class="dep-val-col">
            <div class="dep-val">${escapeHtml(formatMoney(deposit.amount, deposit.currency))}</div>
            <div class="dep-rate">${escapeHtml(String(deposit.interestRate))}% годовых</div>
          </div>
        </div>
      `;
    }).join("")}
  `;

  elements.middleList.querySelectorAll("[data-deposit-id]").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedDepositId = node.dataset.depositId;
      renderPage();
    });
  });
}

function getSelectedDeposit() {
  return state.deposits.find((deposit) => String(deposit.id || deposit.Id) === String(state.selectedDepositId)) || null;
}

function getRelatedTransactions(deposit) {
  return state.transactions.filter((transaction) => {
    const fromAccountId = transaction.fromAccountId || transaction.FromAccountId;
    const toAccountId = transaction.toAccountId || transaction.ToAccountId;
    return String(fromAccountId) === String(deposit.accountId || deposit.AccountId) ||
      String(toAccountId) === String(deposit.accountId || deposit.AccountId);
  });
}

function renderFocusBox() {
  if (!elements.mainFocusBox) {
    return;
  }

  const deposit = getSelectedDeposit();
  if (!deposit) {
    elements.mainFocusBox.innerHTML = `
      <div class="box-header">
        <span class="box-title">Депозиты не найдены</span>
      </div>
      <div style="color:#64748b;font-size:14px;line-height:1.7;">
        На этой странице больше нет мок-данных. Когда у вас появится вклад, здесь будет показана его реальная сводка.
      </div>
    `;
    return;
  }

  const relatedTransactions = getRelatedTransactions(deposit);
  const totalIn = relatedTransactions
    .filter((item) => !item.fromAccountId && item.toAccountId)
    .reduce((sum, item) => sum + Number(item.amount ?? item.Amount ?? 0), 0);
  const totalOut = relatedTransactions
    .filter((item) => item.fromAccountId)
    .reduce((sum, item) => sum + Number(item.amount ?? item.Amount ?? 0), 0);

  elements.mainFocusBox.innerHTML = `
    <div class="box-header">
      <span class="box-title">${escapeHtml(deposit.label)}</span>
    </div>
    <div class="visual-deposit" style="background:${deposit.theme.gradient};">
      <div class="v-dep-top">
        <div>
          <div class="v-dep-title">${escapeHtml(deposit.label)}</div>
          <div style="font-size:11px; opacity:0.7; margin-top:2px;">${escapeHtml(deposit.accountNumber || "Депозитный счёт")}</div>
        </div>
        <div>
          <div class="v-dep-bal">${escapeHtml(formatMoney(deposit.amount, deposit.currency))}</div>
          <div class="v-dep-trend">${escapeHtml(String(deposit.interestRate))}% годовых</div>
        </div>
      </div>
      <div class="v-dep-bottom">
        <div class="v-dep-iban">IBAN: ${escapeHtml(deposit.iban || "не указан")}</div>
        <div class="v-dep-icon">${deposit.theme.icon}</div>
      </div>
    </div>
    <div class="focus-actions">
      <button class="btn-dep-action btn-secondary-link" type="button" data-deposit-toast="История по депозиту скоро будет расширена.">История</button>
      <button class="btn-dep-action btn-secondary-link" type="button" data-deposit-toast="Условия депозита будут показаны из backend.">Условия</button>
      <button class="btn-dep-action btn-primary-dep" type="button" data-deposit-toast="Пополнение депозита будет подключено к реальному API.">Пополнить</button>
    </div>
    <div class="activity-section">
      <div class="chart-header">
        <span class="box-title" style="font-size:14px;">Сводка по депозиту</span>
        <span style="font-size:14px; font-weight:800;">+ ${escapeHtml(formatMoney(totalIn, deposit.currency))} | - ${escapeHtml(formatMoney(totalOut, deposit.currency))}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
        <div style="padding:16px;border-radius:18px;background:#f8fafc;">
          <div style="font-size:11px;font-weight:800;color:#94a3b8;">Статус</div>
          <div style="margin-top:8px;font-size:16px;font-weight:900;color:#1e293b;">${escapeHtml(getDepositStatusLabel(deposit.status))}</div>
        </div>
        <div style="padding:16px;border-radius:18px;background:#f8fafc;">
          <div style="font-size:11px;font-weight:800;color:#94a3b8;">Ожидаемая прибыль</div>
          <div style="margin-top:8px;font-size:16px;font-weight:900;color:#1e293b;">${escapeHtml(formatMoney(deposit.expectedProfit, deposit.currency))}</div>
        </div>
        <div style="padding:16px;border-radius:18px;background:#f8fafc;">
          <div style="font-size:11px;font-weight:800;color:#94a3b8;">До даты</div>
          <div style="margin-top:8px;font-size:16px;font-weight:900;color:#1e293b;">${escapeHtml(formatDate(deposit.endDate))}</div>
        </div>
      </div>
    </div>
  `;

  elements.mainFocusBox.querySelectorAll("[data-deposit-toast]").forEach((node) => {
    node.addEventListener("click", () => showToast(node.dataset.depositToast || "Функция скоро появится"));
  });
}

function renderRightColumn() {
  if (!elements.rightCol) {
    return;
  }

  const deposit = getSelectedDeposit();
  const totalAmount = state.deposits.reduce((sum, item) => sum + item.amount, 0);
  const totalProfit = state.deposits.reduce((sum, item) => sum + item.expectedProfit, 0);

  elements.rightCol.innerHTML = `
    <div class="stats-widget">
      <div class="box-header">
        <span class="box-title" style="font-size:14px;">Ваши депозиты</span>
      </div>
      <div class="income-stat" style="margin-top:16px;">
        <span class="income-label">Ожидаемая прибыль</span>
        <span class="income-val">${escapeHtml(formatMoney(totalProfit, deposit?.currency || "TJS"))}</span>
      </div>
      <button class="btn-new-dep" type="button">Новый депозит</button>
    </div>
    <div class="popular-widget">
      <div class="box-header">
        <span class="box-title" style="font-size:14px;">Сводка</span>
      </div>
      <div class="utility-item" style="margin-top:16px;">
        <div class="utility-icon">🏦</div>
        <div class="utility-text">
          <div class="utility-title">Всего вкладов</div>
          <div class="utility-desc">${state.deposits.length} активных и закрытых записей</div>
        </div>
      </div>
      <div class="utility-item">
        <div class="utility-icon">💵</div>
        <div class="utility-text">
          <div class="utility-title">Общая сумма</div>
          <div class="utility-desc">${escapeHtml(formatMoney(totalAmount, deposit?.currency || "TJS"))}</div>
        </div>
      </div>
    </div>
    <div class="popular-widget">
      <div class="box-header">
        <span class="box-title" style="font-size:14px;">Без мок-данных</span>
      </div>
      <div class="utility-item" style="margin-top:16px;">
        <div class="utility-icon" style="background:#dcfce7; color:#10b981;">✅</div>
        <div class="utility-text">
          <div class="utility-title">Только реальные депозиты</div>
          <div class="utility-desc">Фейковые накопительные вклады и цели удалены.</div>
        </div>
      </div>
    </div>
  `;

  elements.rightCol.querySelector(".btn-new-dep")?.addEventListener("click", () => {
    showToast("Открытие нового депозита будет подключено к реальному API.");
  });
}

function renderTotal() {
  if (!elements.totalDisplay) {
    return;
  }

  const total = state.deposits.reduce((sum, item) => sum + item.amount, 0);
  elements.totalDisplay.textContent = formatMoney(total, "TJS");
}

function renderLoadError(error) {
  if (elements.depositsOverview) {
    elements.depositsOverview.innerHTML = "";
  }
  if (elements.middleList) {
    elements.middleList.innerHTML = "";
  }
  if (elements.rightCol) {
    elements.rightCol.innerHTML = "";
  }
  if (elements.mainFocusBox) {
    elements.mainFocusBox.innerHTML = `
      <div class="box-header">
        <span class="box-title">Не удалось загрузить депозиты</span>
      </div>
      <div style="color:#64748b;font-size:14px;line-height:1.7;">
        ${escapeHtml(error?.message || "Попробуйте обновить страницу.")}
      </div>
    `;
  }
  if (elements.totalDisplay) {
    elements.totalDisplay.textContent = "0 TJS";
  }
}

document.addEventListener("DOMContentLoaded", init);
