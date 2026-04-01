import {
  apiRequest,
  formatDate,
  formatMoney,
  messageBox,
  mountHeaderAuth,
  openAuthModal,
  requireAuth,
  showToast
} from "./common.js";

mountHeaderAuth();

document.querySelectorAll("[data-toast]").forEach((element) => {
  element.addEventListener("click", (event) => {
    if (element.getAttribute("href") === "#") {
      event.preventDefault();
    }
    showToast(element.dataset.toast);
  });
});

const guideTabs = document.querySelectorAll(".guide-tab");
const guideCards = document.querySelectorAll(".guide-mini-card");

guideTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    guideTabs.forEach((item) => item.classList.toggle("active", item === tab));
    if (tab.dataset.guide === "security") {
      guideCards[0]?.classList.add("primary");
      guideCards[1]?.classList.remove("primary");
      guideCards[2]?.classList.remove("primary");
      showToast("Открыт раздел: Настройки и безопасность.");
    } else {
      guideCards[0]?.classList.remove("primary");
      guideCards[1]?.classList.add("primary");
      guideCards[2]?.classList.remove("primary");
      showToast("Открыт раздел: Карты.");
    }
  });
});

const hero = document.querySelector(".hero");
const dashboard = document.createElement("section");
dashboard.className = "sb-dashboard";
dashboard.id = "sb-dashboard";
dashboard.innerHTML = `
  <div class="sb-dashboard-head">
    <div>
      <h2 class="sb-dashboard-title">Личный кабинет</h2>
      <p class="sb-dashboard-copy">Здесь мы показываем краткую информацию из backend: счета, карты, последние операции и уведомления.</p>
    </div>
    <div class="sb-cta">
      <button class="sb-ghost-btn" type="button" data-dashboard-action="refresh">Обновить</button>
      <button class="sb-btn" type="button" data-dashboard-action="auth">Войти</button>
    </div>
  </div>
  <div data-dashboard-content></div>
`;

hero.insertAdjacentElement("afterend", dashboard);

dashboard.querySelector('[data-dashboard-action="auth"]').addEventListener("click", () => openAuthModal("login", loadDashboard));
dashboard.querySelector('[data-dashboard-action="refresh"]').addEventListener("click", () => void loadDashboard());

async function loadDashboard() {
  const content = dashboard.querySelector("[data-dashboard-content]");

  if (!localStorage.getItem("sbank-session")) {
    content.innerHTML = `
      ${messageBox("info", "Войдите в аккаунт, чтобы открыть данные backend API.")}
      <div class="sb-cta" style="margin-top:12px;">
        <button class="sb-btn" type="button" data-dashboard-login>Войти</button>
        <button class="sb-ghost-btn" type="button" data-dashboard-register>Регистрация</button>
      </div>
    `;
    content.querySelector("[data-dashboard-login]")?.addEventListener("click", () => openAuthModal("login", loadDashboard));
    content.querySelector("[data-dashboard-register]")?.addEventListener("click", () => openAuthModal("register", loadDashboard));
    return;
  }

  content.innerHTML = messageBox("info", "Загружаем данные пользователя...");

  try {
    const [accountsPayload, cardsPayload, transactionsPayload, notificationsPayload] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=10", { auth: true }),
      apiRequest("/api/cards/my?page=1&pageSize=10", { auth: true }),
      apiRequest("/api/transactions/recent", { auth: true }),
      apiRequest("/api/notifications/my?page=1&pageSize=10", { auth: true })
    ]);

    const accounts = accountsPayload.items || accountsPayload.Items || [];
    const cards = cardsPayload.items || cardsPayload.Items || [];
    const transactions = transactionsPayload.items || transactionsPayload.Items || [];
    const notifications = notificationsPayload.items || notificationsPayload.Items || [];
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance || account.Balance || 0), 0);

    content.innerHTML = `
      <div class="sb-grid">
        <article class="sb-card span-4"><div class="sb-kpi"><strong>${accounts.length}</strong><span>Счетов</span></div></article>
        <article class="sb-card span-4"><div class="sb-kpi"><strong>${formatMoney(totalBalance)}</strong><span>Общий баланс</span></div></article>
        <article class="sb-card span-4"><div class="sb-kpi"><strong>${cards.length}</strong><span>Карт</span></div></article>

        <article class="sb-card span-6" id="sb-transfer-form">
          <h3>Быстрые действия</h3>
          <div class="sb-cta">
            <button class="sb-btn" type="button" data-quick-action="cards">Мои карты</button>
            <button class="sb-ghost-btn" type="button" data-quick-action="transfers">Переводы</button>
          </div>
          <div style="margin-top:14px;">${messageBox("info", "Для расширенных операций используйте API-панели на этой и соседних страницах.")}</div>
        </article>

        <article class="sb-card span-6">
          <h3>Счета</h3>
          ${accounts.length === 0 ? `<div class="sb-empty">Счетов пока нет.</div>` : `<div class="sb-list">${accounts.map((account) => `
            <div class="sb-list-item">
              <div class="sb-list-main">
                <div class="sb-list-title">${account.accountNumber || account.AccountNumber}</div>
                <div class="sb-list-subtitle">${account.type || account.Type} · ${account.currency || account.Currency}</div>
                <div class="sb-list-meta">${formatMoney(account.balance || account.Balance, account.currency || account.Currency)}</div>
              </div>
            </div>`).join("")}</div>`}
        </article>

        <article class="sb-card span-6">
          <h3>Последние операции</h3>
          ${transactions.length === 0 ? `<div class="sb-empty">Операций пока нет.</div>` : `<div class="sb-list">${transactions.slice(0, 5).map((transaction) => `
            <div class="sb-list-item">
              <div class="sb-list-main">
                <div class="sb-list-title">${transaction.type || transaction.Type}</div>
                <div class="sb-list-subtitle">${transaction.description || transaction.Description || "Без описания"}</div>
                <div class="sb-list-meta">${formatMoney(transaction.amount || transaction.Amount, transaction.currency || transaction.Currency)} · ${formatDate(transaction.createdAt || transaction.CreatedAt)}</div>
              </div>
            </div>`).join("")}</div>`}
        </article>

        <article class="sb-card span-6">
          <h3>Уведомления</h3>
          ${notifications.length === 0 ? `<div class="sb-empty">Уведомлений пока нет.</div>` : `<div class="sb-list">${notifications.slice(0, 5).map((notification) => `
            <div class="sb-list-item">
              <div class="sb-list-main">
                <div class="sb-list-title">${notification.title || notification.Title}</div>
                <div class="sb-list-subtitle">${notification.message || notification.Message}</div>
                <div class="sb-list-meta">${formatDate(notification.createdAt || notification.CreatedAt)}</div>
              </div>
            </div>`).join("")}</div>`}
        </article>
      </div>
    `;

    content.querySelector('[data-quick-action="cards"]')?.addEventListener("click", () => {
      window.location.href = "cards.html#sb-cards-panel";
    });

    content.querySelector('[data-quick-action="transfers"]')?.addEventListener("click", () => {
      window.location.href = "transfers.html";
    });
  } catch (error) {
    content.innerHTML = messageBox("error", error.message);
  }
}

document.querySelector(".download-btn")?.addEventListener("click", () => {
  requireAuth(() => {
    document.getElementById("sb-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

void loadDashboard();
