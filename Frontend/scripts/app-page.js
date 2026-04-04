import { apiRequest, getSession, showToast, formatMoney, formatDate, isAuthenticated } from "./common.js";

let userNameEl;
let userAvatarEl;
let totalBalEl;
let totalBalRowEl;
let balanceToggleEl;
let heroPlusEl;
let bonusEl;
let cardNumberEl;
let cardHolderEl;
let cardExpiryEl;
let cardTitleEl;
let cardBalanceEl;
let cardDeltaEl;
let operationsListEl;
let rightSidebarEl;

const session = getSession();
const dashboardState = {
    balance: 0,
    cardBalance: 0,
    cardNumber: "823553923814",
    holderName: "UMARJON TEST",
    expiryDate: "04/29",
    cardTail: "3814",
    operations: []
};

const TRANSFER_PRESET_KEY = "sb-transfer-preset";
let isBalanceHidden = false;

function cacheElements() {
    userNameEl = document.querySelectorAll(".user-name")[0];
    userAvatarEl = document.querySelector(".user-avatar");
    totalBalEl = document.querySelector(".hero-bal");
    totalBalRowEl = document.querySelector(".hero-bal-row");
    balanceToggleEl = document.querySelector("[data-balance-toggle]");
    heroPlusEl = document.querySelector(".hero-plus");
    bonusEl = document.querySelector(".hero-bonus span");
    cardNumberEl = document.querySelector(".v-num");
    cardHolderEl = document.querySelector(".v-holder");
    cardExpiryEl = document.querySelector("[data-card-expiry]");
    cardTitleEl = document.querySelector(".card-type-name");
    cardBalanceEl = document.querySelector(".card-stats-bal");
    cardDeltaEl = document.querySelector(".card-stats-delta");
    operationsListEl = document.querySelector(".op-list");
    rightSidebarEl = document.querySelector(".right-sidebar");
}

function formatCardNumber(value) {
    return String(value || "").replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function eyeIconMarkup(hidden) {
    return hidden
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 10.6a3 3 0 0 0 4.24 4.24"/><path d="M9.88 5.09A10.94 10.94 0 0 1 12 4c5 0 8.27 3.11 9.5 8-0.42 1.67-1.21 3.09-2.35 4.22"/><path d="M6.61 6.61C4.62 8 3.3 9.83 2.5 12c1.23 4.89 4.5 8 9.5 8 1.73 0 3.3-.37 4.69-1.04"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.1 12c.5-2 1.3-4 2.8-5.5C6.4 5 8.7 4 11 4s4.6 1 6.1 2.5c1.5 1.5 2.3 3.5 2.8 5.5-.5 2-1.3 4-2.8 5.5C15.6 19 13.3 20 11 20s-4.6-1-6.1-2.5C3.4 16 2.6 14 2.1 12Z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function hiddenMoneyMask(value) {
    const currency = String(value || "").replace(/[\d\s.,]/g, "").trim();
    return currency ? `***** ${currency}` : "*****";
}

function updateBalanceToggleUi() {
    if (!balanceToggleEl) {
        return;
    }

    balanceToggleEl.innerHTML = eyeIconMarkup(isBalanceHidden);
    balanceToggleEl.setAttribute("aria-label", isBalanceHidden ? "Показать баланс" : "Скрыть баланс");
    balanceToggleEl.title = isBalanceHidden ? "Показать баланс" : "Скрыть баланс";

    if (heroPlusEl) {
        heroPlusEl.textContent = isBalanceHidden ? "•" : "+";
        heroPlusEl.setAttribute("aria-label", isBalanceHidden ? "Показать деньги" : "Скрыть деньги");
        heroPlusEl.title = isBalanceHidden ? "Показать деньги" : "Скрыть деньги";
    }
}

function setProfile() {
    if (!session) {
        return;
    }

    const displayName = session.fullName || "Umarjon Test";
    if (userNameEl) {
        userNameEl.textContent = displayName;
    }

    if (userAvatarEl) {
        userAvatarEl.textContent = displayName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() || "")
            .join("");
    }
}

