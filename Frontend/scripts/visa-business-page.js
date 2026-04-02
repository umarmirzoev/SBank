import { apiRequest, formatDate, formatMoney, getSession, messageBox, mountHeaderAuth, openAuthModal, requireAuth, showToast, unwrapResponse } from "./common.js";

const TARIFFS = {
  services: [
    ["Срок", "До 5 лет"],
    ["Валюта", "С / € / $"],
    ["Стоимость", "Бесплатно — первая карта. Выпуск дополнительной карты — 100 сомони"],
    ["Обслуживание", "Первый год — бесплатно. Последующие годы — бесплатно при оплатах от 500 сомони в месяц."]
  ],
  operations: [
    ["Переводы", "Переводите средства с расчётного счёта компании на карту и обратно в рамках доступных операций банка."],
    ["Выписки", "Скачивание реквизитов и выписок доступно в интернет-банке и кабинете клиента."],
    ["Управление", "Блокировка, перевыпуск и контроль операций доступны после авторизации."]
  ],
  limits: [
    ["Покупки", "Лимиты на покупки и снятие задаются правилами банка и могут уточняться для компании индивидуально."],
    ["Снятие наличных", "Доступно круглосуточно в пределах установленных ограничений."],
    ["Безопасность", "Для снижения риска операции могут подтверждаться дополнительными проверками."]
  ]
};

const modal = document.getElementById("issueModal");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const modalBody = document.getElementById("modalBody");
const dashboard = document.getElementById("dashboardContent");
const modeButtons = document.querySelectorAll("[data-apply-mode]");

mountHeaderAuth();
renderTariffTable("services");

document.querySelectorAll(".tab").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("active", item === button));
  renderTariffTable(button.dataset.tab);
}));

document.querySelectorAll(".faq-item").forEach((item) => item.querySelector(".faq-q")?.addEventListener("click", () => item.classList.toggle("open")));
document.querySelectorAll(".acc-item").forEach((item) => item.querySelector(".acc-btn")?.addEventListener("click", () => {
  const isOpen = item.classList.contains("open");
  document.querySelectorAll(".acc-item").forEach((entry) => entry.classList.remove("open"));
  if (!isOpen) item.classList.add("open");
}));

modeButtons.forEach((button) => button.addEventListener("click", () => {
  modeButtons.forEach((item) => item.classList.toggle("active", item === button));
  if (button.dataset.applyMode === "client") {
    showToast("Режим клиента активирован.");
  } else {
    openGuestModal();
  }
}));

document.querySelectorAll("[data-open-issue]").forEach((button) => button.addEventListener("click", () => requireAuth(() => openIssueModal())));
document.querySelector('[data-auth-open]')?.addEventListener("click", () => openAuthModal("login", () => void loadDashboard()));
document.querySelector('[data-refresh-dashboard]')?.addEventListener("click", () => void loadDashboard());
modal?.addEventListener("click", (event) => { if (event.target === modal || event.target.closest("[data-close-modal]")) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
window.addEventListener("sbank:session-changed", () => void loadDashboard());

function renderTariffTable(key) {
  const rows = TARIFFS[key] || [];
  document.getElementById("tariffTable").innerHTML = rows.map(([name, value]) => `<div class="tr"><div class="td1">${name}</div><div class="td2">${value}</div></div>`).join("");
}

function openModal(title, sub, body) {
  modalTitle.textContent = title;
  modalSub.textContent = sub;
  modalBody.innerHTML = body;
  modal.classList.add("open");
}

function closeModal() {
  modal.classList.remove("open");
  modalBody.innerHTML = "";
}

function openGuestModal() {
  openModal("Заявка для нового клиента", "Оставьте контакты, и банк свяжется с вами.", `<form id="guestForm"><div id="guestMsg" class="msg info">Заполните данные для обратной связи.</div><div class="form" style="margin-top:14px"><div class="field"><label for="guestName">Имя компании</label><input id="guestName" name="company" type="text" required></div><div class="field"><label for="guestPhone">Телефон</label><input id="guestPhone" name="phone" type="text" required></div><div class="field full"><label for="guestEmail">Email</label><input id="guestEmail" name="email" type="email" required></div></div><div class="modal-actions"><button class="ghost" type="button" data-close-modal>Отмена</button><button class="btn" type="submit">Отправить</button></div></form>`);
  document.getElementById("guestForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const msg = document.getElementById("guestMsg");
    msg.className = "msg ok";
    msg.textContent = "Заявка сохранена. Мы свяжемся с вами.";
    showToast("Контакты отправлены.");
    setTimeout(closeModal, 900);
  });
}

function openIssueModal() {
  openModal("Получить Visa Business", "Выберите счёт и отправьте заявку на выпуск карты.", `<form id="issueForm"><div id="issueMsg" class="msg info">Загружаем активные счета пользователя...</div><div class="form" style="margin-top:14px"><div class="field full"><label for="cardAccount">Счёт</label><select id="cardAccount" name="accountId" required disabled><option value="">Загрузка...</option></select></div><div class="field"><label for="cardHolder">Имя держателя</label><input id="cardHolder" name="cardHolderName" type="text" required></div><div class="field"><label for="cardType">Тип карты</label><select id="cardType" name="type"><option value="Physical" selected>Physical</option></select></div></div><div class="modal-actions"><button class="ghost" type="button" data-close-modal>Отмена</button><button class="btn" type="submit">Получить карту</button></div></form>`);
  const form = document.getElementById("issueForm");
  const msg = document.getElementById("issueMsg");
  const select = document.getElementById("cardAccount");
  loadAccounts(select, msg);
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    msg.className = "msg info";
    msg.textContent = "Создаём карту...";
    try {
      const res = unwrapResponse(await apiRequest("/api/cards/create", { method: "POST", auth: true, body: { accountId: form.accountId.value, cardHolderName: form.cardHolderName.value.trim(), type: form.type.value } }));
      msg.className = "msg ok";
      msg.textContent = res.messages[0] || "Карта выпущена.";
      showToast("Карта создана.");
      await loadDashboard();
      setTimeout(closeModal, 900);
    } catch (error) {
      msg.className = "msg err";
      msg.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });
}

