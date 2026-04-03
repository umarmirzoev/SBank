import {
  apiRequest,
  formatMoney,
  formatDate,
  getSession,
  showToast,
  isAuthenticated
} from "./common.js";

const state = {
  accounts: [],
  loans: [],
  selectedLoanId: null
};

const elements = {
  profileName: document.querySelector(".user-name"),
  creditsOverview: document.getElementById("creditsOverview"),
  middleList: document.querySelector(".credit-list"),
  mainFocusBox: document.querySelector(".focus-box"),
  pageTitle: document.querySelector(".page-title-row h1"),
  pageSubtitle: document.querySelector(".page-title-row p"),
  datePill: document.querySelector(".date-pill"),
  quickTabs: document.querySelector(".quick-tabs"),
  rightCol: document.querySelector(".right-col"),
  knowledgeSection: document.querySelector(".knowledge-section")
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getLoanTheme(index) {
  const themes = [
    { className: "blue", icon: "🏦" },
    { className: "green", icon: "🚗" },
    { className: "yellow", icon: "💰" }
  ];

  return themes[index % themes.length];
}

function getLoanLabel(loan, index) {
  const termMonths = Number(loan.termMonths || loan.TermMonths || 0);
  if (termMonths >= 24) {
    return "Долгосрочный кредит";
  }
  if (termMonths >= 12) {
    return "Потребительский кредит";
  }
  return `Кредит ${index + 1}`;
}

function getLoanStatusLabel(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "active") {
    return "Активен";
  }
  if (normalized === "pending") {
    return "На рассмотрении";
  }
  if (normalized === "paid") {
    return "Погашен";
  }
  if (normalized === "rejected") {
    return "Отклонён";
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
    elements.pageTitle.textContent = "Кредиты";
  }

  if (elements.pageSubtitle) {
    elements.pageSubtitle.textContent = "Здесь показываются только ваши реальные кредиты без мок-данных.";
  }

  if (elements.datePill) {
    elements.datePill.innerHTML = `
      <button class="date-btn active" type="button">Реальные данные</button>
      <button class="date-btn" type="button">Без демо-кредитов</button>
    `;
  }

  if (elements.quickTabs) {
    elements.quickTabs.innerHTML = `
      <a href="#" class="tab-link" data-loan-action="pay">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Погасить
      </a>
      <a href="#" class="tab-link" data-loan-action="apply">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Новый кредит
      </a>
    `;

    elements.quickTabs.querySelectorAll("[data-loan-action]").forEach((node) => {
      node.addEventListener("click", (event) => {
        event.preventDefault();
        const action = node.dataset.loanAction === "pay"
          ? "Функция погашения кредита будет подключена на реальный API."
          : "Подача новой заявки на кредит будет подключена на реальный API.";
        showToast(action);
      });
    });
  }
}

async function loadData() {
  try {
    const [accountsPayload, loansPayload] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=50", { auth: true }),
      apiRequest("/api/loan/my?page=1&pageSize=50", { auth: true })
    ]);

    state.accounts = accountsPayload.items || accountsPayload.Items || [];
    state.loans = (loansPayload.items || loansPayload.Items || []).map((loan, index) => {
      const theme = getLoanTheme(index);
      const account = state.accounts.find((item) => String(item.id || item.Id) === String(loan.accountId || loan.AccountId));
      return {
        ...loan,
        theme,
        label: getLoanLabel(loan, index),
        icon: theme.icon,
        amount: Number(loan.amount ?? loan.Amount ?? 0),
        remainingAmount: Number(loan.remainingAmount ?? loan.RemainingAmount ?? 0),
        interestRate: Number(loan.interestRate ?? loan.InterestRate ?? 0),
        monthlyPayment: Number(loan.monthlyPayment ?? loan.MonthlyPayment ?? 0),
        termMonths: Number(loan.termMonths ?? loan.TermMonths ?? 0),
        currency: loan.currency || loan.Currency || "TJS",
        status: loan.status || loan.Status || "Unknown",
        startDate: loan.startDate || loan.StartDate,
        endDate: loan.endDate || loan.EndDate,
        accountNumber: account?.accountNumber || account?.AccountNumber || "",
        iban: account?.iban || account?.Iban || ""
      };
    });

    state.selectedLoanId = state.loans[0]?.id || state.loans[0]?.Id || null;
    renderPage();
  } catch (error) {
    console.error("Failed to load loans", error);
    renderLoadError(error);
    showToast("Не удалось загрузить кредиты");
  }
}

