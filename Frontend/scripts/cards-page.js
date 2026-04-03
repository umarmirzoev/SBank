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
  cards: [],
  transactions: [],
  selectedCardId: null
};

const elements = {
  profileName: document.querySelector(".user-name"),
  profileAvatar: document.querySelector(".user-avatar"),
  cardsList: document.getElementById("cardsList"),
  pageTitle: document.querySelector(".page-title-row h1"),
  pageSubtitle: document.querySelector(".page-title-row p"),
  recommendationBar: document.querySelector(".date-pill"),
  primaryBox: document.querySelector(".primary-card-box"),
  operationsListMiddle: document.querySelector(".middle-col .ops-list"),
  functionsBox: document.querySelector(".middle-col .functions-box"),
  rightCol: document.querySelector(".right-col"),
  summaryFooter: document.querySelector(".summary-footer"),
  btnTransfer: document.getElementById("btnGoToTransfer")
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCardNumber(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function getCardBrand(cardNumber) {
  return String(cardNumber || "").startsWith("4") ? "VISA" : "CARD";
}

function getCardTheme(index) {
  const themes = [
    {
      className: "blue",
      gradient: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
      icon: "💳",
      accent: "#2563eb"
    },
    {
      className: "green",
      gradient: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
      icon: "💠",
      accent: "#059669"
    },
    {
      className: "yellow",
      gradient: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
      icon: "✨",
      accent: "#d97706"
    },
    {
      className: "purple",
      gradient: "linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)",
      icon: "🛡️",
      accent: "#4f46e5"
    }
  ];

  return themes[index % themes.length];
}

function getCardLabel(card, index) {
  const type = String(card.type || card.Type || "").toLowerCase();
  if (type === "virtual") {
    return `Виртуальная карта ${index + 1}`;
  }

  return state.cards.length === 1 ? "Основная карта" : `Карта ${index + 1}`;
}

function hydrateProfile() {
  const fullName = getSession()?.fullName || "Пользователь";

  if (elements.profileName) {
    elements.profileName.textContent = fullName;
  }

  if (elements.profileAvatar) {
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
    elements.profileAvatar.replaceWith(badge);
  }
}

async function init() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  hydrateProfile();
  setupEvents();
  await loadCardsPage();
}

function setupEvents() {
  if (elements.btnTransfer) {
    elements.btnTransfer.addEventListener("click", () => {
      window.location.href = "app-transfers.html";
    });
  }
}

async function loadCardsPage() {
  try {
    const [accountsPayload, cardsPayload, transfersPayload] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=50", { auth: true }),
      apiRequest("/api/cards/my?page=1&pageSize=50", { auth: true }),
      apiRequest("/api/transfers/my?page=1&pageSize=50", { auth: true })
    ]);

    state.accounts = accountsPayload.items || accountsPayload.Items || [];
    state.cards = (cardsPayload.items || cardsPayload.Items || []).map((card, index) => {
      const theme = getCardTheme(index);
      const account = state.accounts.find((item) => (item.id || item.Id) === (card.accountId || card.AccountId));
      const fullNumber = card.fullCardNumber || card.FullCardNumber || card.cardNumber || card.CardNumber || "";

      return {
        ...card,
        uiIndex: index,
        theme,
        label: getCardLabel(card, index),
        brand: getCardBrand(fullNumber),
        fullNumber,
        formattedNumber: formatCardNumber(fullNumber),
        maskedNumber: card.maskedNumber || card.MaskedNumber || "",
        cvv: card.cvv || card.Cvv || "---",
        expiryDate: card.expiryDate || card.ExpiryDate || "--/--",
        holderName: card.cardHolderName || card.CardHolderName || "SOMONIBANK CLIENT",
        balance: Number(account?.balance ?? account?.Balance ?? 0),
        currency: account?.currency || account?.Currency || "TJS",
        accountId: card.accountId || card.AccountId,
        accountNumber: account?.accountNumber || account?.AccountNumber || "",
        iban: account?.iban || account?.Iban || ""
      };
    });

    state.transactions = transfersPayload.items || transfersPayload.Items || [];
    state.selectedCardId = state.cards[0]?.id || state.cards[0]?.Id || null;

    renderPage();
  } catch (error) {
    console.error(error);
    showToast("Не удалось загрузить карты");
    renderLoadError(error);
  }
}