function applyStaticCleanup() {
    document.querySelectorAll(".hero-shield, .hero-coins-visual, .hero-card-mock").forEach((element) => {
        element.style.display = "none";
    });

    document.querySelectorAll(".promo-banner, .security-widget").forEach((element) => {
        element.remove();
    });

    document.querySelectorAll("button, .pop-card, .svc-box").forEach((btn) => {
        if (btn.dataset.boundAction === "true") {
            return;
        }
        btn.addEventListener("click", () => {
            const text = btn.innerText || btn.querySelector(".pop-label")?.innerText || "Действие";
            showToast(`Функция "${text.trim()}" в разработке`);
        });
        btn.dataset.boundAction = "true";
    });

    document.querySelectorAll(".nav-item a").forEach((link) => {
        if (link.getAttribute("href") === "#") {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                showToast("Эта страница скоро появится!");
            });
        }
    });
}

function goToTransfer(type) {
    sessionStorage.setItem(TRANSFER_PRESET_KEY, type);
    window.location.href = "app-transfers.html";
}

function bindActionByText(selector, handlers) {
    document.querySelectorAll(selector).forEach((element) => {
        const rawText = (element.innerText || element.textContent || "").trim().toLowerCase();
        const handler = handlers.find((item) => rawText.includes(item.match));
        if (!handler) {
            return;
        }

        const clickable = element.tagName === "BUTTON" ? element : element;
        clickable.dataset.boundAction = "true";
        clickable.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            handler.action();
        });
    });
}

function bindDashboardActions() {
    bindActionByText(".hero-actions .hero-btn", [
        { match: "оплатить", action: () => { window.location.href = "app-payments.html"; } },
        { match: "перевести", action: () => goToTransfer("card") },
        { match: "между счетами", action: () => goToTransfer("requisites") }
    ]);

    bindActionByText(".pop-card", [
        { match: "somoni", action: () => goToTransfer("phone") },
        { match: "на карту", action: () => goToTransfer("card") },
        { match: "мобильная связь", action: () => { window.location.href = "app-mobile-topup.html"; } },
        { match: "интернет", action: () => { window.location.href = "app-internet-tv.html"; } },
        { match: "коммунальные услуги", action: () => { window.location.href = "app-payments.html"; } },
        { match: "госуслуги", action: () => { window.location.href = "app-payments.html"; } },
        { match: "налоги", action: () => { window.location.href = "app-payments.html"; } }
    ]);

    bindActionByText(".card-action-btn", [
        { match: "перевести", action: () => goToTransfer("card") }
    ]);
}

function bindBalanceVisibilityToggle() {
    const toggleVisibility = (event) => {
        event.preventDefault();
        event.stopPropagation();
        isBalanceHidden = !isBalanceHidden;
        renderDashboard();
    };

    window.toggleDashboardBalance = toggleVisibility;

    if (balanceToggleEl) {
        balanceToggleEl.dataset.boundAction = "true";
        balanceToggleEl.addEventListener("click", toggleVisibility);
    }

    if (heroPlusEl) {
        heroPlusEl.dataset.boundAction = "true";
        heroPlusEl.addEventListener("click", toggleVisibility);
    }

    if (totalBalEl) {
        totalBalEl.dataset.boundAction = "true";
        totalBalEl.addEventListener("click", toggleVisibility);
    }

    if (totalBalRowEl) {
        totalBalRowEl.dataset.boundAction = "true";
    }

    updateBalanceToggleUi();
}

function renderDashboard() {
    const formattedBalance = formatMoney(dashboardState.balance, "TJS");
    const formattedCardBalance = formatMoney(dashboardState.cardBalance, "TJS");
    const formattedCardNumber = formatCardNumber(dashboardState.cardNumber);

    if (totalBalEl) {
        totalBalEl.textContent = isBalanceHidden ? hiddenMoneyMask(formattedBalance) : formattedBalance;
    }

    if (bonusEl) {
        bonusEl.textContent = "Доступно для оплаты и переводов";
    }

    if (cardNumberEl) {
        cardNumberEl.textContent = formattedCardNumber;
    }

    if (cardHolderEl) {
        cardHolderEl.textContent = dashboardState.holderName;
    }

    if (cardExpiryEl) {
        cardExpiryEl.textContent = dashboardState.expiryDate;
    }

    if (cardTitleEl) {
        cardTitleEl.textContent = `Visa Classic •• ${dashboardState.cardTail}`;
    }

    if (cardBalanceEl) {
        cardBalanceEl.textContent = isBalanceHidden ? hiddenMoneyMask(formattedCardBalance) : formattedCardBalance;
    }

    if (cardDeltaEl) {
        cardDeltaEl.textContent = "Баланс карты";
    }

    renderOperations();
    renderSidebarSummary(formattedBalance);
    updateBalanceToggleUi();
}

