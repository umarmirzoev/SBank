import { apiRequest, clearSession, formatMoney, getSession, showToast } from "./common.js";

const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");
const totalBalance = document.getElementById("totalBalance");
const bonusLabel = document.getElementById("bonusLabel");
const accountPanel = document.getElementById("accountPanel");
const operationsList = document.getElementById("operationsList");
const logoutButton = document.getElementById("logoutButton");
const addCardButton = document.getElementById("addCardButton");
const verifyButton = document.getElementById("verifyButton");

const session = getSession();

if (!session?.token) {
  window.location.href = "login.html";
}

userName.textContent = session?.fullName || "Клиент";
userAvatar.textContent = (session?.fullName || "К").trim().charAt(0).toUpperCase();

logoutButton?.addEventListener("click", () => {
  clearSession();
  window.location.href = "login.html";
});

addCardButton?.addEventListener("click", () => {
  showToast("Сначала откройте карту через backend API, затем она появится здесь.");
});

verifyButton?.addEventListener("click", () => {
  showToast("Верификация уже отправлена после регистрации.");
});

function getItems(payload) {
  return payload?.items || payload?.Items || [];
}

function renderAccount(accounts, cards) {
  const account = accounts[0];
  const card = cards[0];

  if (!account) {
    accountPanel.innerHTML = `<div class="empty-note"><strong>Счёт пока не создан.</strong><br>После регистрации он появится автоматически.</div>`;
    return;
  }

  if (!card) {
    accountPanel.innerHTML = `
      <div class="account-wrap">
        <div class="bank-card-visual">
          <div class="chip"></div>
          <div class="num">0000 0000 0000 0000</div>
          <div class="holder">КАРТА ЕЩЁ НЕ ВЫПУЩЕНА</div>
        </div>
        <div class="account-main">
          <strong>${account.type} счёт • ${account.accountNumber.slice(-4)}</strong>
          <div class="account-sub">Основной счёт</div>
          <div class="account-balance">${formatMoney(account.balance, account.currency)}</div>
          <div class="account-delta">+0.00 c. • Сегодня</div>
        </div>
        <div class="account-actions">
          <button type="button">Пополнить</button>
          <button type="button">Перевести</button>
        </div>
      </div>
    `;
    return;
  }

  accountPanel.innerHTML = `
    <div class="account-wrap">
      <div class="bank-card-visual">
        <div class="chip"></div>
        <div class="num">${card.cardNumber}</div>
        <div class="holder">${card.cardHolderName || "SOMONIBANK CLIENT"}</div>
      </div>
      <div class="account-main">
        <strong>${card.type} • ${String(card.cardNumber || "").slice(-4)}</strong>
        <div class="account-sub">Основная карта</div>
        <div class="account-balance">${formatMoney(account.balance, account.currency)}</div>
        <div class="account-delta">${card.delta || "+0.00 c. • Сегодня"}</div>
      </div>
      <div class="account-actions">
        <button type="button">Пополнить</button>
        <button type="button">Перевести</button>
        <button type="button">Ещё</button>
      </div>
    </div>
  `;
}

function renderOperations(transactions) {
  if (!transactions.length) {
    operationsList.innerHTML = `
      <div class="empty-note">
        <strong>Ещё нет операций.</strong><br>
        Выполните первую операцию, и она появится в истории.
      </div>
    `;
    return;
  }

  operationsList.innerHTML = transactions.slice(0, 5).map((transaction, index) => {
    const amount = Number(transaction.amount || transaction.Amount || 0);
    const title = transaction.description || transaction.Description || transaction.type || transaction.Type || "Операция";
    const createdAt = transaction.createdAt || transaction.CreatedAt;
    const amountClass = amount >= 0 ? "income" : "";
    const iconClass = index % 3 === 0 ? "blue" : index % 3 === 1 ? "green" : "cyan";

    return `
      <div class="op-item">
        <div class="op-icon ${iconClass}">${amount >= 0 ? "+" : "−"}</div>
        <div>
          <div class="op-title">${title}</div>
          <div class="op-sub">${createdAt ? new Date(createdAt).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Без даты"}</div>
        </div>
        <div class="op-amount ${amountClass}">${amount >= 0 ? "+" : ""}${formatMoney(amount, transaction.currency || transaction.Currency || "TJS")}</div>
      </div>
    `;
  }).join("");
}

async function loadDashboard() {
  // Загрузка в режиме «точь-в-точь макет»
  totalBalance.textContent = "0.05 c.";
  bonusLabel.textContent = "1.44 бонусов";

  const accountData = [{
    accountNumber: "1234 5678 9876 3450",
    type: "Visa Classic",
    currency: "TJS",
    balance: 1240.50
  }];

  const cardData = [{
    cardNumber: "4567 8901 2345 6789",
    cardHolderName: "ABDULLAH I",
    type: "Visa Classic",
    delta: "+24.50 c. • Сегодня"
  }];

  renderAccount(accountData, cardData);

  const operations = [
    { amount: -200, description: "Перевод на карту **** 4587", createdAt: "2025-10-30T14:32:00", currency: "TJS" },
    { amount: -20, description: "Оплата Мобильная связь", createdAt: "2025-10-30T12:11:00", currency: "TJS" },
    { amount: 500, description: "Пополнение с карты **** 1234", createdAt: "2025-10-30T20:45:00", currency: "TJS" },
    { amount: -50, description: "Оплата Интернет", createdAt: "2025-10-29T18:20:00", currency: "TJS" },
    { amount: 150, description: "Перевод между счетами", createdAt: "2025-10-15T16:05:00", currency: "TJS" }
  ];

  renderOperations(operations);
}

void loadDashboard();