function renderPage() {
  if (elements.pageTitle) {
    elements.pageTitle.textContent = "Карты";
  }

  if (elements.pageSubtitle) {
    elements.pageSubtitle.textContent = "Здесь показываются только ваши реальные карты без мок-данных.";
  }

  renderRecommendationBar();
  renderCardsList();
  renderSelectedCard();
  renderOperations();
  renderFunctions();
  renderRightColumn();
  renderSummaryFooter();
}

function renderRecommendationBar() {
  if (!elements.recommendationBar) {
    return;
  }

  const physicalCount = state.cards.filter((card) => String(card.type || card.Type || "").toLowerCase() === "physical").length;
  const virtualCount = state.cards.length - physicalCount;
  const recommendation = state.cards.length
    ? `Рекомендуем держать основную карту для переводов и отдельную карту для онлайн-оплат.`
    : "После выпуска карты здесь появятся рекомендации по её использованию.";

  elements.recommendationBar.innerHTML = `
    <button class="date-btn active" type="button">Всего карт: ${state.cards.length}</button>
    <button class="date-btn" type="button">Физические: ${physicalCount}</button>
    <button class="date-btn" type="button">Виртуальные: ${virtualCount}</button>
    <button class="date-btn" type="button" style="max-width:420px;white-space:normal;text-align:left;line-height:1.3;">${escapeHtml(recommendation)}</button>
  `;
}

function renderCardsList() {
  if (!elements.cardsList) {
    return;
  }

  if (!state.cards.length) {
    elements.cardsList.innerHTML = `
      <div class="manage-card blue" style="grid-column:1 / -1;cursor:default;">
        <div class="manage-card-top">
          <div class="card-icon-sq">💳</div>
        </div>
        <div>
          <div class="manage-card-label">У вас пока нет карт</div>
          <div class="manage-card-bal">Когда карта появится на главной странице, она появится и здесь.</div>
        </div>
      </div>
    `;
    return;
  }

  elements.cardsList.innerHTML = state.cards.map((card) => {
    const id = card.id || card.Id;
    const isSelected = id === state.selectedCardId;
    return `
      <div class="manage-card ${card.theme.className}" data-card-id="${id}">
        <div class="manage-card-top">
          <div class="card-icon-sq">${card.theme.icon}</div>
          <div class="card-switch" style="${isSelected ? "" : "background:#e2e8f0;"}"></div>
        </div>
        <div>
          <div class="manage-card-label">${escapeHtml(card.label)}</div>
          <div class="manage-card-bal">${escapeHtml(formatMoney(card.balance, card.currency))}</div>
          <div class="manage-card-num">${escapeHtml(card.formattedNumber || card.maskedNumber)}</div>
        </div>
      </div>
    `;
  }).join("");

  elements.cardsList.querySelectorAll("[data-card-id]").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedCardId = node.dataset.cardId;
      renderPage();
    });
  });
}

function getSelectedCard() {
  return state.cards.find((card) => String(card.id || card.Id) === String(state.selectedCardId)) || null;
}