function renderPage() {
  renderOverview();
  renderMiddleList();
  renderFocusBox();
  renderKnowledge();
  renderRightColumn();
}

function renderOverview() {
  if (!elements.creditsOverview) {
    return;
  }

  if (!state.loans.length) {
    elements.creditsOverview.innerHTML = `
      <div class="row-card blue" style="grid-column:1 / -1;cursor:default;">
        <div class="row-card-top">
          <div class="card-icon-sq">🏦</div>
        </div>
        <div>
          <div class="card-label">У вас пока нет кредитов</div>
          <div class="card-bal">0 TJS</div>
          <div class="card-details">Когда кредит появится в системе, он отобразится здесь.</div>
        </div>
      </div>
    `;
    return;
  }

  elements.creditsOverview.innerHTML = state.loans.map((loan) => {
    const isPaid = loan.status.toLowerCase() === "paid";
    const id = loan.id || loan.Id;
    const buttonText = isPaid ? "Погашен" : "Подробнее";
    return `
      <div class="row-card ${loan.theme.className}" data-loan-id="${id}">
        <div class="row-card-top">
          <div class="card-icon-sq">${loan.icon}</div>
          <div class="card-rate">${escapeHtml(String(loan.interestRate))}%</div>
        </div>
        <div>
          <div class="card-label">${escapeHtml(loan.label)}</div>
          <div class="card-bal">${escapeHtml(formatMoney(loan.remainingAmount, loan.currency))}</div>
          <div class="card-details">До ${escapeHtml(formatDate(loan.endDate))} · ${escapeHtml(getLoanStatusLabel(loan.status))}</div>
        </div>
        <div class="card-btn">${escapeHtml(buttonText)}</div>
      </div>
    `;
  }).join("");

  elements.creditsOverview.querySelectorAll("[data-loan-id]").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedLoanId = node.dataset.loanId;
      renderPage();
    });
  });
}

function renderMiddleList() {
  if (!elements.middleList) {
    return;
  }

  if (!state.loans.length) {
    elements.middleList.innerHTML = `
      <div class="box-header">
        <span class="box-title">Ваши кредиты</span>
      </div>
      <div class="credit-item">
        <div class="item-icon">ℹ️</div>
        <div class="item-info">
          <div class="item-name">Кредитов нет</div>
          <div class="item-sub">Здесь будет список ваших реальных кредитов.</div>
        </div>
      </div>
    `;
    return;
  }

  elements.middleList.innerHTML = `
    <div class="box-header">
      <span class="box-title">Ваши кредиты</span>
    </div>
    ${state.loans.map((loan) => {
      const id = loan.id || loan.Id;
      return `
        <div class="credit-item" data-loan-id="${id}" style="cursor:pointer;">
          <div class="item-icon">${loan.icon}</div>
          <div class="item-info">
            <div class="item-name">${escapeHtml(loan.label)}</div>
            <div class="item-sub">Срок: ${escapeHtml(`${loan.termMonths} мес.`)}</div>
          </div>
          <div class="item-val-col">
            <div class="item-val">${escapeHtml(formatMoney(loan.remainingAmount, loan.currency))}</div>
            <div class="item-date">${escapeHtml(formatDate(loan.endDate))}</div>
          </div>
        </div>
      `;
    }).join("")}
  `;

  elements.middleList.querySelectorAll("[data-loan-id]").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedLoanId = node.dataset.loanId;
      renderPage();
    });
  });
}

function getSelectedLoan() {
  return state.loans.find((loan) => String(loan.id || loan.Id) === String(state.selectedLoanId)) || null;
}