function renderOperations() {
    if (!operationsListEl) {
        return;
    }

    if (!dashboardState.operations.length) {
        operationsListEl.innerHTML = `
            <div class="empty-state">
                Здесь будут показываться только реальные операции по вашей карте.
            </div>
        `;
        return;
    }

    operationsListEl.innerHTML = dashboardState.operations.map((item) => {
        const amount = Number(item.amount ?? item.Amount ?? 0);
        const currency = item.currency || item.Currency || "TJS";
        const isIncoming = !item.fromAccountId && Boolean(item.toAccountId) ? true : amount >= 0;
        const directionClass = isIncoming ? "pos" : "";
        const sign = isIncoming ? "+" : "-";
        const title = item.description || item.Description || "Перевод";
        const counterparty = item.toAccountNumber || item.ToAccountNumber || item.fromAccountNumber || item.FromAccountNumber || "Счёт";

        return `
            <div class="op-item">
                <div class="op-icon-cl">${isIncoming ? "↓" : "↑"}</div>
                <div class="op-text">
                    <div class="op-name">${title}</div>
                    <div class="op-memo">${counterparty} • ${formatDate(item.createdAt || item.CreatedAt)}</div>
                </div>
                <div class="op-amount ${directionClass}">${sign}${formatMoney(Math.abs(amount), currency)}</div>
            </div>
        `;
    }).join("");
}

function renderSidebarSummary(formattedBalance) {
    if (!rightSidebarEl) {
        return;
    }

    const existingSummary = document.querySelector("[data-card-summary]");
    if (existingSummary) {
        existingSummary.remove();
    }

    const summaryCard = document.createElement("div");
    summaryCard.className = "sidebar-box";
    summaryCard.dataset.cardSummary = "true";
    summaryCard.innerHTML = `
        <div class="section-title-row">
            <span class="section-title" style="font-size:14px;">Данные карты</span>
        </div>
        <div class="empty-state">
            <div><strong>Номер:</strong> ${dashboardState.cardNumber}</div>
            <div style="margin-top:8px;"><strong>Срок:</strong> ${dashboardState.expiryDate}</div>
            <div style="margin-top:8px;"><strong>Общий баланс:</strong> ${isBalanceHidden ? hiddenMoneyMask(formattedBalance) : formattedBalance}</div>
        </div>
    `;
    rightSidebarEl.appendChild(summaryCard);
}

async function loadDashboardData() {
    if (!isAuthenticated()) {
        renderDashboard();
        return;
    }

    try {
        const [accountsPayload, cardsPayload, transfersPayload] = await Promise.all([
            apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true }),
            apiRequest("/api/cards/my?page=1&pageSize=20", { auth: true }),
            apiRequest("/api/transfers/my?page=1&pageSize=5", { auth: true })
        ]);

        const accounts = accountsPayload.items || accountsPayload.Items || [];
        const cards = cardsPayload.items || cardsPayload.Items || [];
        const transfers = transfersPayload.items || transfersPayload.Items || [];

        dashboardState.balance = accounts.reduce((sum, account) => sum + Number(account.balance ?? account.Balance ?? 0), 0);

        const primaryCard = cards[0];
        const primaryAccount = accounts[0];

        if (primaryCard) {
            const masked = primaryCard.maskedNumber || primaryCard.MaskedNumber || "";
            const digits = masked.replace(/\D/g, "");
            if (digits.length >= 4) {
                dashboardState.cardTail = digits.slice(-4);
            }

            dashboardState.cardNumber = primaryCard.cardNumber || primaryCard.CardNumber || dashboardState.cardNumber;
            dashboardState.holderName = primaryCard.cardHolderName || primaryCard.CardHolderName || dashboardState.holderName;
            dashboardState.expiryDate = primaryCard.expiryDate || primaryCard.ExpiryDate || dashboardState.expiryDate;
        }

        if (primaryAccount) {
            dashboardState.cardBalance = Number(primaryAccount.balance ?? primaryAccount.Balance ?? 0);
        } else {
            dashboardState.cardBalance = dashboardState.balance;
        }

        dashboardState.operations = transfers;
    } catch (error) {
        console.error(error);
        showToast("Не удалось обновить главный экран");
    }

    renderDashboard();
}

function initDashboard() {
    cacheElements();
    setProfile();
    bindDashboardActions();
    bindBalanceVisibilityToggle();
    applyStaticCleanup();
    renderDashboard();
    loadDashboardData();
}

document.addEventListener("DOMContentLoaded", initDashboard);
initDashboard();