function renderSelectedCard() {
  if (!elements.primaryBox) {
    return;
  }

  const selectedCard = getSelectedCard();
  if (!selectedCard) {
    elements.primaryBox.innerHTML = `
      <div class="box-title">Карты не найдены</div>
      <div style="color:#64748b;font-size:14px;line-height:1.6;">
        Здесь появится информация по карте: номер, срок действия и CVV.
      </div>
    `;
    return;
  }

  const relatedTransactions = getCardTransactions(selectedCard);
  const totalOutgoing = relatedTransactions
    .filter((item) => String(item.direction) === "out")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalIncoming = relatedTransactions
    .filter((item) => String(item.direction) === "in")
    .reduce((sum, item) => sum + item.amount, 0);

  elements.primaryBox.innerHTML = `
    <div class="box-header">
      <span class="box-title">${escapeHtml(selectedCard.label)}</span>
      <span style="font-size:12px;font-weight:800;color:${selectedCard.theme.accent};">${escapeHtml(selectedCard.brand)}</span>
    </div>
    <div class="visual-card" style="background:${selectedCard.theme.gradient};">
      <div class="v-card-top">
        <div>
          <div class="v-card-chip"></div>
          <div class="v-card-name">${escapeHtml(selectedCard.holderName)}</div>
          <div style="font-size:12px;opacity:0.9;">${escapeHtml(selectedCard.formattedNumber)}</div>
        </div>
        <div>
          <div class="v-card-balance">${escapeHtml(formatMoney(selectedCard.balance, selectedCard.currency))}</div>
          <div class="v-card-trend">${escapeHtml(selectedCard.status || selectedCard.Status || "Active")}</div>
        </div>
      </div>
      <div class="v-card-bottom">
        <div class="v-card-number">${escapeHtml(selectedCard.expiryDate)} · CVV ${escapeHtml(selectedCard.cvv)}</div>
        <div class="v-card-brand">${escapeHtml(selectedCard.brand)}</div>
      </div>
    </div>
    <div class="iban-display">
      <span>${escapeHtml(selectedCard.accountNumber || "Счёт не найден")}</span>
      <span>${escapeHtml(selectedCard.iban || "IBAN недоступен")}</span>
    </div>
    <div class="limits-section">
      <div class="limit-row">
        <span>Номер карты</span>
        <span class="limit-val">${escapeHtml(selectedCard.formattedNumber)}</span>
      </div>
      <div class="limit-row">
        <span>Срок действия</span>
        <span class="limit-val">${escapeHtml(selectedCard.expiryDate)}</span>
      </div>
      <div class="limit-row">
        <span>CVV</span>
        <span class="limit-val">${escapeHtml(selectedCard.cvv)}</span>
      </div>
      <div class="limit-row">
        <span>Статус</span>
        <span class="limit-val">${escapeHtml(selectedCard.status || selectedCard.Status || "Active")}</span>
      </div>
    </div>
    <button class="btn-transfer" id="btnGoToTransfer">
      Перевести
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <div style="margin-top:auto;">
      <div class="box-title" style="font-size:15px; margin-bottom:12px;">Сводка по карте</div>
      <div style="display:flex; align-items:baseline; gap:8px; flex-wrap:wrap;">
        <span style="font-size:20px; font-weight:900; color:#16a34a;">+ ${escapeHtml(formatMoney(totalIncoming, selectedCard.currency))}</span>
        <span style="font-size:20px; font-weight:900; color:#cbd5e1;">|</span>
        <span style="font-size:16px; font-weight:800; color:#1e293b;">- ${escapeHtml(formatMoney(totalOutgoing, selectedCard.currency))}</span>
      </div>
      <div style="margin-top:14px;color:#64748b;font-size:13px;line-height:1.6;">
        Карта привязана к счёту ${escapeHtml(selectedCard.accountNumber || "без счёта")} и показывает реальные данные без демо-вставок.
      </div>
    </div>
  `;

  const transferButton = document.getElementById("btnGoToTransfer");
  if (transferButton) {
    transferButton.addEventListener("click", () => {
      window.location.href = "app-transfers.html";
    });
  }
}

function getCardTransactions(card) {
  return state.transactions
    .filter((transaction) => {
      const fromAccountId = transaction.fromAccountId || transaction.FromAccountId;
      const toAccountId = transaction.toAccountId || transaction.ToAccountId;
      return String(fromAccountId) === String(card.accountId) || String(toAccountId) === String(card.accountId);
    })
    .map((transaction) => {
      const fromAccountId = transaction.fromAccountId || transaction.FromAccountId;
      const outgoing = String(fromAccountId) === String(card.accountId);
      return {
        raw: transaction,
        direction: outgoing ? "out" : "in",
        amount: Number(transaction.amount ?? transaction.Amount ?? 0)
      };
    });
}