async function loadAccounts(select, msg) {
  if (!select || !msg) return;
  try {
    const payload = await apiRequest("/api/accounts/my?page=1&pageSize=100", { auth: true });
    const accounts = (payload.items || payload.Items || []).filter((a) => {
      const status = String(a.status || a.Status || "").toLowerCase();
      return status !== "closed" && status !== "blocked";
    });
    if (!accounts.length) {
      msg.className = "msg err";
      msg.textContent = "Нет активных счетов. Сначала откройте счёт.";
      select.innerHTML = '<option value="">Счета не найдены</option>';
      return;
    }
    select.innerHTML = accounts.map((a) => `<option value="${a.id || a.Id}">${a.accountNumber || a.AccountNumber} · ${a.type || a.Type} · ${formatMoney(a.balance || a.Balance || 0, a.currency || a.Currency)}</option>`).join("");
    select.disabled = false;
    msg.className = "msg ok";
    msg.textContent = "Счета загружены. Можно выпускать карту.";
  } catch (error) {
    msg.className = "msg err";
    msg.textContent = error.message;
    select.innerHTML = '<option value="">Ошибка загрузки</option>';
  }
}

async function loadDashboard() {
  if (!getSession()?.token) {
    dashboard.className = "msg info";
    dashboard.innerHTML = "Авторизуйтесь, чтобы увидеть счета и карты.";
    return;
  }
  dashboard.className = "msg info";
  dashboard.innerHTML = "Загружаем данные клиента...";
  try {
    const [accountsPayload, cardsPayload] = await Promise.all([apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true }), apiRequest("/api/cards/my?page=1&pageSize=20", { auth: true })]);
    const accounts = accountsPayload.items || accountsPayload.Items || [];
    const cards = cardsPayload.items || cardsPayload.Items || [];
    dashboard.className = "";
    dashboard.innerHTML = `<div class="dash"><section class="box"><h4>Счета</h4><div class="list">${accounts.length ? accounts.map((a) => `<article class="row"><div><p class="t1">${a.accountNumber || a.AccountNumber}</p><p class="t2">${a.type || a.Type} · ${a.currency || a.Currency}</p><p class="t3">Создан: ${formatDate(a.createdAt || a.CreatedAt)}</p></div><div class="pill">${formatMoney(a.balance || a.Balance || 0, a.currency || a.Currency)}</div></article>`).join("") : messageBox("info", "У пользователя пока нет счетов.")}</div></section><section class="box"><h4>Карты</h4><div class="list">${cards.length ? cards.map((c) => `<article class="row"><div><p class="t1">${c.maskedNumber || c.MaskedNumber}</p><p class="t2">${c.cardHolderName || c.CardHolderName} · ${c.type || c.Type}</p><p class="t3">До: ${c.expiryDate || c.ExpiryDate} · Создана: ${formatDate(c.createdAt || c.CreatedAt)}</p></div><div class="pill">${c.status || c.Status}</div></article>`).join("") : messageBox("info", "У пользователя пока нет карт.")}</div></section></div>`;
  } catch (error) {
    dashboard.className = "msg err";
    dashboard.textContent = error.message;
  }
}

void loadDashboard();
