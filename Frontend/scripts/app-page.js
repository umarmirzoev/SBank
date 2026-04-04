import { apiRequest, getSession, showToast, formatMoney, formatDate, isAuthenticated } from "./common.js";

const userNameEl = document.querySelectorAll(".user-name")[0];
const userAvatarEl = document.querySelector(".user-avatar");
const totalBalEl = document.querySelector(".hero-bal");
const bonusEl = document.querySelector(".hero-bonus span");
const cardNumberEl = document.querySelector(".v-num");
const cardHolderEl = document.querySelector(".v-holder");
const cardExpiryEl = document.querySelector("[data-card-expiry]");
const cardTitleEl = document.querySelector(".card-type-name");
const cardBalanceEl = document.querySelector(".card-stats-bal");
const cardDeltaEl = document.querySelector(".card-stats-delta");
const operationsListEl = document.querySelector(".op-list");
const rightSidebarEl = document.querySelector(".right-sidebar");

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

function formatCardNumber(value) {
    return String(value || "").replace(/(\d{4})(?=\d)/g, "$1 ").trim();
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
        btn.addEventListener("click", () => {
            const text = btn.innerText || btn.querySelector(".pop-label")?.innerText || "Действие";
            showToast(`Функция "${text.trim()}" в разработке`);
        });
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

function renderDashboard() {
    const formattedBalance = formatMoney(dashboardState.balance, "TJS");
    const formattedCardBalance = formatMoney(dashboardState.cardBalance, "TJS");
    const formattedCardNumber = formatCardNumber(dashboardState.cardNumber);

    if (totalBalEl) {
        totalBalEl.textContent = formattedBalance;
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
        cardBalanceEl.textContent = formattedCardBalance;
    }

    if (cardDeltaEl) {
        cardDeltaEl.textContent = "Баланс карты";
    }

    renderOperations();
    renderSidebarSummary(formattedBalance);
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
            <div style="margin-top:8px;"><strong>Общий баланс:</strong> ${formattedBalance}</div>
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
    setProfile();
    applyStaticCleanup();
    renderDashboard();
    loadDashboardData();
}

document.addEventListener("DOMContentLoaded", initDashboard);
initDashboard();