function renderFocusBox() {
  if (!elements.mainFocusBox) {
    return;
  }

  const loan = getSelectedLoan();
  if (!loan) {
    elements.mainFocusBox.innerHTML = `
      <div class="box-header">
        <span class="box-title">Кредиты не найдены</span>
      </div>
      <div style="color:#64748b;font-size:14px;line-height:1.7;">
        На этой странице больше нет мок-данных. Когда у аккаунта появится реальный кредит, здесь будет показана его сводка.
      </div>
    `;
    return;
  }

  const paidAmount = Math.max(0, loan.amount - loan.remainingAmount);
  const progressPercent = loan.amount > 0 ? Math.max(0, Math.min(100, (paidAmount / loan.amount) * 100)) : 0;

  elements.mainFocusBox.innerHTML = `
    <div class="box-header">
      <span class="box-title">${escapeHtml(loan.label)}</span>
    </div>
    <div class="visual-loan">
      <div class="v-loan-top">
        <div>
          <div class="v-loan-title">${loan.icon} ${escapeHtml(loan.label)}</div>
          <div style="font-size:11px; opacity:0.7; margin-top:4px;">${escapeHtml(loan.accountNumber || loan.iban || "Счёт не найден")}</div>
        </div>
        <div>
          <div class="v-loan-bal">${escapeHtml(formatMoney(loan.remainingAmount, loan.currency))}</div>
          <div class="v-loan-trend">${escapeHtml(getLoanStatusLabel(loan.status))}</div>
        </div>
      </div>
      <div style="font-size:12px; margin-top:20px; font-weight:700;">
        Погашено ${escapeHtml(formatMoney(paidAmount, loan.currency))} из ${escapeHtml(formatMoney(loan.amount, loan.currency))}
        <span style="float:right; color:#dcfce7;">${escapeHtml(String(loan.interestRate))}% годовых</span>
      </div>
      <div class="v-loan-bottom">
        <div class="v-loan-info">Срок кредита: ${escapeHtml(`${loan.termMonths} мес.`)}</div>
        <div class="v-loan-rate">До ${escapeHtml(formatDate(loan.endDate))}</div>
      </div>
    </div>
    <div class="loan-stats-row">
      <div class="loan-stat-box">
        <span class="loan-stat-label">Ежемесячный платёж</span>
        <span class="loan-stat-val">${escapeHtml(formatMoney(loan.monthlyPayment, loan.currency))}</span>
        <div class="loan-stat-sub">Следующий платёж по графику</div>
      </div>
      <div class="loan-stat-box">
        <span class="loan-stat-label">Статус</span>
        <span class="loan-stat-val">${escapeHtml(getLoanStatusLabel(loan.status))}</span>
      </div>
    </div>
    <div>
      <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:800; color:#64748b;">
        <span>Прогресс погашения</span>
        <span style="color:#1e293b;">${Math.round(progressPercent)}%</span>
      </div>
      <div class="repayment-bar">
        <div class="bar-segment principal" style="width:${progressPercent}%;"></div>
        <div class="bar-segment interest" style="width:${100 - progressPercent}%;"></div>
      </div>
      <div style="display:flex; gap:20px; font-size:11px; font-weight:800; color:#94a3b8; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:6px;"><div style="width:8px; height:8px; border-radius:2px; background:#3b82f6;"></div> Погашено <span style="color:#1e293b;">${escapeHtml(formatMoney(paidAmount, loan.currency))}</span></div>
        <div style="display:flex; align-items:center; gap:6px;"><div style="width:8px; height:8px; border-radius:2px; background:#fbbf24;"></div> Осталось <span style="color:#1e293b;">${escapeHtml(formatMoney(loan.remainingAmount, loan.currency))}</span></div>
      </div>
    </div>
    <div class="focus-actions">
      <button class="action-btn ghost" type="button" data-loan-toast="История платежей по кредиту будет подключена к реальному API.">История</button>
      <button class="action-btn ghost" type="button" data-loan-toast="Подробные условия кредита будут показаны из backend.">Условия</button>
      <button class="action-btn primary" type="button" data-loan-toast="Оплата кредита будет доступна через реальный API платежей.">Погасить</button>
    </div>
  `;

  elements.mainFocusBox.querySelectorAll("[data-loan-toast]").forEach((node) => {
    node.addEventListener("click", () => showToast(node.dataset.loanToast || "Функция скоро появится"));
  });
}

function renderKnowledge() {
  if (!elements.knowledgeSection) {
    return;
  }

  const loan = getSelectedLoan();
  elements.knowledgeSection.innerHTML = `
    <h3>Полезно знать</h3>
    <div class="knowledge-card">
      <div class="k-icon">📘</div>
      <div class="k-text">
        <div class="k-title">Статус кредита</div>
        <div class="k-desc">Сейчас по выбранному кредиту статус: ${escapeHtml(getLoanStatusLabel(loan?.status || ""))}</div>
      </div>
    </div>
    <div class="knowledge-card">
      <div class="k-icon">📅</div>
      <div class="k-text">
        <div class="k-title">Срок кредита</div>
        <div class="k-desc">Дата окончания: ${escapeHtml(loan ? formatDate(loan.endDate) : "не указана")}</div>
      </div>
    </div>
  `;
}

