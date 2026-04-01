import {
  apiRequest,
  formatDate,
  messageBox,
  mountHeaderAuth,
  openAuthModal,
  requireAuth,
  showToast,
  statusClass,
  unwrapResponse
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

document.querySelectorAll(".pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".pill").forEach((item) => item.classList.toggle("active", item === pill));
    showToast(`Фильтр "${pill.textContent}" выбран.`);
  });
});

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("click", () => item.classList.toggle("open"));
});

document.querySelectorAll(".btn-primary").forEach((button) => {
  button.addEventListener("click", () => {
    requireAuth(() => {
      document.getElementById("sb-cards-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});

const page = document.querySelector(".page");
const faqWrap = document.querySelector(".faq-wrap");

const cardsPanel = document.createElement("section");
cardsPanel.className = "sb-dashboard";
cardsPanel.id = "sb-cards-panel";
cardsPanel.innerHTML = `
  <div class="sb-dashboard-head">
    <div>
      <h2 class="sb-dashboard-title">Карты из backend</h2>
      <p class="sb-dashboard-copy">Панель показывает банковские карты пользователя и позволяет выпускать новые через API.</p>
    </div>
    <div class="sb-cta">
      <button class="sb-ghost-btn" type="button" data-sb-cards-action="refresh">Обновить</button>
      <button class="sb-btn" type="button" data-sb-cards-action="auth">Войти</button>
    </div>
  </div>
  <div data-sb-cards-content></div>
`;

page.insertBefore(cardsPanel, faqWrap);

cardsPanel.querySelector('[data-sb-cards-action="auth"]').addEventListener("click", () => openAuthModal("login", loadCardsPanel));
cardsPanel.querySelector('[data-sb-cards-action="refresh"]').addEventListener("click", () => void loadCardsPanel());

async function loadCardsPanel() {
  const content = cardsPanel.querySelector("[data-sb-cards-content]");

  if (!localStorage.getItem("sbank-session")) {
    content.innerHTML = messageBox("info", "Авторизуйтесь, чтобы увидеть свои карты и выпустить новую через backend.");
    return;
  }

  content.innerHTML = messageBox("info", "Загружаем счета и карты...");

  try {
    const [accountsPayload, cardsPayload] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=50", { auth: true }),
      apiRequest("/api/cards/my?page=1&pageSize=50", { auth: true })
    ]);

    const accounts = accountsPayload.items || accountsPayload.Items || [];
    const cards = cardsPayload.items || cardsPayload.Items || [];
    const accountOptions = accounts.map((account) => `
      <option value="${account.id || account.Id}">
        ${(account.accountNumber || account.AccountNumber)} · ${(account.currency || account.Currency)}
      </option>
    `).join("");

    content.innerHTML = `
      <div class="sb-grid">
        <article class="sb-card span-6">
          <h3>Выпустить новую карту</h3>
          ${accounts.length === 0 ? messageBox("info", "Сначала откройте счёт в приложении, после этого можно выпустить карту.") : `
            <form id="sb-card-create-form" class="sb-form-grid">
              <div class="sb-field sb-field-full">
                <label for="sb-card-account">Счёт</label>
                <select id="sb-card-account" name="accountId" required>${accountOptions}</select>
              </div>
              <div class="sb-field">
                <label for="sb-card-holder">Имя держателя</label>
                <input id="sb-card-holder" name="cardHolderName" type="text" required>
              </div>
              <div class="sb-field">
                <label for="sb-card-type">Тип карты</label>
                <select id="sb-card-type" name="type">
                  <option value="Physical">Physical</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>
              <div class="sb-field sb-field-full">
                <button class="sb-btn" type="submit">Выпустить карту</button>
              </div>
            </form>
          `}
        </article>
        <article class="sb-card span-6">
          <h3>Мои карты</h3>
          <div class="sb-list">
            ${cards.length === 0 ? `<div class="sb-empty">У пользователя пока нет карт.</div>` : cards.map((card) => `
              <div class="sb-list-item">
                <div class="sb-list-main">
                  <div class="sb-list-title">${card.type || card.Type} · ${card.maskedNumber || card.MaskedNumber}</div>
                  <div class="sb-list-subtitle">${card.cardHolderName || card.CardHolderName} · ${card.expiryDate || card.ExpiryDate}</div>
                  <div class="sb-list-meta">Создана: ${formatDate(card.createdAt || card.CreatedAt)} · <span class="sb-pill ${statusClass(card.status || card.Status)}">${card.status || card.Status}</span></div>
                </div>
                <div class="sb-list-actions">
                  <button class="sb-inline-btn" type="button" data-card-action="toggle" data-card-id="${card.id || card.Id}" data-card-status="${card.status || card.Status}">${(card.status || card.Status) === "Blocked" ? "Разблокировать" : "Заблокировать"}</button>
                  <button class="sb-inline-btn" type="button" data-card-action="delete" data-card-id="${card.id || card.Id}">Удалить</button>
                </div>
              </div>
            `).join("")}
          </div>
        </article>
      </div>
    `;

    content.querySelector("#sb-card-create-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;

      try {
        const response = unwrapResponse(await apiRequest("/api/cards/create", {
          method: "POST",
          auth: true,
          body: {
            accountId: form.accountId.value,
            cardHolderName: form.cardHolderName.value.trim(),
            type: form.type.value
          }
        }));
        showToast(response.messages[0] || "Карта выпущена.");
        form.reset();
        await loadCardsPanel();
      } catch (error) {
        showToast(error.message);
      }
    });

    content.querySelectorAll("[data-card-action]").forEach((button) => {
      button.addEventListener("click", async () => {
        const cardId = button.dataset.cardId;
        const status = button.dataset.cardStatus;

        try {
          if (button.dataset.cardAction === "delete") {
            const response = unwrapResponse(await apiRequest(`/api/cards/${cardId}`, { method: "DELETE", auth: true }));
            showToast(response.messages[0] || "Карта удалена.");
          } else if (status === "Blocked") {
            const response = unwrapResponse(await apiRequest(`/api/cards/${cardId}/unblock`, { method: "PATCH", auth: true }));
            showToast(response.messages[0] || "Карта разблокирована.");
          } else {
            const response = unwrapResponse(await apiRequest(`/api/cards/${cardId}/block`, { method: "PATCH", auth: true }));
            showToast(response.messages[0] || "Карта заблокирована.");
          }

          await loadCardsPanel();
        } catch (error) {
          showToast(error.message);
        }
      });
    });
  } catch (error) {
    content.innerHTML = messageBox("error", error.message);
  }
}

void loadCardsPanel();
