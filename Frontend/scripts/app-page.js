import { clearSession, formatMoney, getSession, showToast } from "./common.js";

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

userName.textContent = session?.fullName || session?.FullName || "Клиент";
userAvatar.textContent = (session?.fullName || session?.FullName || "К").trim().charAt(0).toUpperCase();

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
          <strong>${account.type} счёт • ${String(account.accountNumber || "").slice(-4)}</strong>
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
    const amount = Number(transaction.amount || 0);
    const title = transaction.description || transaction.type || "Операция";
    const createdAt = transaction.createdAt;
    const amountClass = amount >= 0 ? "income" : "";
    const iconClass = index % 3 === 0 ? "blue" : index % 3 === 1 ? "green" : "cyan";

    return `
      <div class="op-item">
        <div class="op-icon ${iconClass}">${amount >= 0 ? "+" : "−"}</div>
        <div>
          <div class="op-title">${title}</div>
          <div class="op-sub">${createdAt ? new Date(createdAt).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Без даты"}</div>
        </div>
        <div class="op-amount ${amountClass}">${amount >= 0 ? "+" : ""}${formatMoney(amount, transaction.currency || "TJS")}</div>
      </div>
    `;
  }).join("");
}

function loadDashboard() {
  totalBalance.textContent = "0.00 c.";
  bonusLabel.textContent = "0.00 бонусов";

  renderAccount([], []);

  renderOperations([]);
}

loadDashboard();