function renderRightColumn() {
  if (!elements.rightCol) {
    return;
  }

  const loan = getSelectedLoan();
  const totalRemaining = state.loans.reduce((sum, item) => sum + item.remainingAmount, 0);
  const activeLoans = state.loans.filter((item) => item.status.toLowerCase() === "active").length;

  elements.rightCol.innerHTML = `
    <div class="cta-widget">
      <div class="box-header">
        <span class="box-title" style="font-size:14px;">Сводка по кредитам</span>
      </div>
      <div style="margin-top:16px;color:#64748b;font-size:13px;line-height:1.7;text-align:left;">
        <div><strong style="color:#1e293b;">Всего кредитов:</strong> ${state.loans.length}</div>
        <div><strong style="color:#1e293b;">Активных:</strong> ${activeLoans}</div>
        <div><strong style="color:#1e293b;">Остаток:</strong> ${escapeHtml(formatMoney(totalRemaining, loan?.currency || "TJS"))}</div>
      </div>
      <button class="btn-new-loan" type="button">Новый кредит</button>
    </div>
    <div class="payments-widget">
      <div class="box-header" style="margin-bottom:20px;">
        <span class="box-title" style="font-size:14px;">Текущие данные</span>
      </div>
      ${loan ? `
        <div class="pay-item">
          <div class="pay-icon">💸</div>
          <div class="pay-info">
            <div class="pay-name">Ежемесячный платёж</div>
            <div class="pay-sub">${escapeHtml(loan.label)}</div>
          </div>
          <div class="pay-amt">${escapeHtml(formatMoney(loan.monthlyPayment, loan.currency))}</div>
        </div>
        <div class="pay-item">
          <div class="pay-icon">🏦</div>
          <div class="pay-info">
            <div class="pay-name">Связанный счёт</div>
            <div class="pay-sub">${escapeHtml(loan.accountNumber || "Нет номера счёта")}</div>
          </div>
          <div class="pay-amt">${escapeHtml(getLoanStatusLabel(loan.status))}</div>
        </div>
      ` : `
        <div style="color:#64748b;font-size:14px;line-height:1.7;">Реальных платежей по кредитам пока нет.</div>
      `}
    </div>
    <div class="offers-widget">
      <div class="box-header" style="margin-bottom:20px;">
        <span class="box-title" style="font-size:14px;">Без мок-данных</span>
      </div>
      <div class="offer-item">
        <div class="o-icon">✅</div>
        <div class="o-info">
          <div class="o-name">Только реальные кредиты</div>
          <div class="o-desc">Фейковые ипотека, автокредит и предложения удалены.</div>
        </div>
      </div>
      <div class="offer-item">
        <div class="o-icon" style="background:#dcfce7;">🔄</div>
        <div class="o-info">
          <div class="o-name">Страница обновляется из API</div>
          <div class="o-desc">Если появится новый кредит, он сразу отобразится здесь.</div>
        </div>
      </div>
    </div>
  `;

  elements.rightCol.querySelector(".btn-new-loan")?.addEventListener("click", () => {
    showToast("Новая заявка на кредит будет подключена к реальному API.");
  });
}

function renderLoadError(error) {
  if (elements.creditsOverview) {
    elements.creditsOverview.innerHTML = "";
  }
  if (elements.middleList) {
    elements.middleList.innerHTML = "";
  }
  if (elements.rightCol) {
    elements.rightCol.innerHTML = "";
  }
  if (elements.knowledgeSection) {
    elements.knowledgeSection.innerHTML = "";
  }
  if (elements.mainFocusBox) {
    elements.mainFocusBox.innerHTML = `
      <div class="box-header">
        <span class="box-title">Не удалось загрузить кредиты</span>
      </div>
      <div style="color:#64748b;font-size:14px;line-height:1.7;">
        ${escapeHtml(error?.message || "Попробуйте обновить страницу.")}
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", init);