function renderOperations() {
  if (!elements.operationsListMiddle) {
    return;
  }

  const selectedCard = getSelectedCard();
  const items = selectedCard ? getCardTransactions(selectedCard).slice(0, 6) : [];

  if (!items.length) {
    elements.operationsListMiddle.innerHTML = `
      <div class="box-title">Последние операции</div>
      <div class="op-item">
        <div class="op-icon">ℹ️</div>
        <div class="op-info">
          <div class="op-name">Операций пока нет</div>
          <div class="op-memo">После перевода или пополнения здесь появится реальная история по этой карте.</div>
        </div>
      </div>
    `;
    return;
  }

  elements.operationsListMiddle.innerHTML = `
    <div class="box-title">Последние операции</div>
    ${items.map(({ raw, direction }) => {
      const amount = Number(raw.amount ?? raw.Amount ?? 0);
      const currency = raw.currency || raw.Currency || "TJS";
      const title = raw.description || raw.Description || (direction === "out" ? "Перевод с карты" : "Зачисление на карту");
      const counterparty = direction === "out"
        ? (raw.toAccountNumber || raw.ToAccountNumber || "Получатель")
        : (raw.fromAccountNumber || raw.FromAccountNumber || "Отправитель");
      return `
        <div class="op-item">
          <div class="op-icon">${direction === "out" ? "↗" : "↙"}</div>
          <div class="op-info">
            <div class="op-name">${escapeHtml(title)}</div>
            <div class="op-memo">${escapeHtml(counterparty)}</div>
          </div>
          <div class="op-amt-col">
            <div class="op-amt ${direction === "in" ? "pos" : "neg"}">${direction === "in" ? "+" : "-"} ${escapeHtml(formatMoney(amount, currency))}</div>
            <div class="op-date">${escapeHtml(formatDate(raw.createdAt || raw.CreatedAt))}</div>
          </div>
        </div>
      `;
    }).join("")}
  `;
}

function renderFunctions() {
  if (!elements.functionsBox) {
    return;
  }

  const selectedCard = getSelectedCard();
  if (!selectedCard) {
    elements.functionsBox.innerHTML = "";
    return;
  }

  elements.functionsBox.innerHTML = `
    <div class="box-title" style="margin-bottom:16px;">Данные карты</div>
    <div class="func-row">
      <div class="func-icon">💳</div>
      <div class="func-text">Полный номер карты</div>
      <div class="func-val" style="color:#1e293b;">${escapeHtml(selectedCard.formattedNumber)}</div>
    </div>
    <div class="func-row">
      <div class="func-icon">📅</div>
      <div class="func-text">Срок действия</div>
      <div class="func-val" style="color:#1e293b;">${escapeHtml(selectedCard.expiryDate)}</div>
    </div>
    <div class="func-row">
      <div class="func-icon">🔐</div>
      <div class="func-text">CVV</div>
      <div class="func-val" style="color:#1e293b;">${escapeHtml(selectedCard.cvv)}</div>
    </div>
    <div class="func-row">
      <div class="func-icon">🏦</div>
      <div class="func-text">Привязанный счёт</div>
      <div class="func-val" style="color:#1e293b;">${escapeHtml(selectedCard.accountNumber || "Нет данных")}</div>
    </div>
  `;
}

function renderRightColumn() {
  if (!elements.rightCol) {
    return;
  }

  const selectedCard = getSelectedCard();
  const activeCards = state.cards.filter((card) => String(card.status || card.Status).toLowerCase() === "active").length;
  const totalBalance = state.cards.reduce((sum, card) => sum + Number(card.balance || 0), 0);
  const topCards = state.cards.slice(0, 4);

  elements.rightCol.innerHTML = `
    <div class="insight-box">
      <div class="box-title" style="font-size:14px; margin-bottom:16px;">Рекомендуем для этой карты</div>
      <div class="insight-card">
        <div class="insight-icon">🛡️</div>
        <div class="insight-text">
          <div class="insight-name">Основная карта для переводов</div>
          <div class="insight-desc">Используйте ${escapeHtml(selectedCard?.label || "эту карту")} для быстрых переводов и контроля баланса.</div>
        </div>
      </div>
      <div class="insight-card">
        <div class="insight-icon">📲</div>
        <div class="insight-text">
          <div class="insight-name">Проверяйте историю операций</div>
          <div class="insight-desc">После каждого перевода запись сразу появится в истории и SMS-уведомлении.</div>
        </div>
      </div>
    </div>
    <div class="mini-ops-box">
      <div class="box-title" style="font-size:14px; margin-bottom:16px;">Все ваши карты</div>
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${topCards.length ? topCards.map((card) => `
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:32px; height:32px; border-radius:50%; background:#eff6ff; display:grid; place-items:center; font-size:14px;">${card.theme.icon}</div>
            <div style="flex:1">
              <div style="font-size:12px; font-weight:700;">${escapeHtml(card.label)}</div>
              <div style="font-size:10px; color:#94a3b8;">${escapeHtml(card.formattedNumber)}</div>
            </div>
            <div style="font-size:12px; font-weight:800; color:#1e293b;">
              ${escapeHtml(formatMoney(card.balance, card.currency))}
            </div>
          </div>
        `).join("") : '<div style="color:#64748b;font-size:14px;">Карты пока не найдены.</div>'}
      </div>
    </div>
    <div class="insight-box">
      <div class="box-title" style="font-size:14px; margin-bottom:16px;">Сводка</div>
      <div class="limits-card" style="margin-top:0;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="font-size:18px;">💳</div>
          <div style="flex:1">
            <div style="font-size:12px; font-weight:800;">Активные карты</div>
            <div style="font-size:10px; color:#94a3b8;">Без мок-данных</div>
          </div>
          <div style="font-size:12px; font-weight:800;">${activeCards}</div>
        </div>
        <div class="limit-progress-bar">
          <div class="limit-fill" style="width:${state.cards.length ? Math.max(20, (activeCards / state.cards.length) * 100) : 0}%;"></div>
        </div>
      </div>
      <div style="margin-top:16px;color:#64748b;font-size:13px;line-height:1.6;">
        Общий баланс по картам: <strong style="color:#1e293b;">${escapeHtml(formatMoney(totalBalance, "TJS"))}</strong>
      </div>
    </div>
  `;
}

function renderSummaryFooter() {
  if (!elements.summaryFooter) {
    return;
  }

  const selectedCard = getSelectedCard();
  const relatedTransactions = selectedCard ? getCardTransactions(selectedCard) : [];
  const outgoingTotal = relatedTransactions
    .filter((item) => item.direction === "out")
    .reduce((sum, item) => sum + item.amount, 0);
  const incomingTotal = relatedTransactions
    .filter((item) => item.direction === "in")
    .reduce((sum, item) => sum + item.amount, 0);
  const progress = selectedCard?.balance ? Math.min(100, Math.max(10, Number(selectedCard.balance))) : 10;

  elements.summaryFooter.innerHTML = `
    <div class="footer-stat">
      <span class="footer-label">Поступления</span>
      <span class="footer-val">+ ${escapeHtml(formatMoney(incomingTotal, selectedCard?.currency || "TJS"))}</span>
    </div>
    <div class="footer-progress-track">
      <div class="footer-progress-fill" style="width:${progress}%;"></div>
    </div>
    <div class="footer-stat" style="text-align: right;">
      <span class="footer-label">Списания</span>
      <span class="footer-val">- ${escapeHtml(formatMoney(outgoingTotal, selectedCard?.currency || "TJS"))}</span>
    </div>
  `;
}

function renderLoadError(error) {
  if (!elements.primaryBox) {
    return;
  }

  elements.primaryBox.innerHTML = `
    <div class="box-title">Не удалось загрузить страницу карт</div>
    <div style="margin-top:12px;color:#64748b;font-size:14px;line-height:1.6;">
      ${escapeHtml(error?.message || "Попробуйте обновить страницу.")}
    </div>
  `;

  if (elements.cardsList) {
    elements.cardsList.innerHTML = "";
  }
  if (elements.operationsListMiddle) {
    elements.operationsListMiddle.innerHTML = "";
  }
  if (elements.functionsBox) {
    elements.functionsBox.innerHTML = "";
  }
  if (elements.rightCol) {
    elements.rightCol.innerHTML = "";
  }
  if (elements.summaryFooter) {
    elements.summaryFooter.innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", init);
