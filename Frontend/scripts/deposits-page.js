import { apiRequest, formatDate, formatMoney, getSession, messageBox, mountHeaderAuth, openAuthModal, requireAuth, showToast, unwrapResponse } from "./common.js";

const PRODUCTS = {
  maksad: { title: "Вклад «Максад»", sub: "Классический депозит на 12 месяцев.", min: 1, term: 12, cur: "TJS", body: `<div class="msg info">Подходит тем, кому нужен понятный срок и стабильная ставка.</div><div style="margin-top:14px;line-height:1.7;color:#7184a2"><p>Для открытия понадобится активный счёт клиента и достаточный баланс.</p><p>Кнопка «Открыть вклад» запускает рабочую форму с отправкой в backend API.</p></div>` },
  mukhlatnok: { title: "Вклад «Мухлатнок»", sub: "Повышенная ставка для максимальной доходности.", min: 1, term: 12, cur: "TJS", body: `<div class="msg info">Вариант для размещения средств на полный срок.</div><div style="margin-top:14px;line-height:1.7;color:#7184a2"><p>Продукт рассчитан на сумму от 1 сомони.</p><p>При необходимости валюту и срок можно изменить прямо в форме открытия.</p></div>` },
  current: { title: "Расчётный счёт", sub: "Счёт для ежедневных операций, переводов и хранения средств.", body: `<div class="msg info">Открытие счёта бесплатно. После создания он появится в блоке клиента ниже.</div><div style="margin-top:14px;line-height:1.7;color:#7184a2"><p>Поддерживаются TJS, USD и RUB.</p><p>Форма отправляет данные в backend endpoint <code>/api/accounts/open</code>.</p></div>` },
  dilkhokh: { title: "Вклад «Дилхох вакт»", sub: "Долгий срок размещения для накоплений.", min: 1, term: 60, cur: "TJS", body: `<div class="msg info">Подходит для накоплений с горизонтом до пяти лет.</div><div style="margin-top:14px;line-height:1.7;color:#7184a2"><p>Итоговая ставка в backend определяется сроком размещения.</p><p>Можно использовать любой активный счёт пользователя.</p></div>` },
  insurance: { title: "Страхование вкладов", sub: "Информация о защите средств вкладчиков.", body: `<div class="msg ok">На странице отдельно выделен блок надёжности и страхования вкладов.</div><div style="margin-top:14px;line-height:1.7;color:#7184a2"><p>Это повторяет акцент из вашего макета: большой заголовок, иллюстрация щита и короткое объяснение.</p></div>` }
};

const modal = document.getElementById("productModal");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const modalBody = document.getElementById("modalBody");
const dashboard = document.getElementById("dashboardContent");

mountHeaderAuth();

document.querySelectorAll(".faq-item").forEach((item) => item.querySelector(".faq-q")?.addEventListener("click", () => item.classList.toggle("open")));
document.querySelector('[data-auth-open]')?.addEventListener("click", () => openAuthModal("login", () => void loadDashboard()));
document.querySelector('[data-refresh-dashboard]')?.addEventListener("click", () => void loadDashboard());
document.querySelectorAll("[data-show-details]").forEach((button) => button.addEventListener("click", () => openInfo(button.dataset.showDetails)));
document.querySelectorAll("[data-open-deposit]").forEach((button) => button.addEventListener("click", () => requireAuth(() => openDeposit(button.dataset.openDeposit))));
document.querySelectorAll("[data-open-account]").forEach((button) => button.addEventListener("click", () => requireAuth(() => openAccount())));
modal?.addEventListener("click", (event) => { if (event.target === modal || event.target.closest("[data-close-modal]")) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
window.addEventListener("sbank:session-changed", () => void loadDashboard());

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

function openInfo(key) {
  const item = PRODUCTS[key];
  if (!item) return showToast("Информация скоро появится.");
  openModal(item.title, item.sub, item.body);
}

function openDeposit(key) {
  const item = PRODUCTS[key];
  if (!item) return;
  openModal(`${item.title} - открытие`, "Заполните форму, чтобы открыть вклад через backend API.", `<form id="depositForm"><div id="depositMsg" class="msg info">Загружаем доступные счета пользователя...</div><div class="form" style="margin-top:14px"><div class="field full"><label for="depAccount">Счёт списания</label><select id="depAccount" name="accountId" required disabled><option value="">Загрузка...</option></select></div><div class="field"><label for="depAmount">Сумма</label><input id="depAmount" name="amount" type="number" min="${item.min}" step="0.01" value="${item.min}" required></div><div class="field"><label for="depCur">Валюта</label><select id="depCur" name="currency"><option value="TJS" ${item.cur === "TJS" ? "selected" : ""}>TJS</option><option value="USD">USD</option><option value="RUB">RUB</option></select></div><div class="field full"><label for="depTerm">Срок в месяцах</label><input id="depTerm" name="termMonths" type="number" min="1" max="120" value="${item.term}" required></div></div><div class="modal-actions"><button class="ghost" type="button" data-close-modal>Отмена</button><button class="btn" type="submit">Открыть вклад</button></div></form>`);
  const form = document.getElementById("depositForm");
  const msg = document.getElementById("depositMsg");
  const select = document.getElementById("depAccount");
  loadAccounts(select, msg);
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    msg.className = "msg info";
    msg.textContent = "Открываем вклад...";
    try {
      const res = unwrapResponse(await apiRequest("/api/deposit", { method: "POST", auth: true, body: { accountId: form.accountId.value, amount: Number(form.amount.value), termMonths: Number(form.termMonths.value), currency: form.currency.value } }));
      msg.className = "msg ok";
      msg.textContent = res.messages[0] || "Вклад успешно открыт.";
      showToast("Вклад создан.");
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

function openAccount() {
  openModal("Открытие расчётного счёта", "Создание счёта выполняется через backend endpoint /api/accounts/open.", `<form id="accountForm"><div id="accountMsg" class="msg info">Выберите тип и валюту для нового счёта.</div><div class="form" style="margin-top:14px"><div class="field"><label for="accType">Тип счёта</label><select id="accType" name="type"><option value="Current" selected>Current</option><option value="Savings">Savings</option><option value="Deposit">Deposit</option></select></div><div class="field"><label for="accCur">Валюта</label><select id="accCur" name="currency"><option value="TJS" selected>TJS</option><option value="USD">USD</option><option value="RUB">RUB</option></select></div></div><div class="modal-actions"><button class="ghost" type="button" data-close-modal>Отмена</button><button class="btn" type="submit">Открыть счёт</button></div></form>`);
  const form = document.getElementById("accountForm");
  const msg = document.getElementById("accountMsg");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    msg.className = "msg info";
    msg.textContent = "Открываем счёт...";
    try {
      const res = unwrapResponse(await apiRequest("/api/accounts/open", { method: "POST", auth: true, body: { type: form.type.value, currency: form.currency.value } }));
      const acc = res.data || {};
      msg.className = "msg ok";
      msg.textContent = `${res.messages[0] || "Счёт открыт."} ${acc.accountNumber || acc.AccountNumber ? `Номер: ${acc.accountNumber || acc.AccountNumber}` : ""}`.trim();
      showToast("Счёт создан.");
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
    msg.textContent = "Счета загружены. Можно отправлять заявку.";
  } catch (error) {
    msg.className = "msg err";
    msg.textContent = error.message;
    select.innerHTML = '<option value="">Ошибка загрузки</option>';
  }
}

async function loadDashboard() {
  if (!getSession()?.token) {
    dashboard.className = "msg info";
    dashboard.innerHTML = "Авторизуйтесь, чтобы увидеть свои счета и вклады.";
    return;
  }
  dashboard.className = "msg info";
  dashboard.innerHTML = "Загружаем данные клиента...";
  try {
    const [accountsPayload, depositsPayload] = await Promise.all([apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true }), apiRequest("/api/deposit/my?page=1&pageSize=20", { auth: true })]);
    const accounts = accountsPayload.items || accountsPayload.Items || [];
    const deposits = depositsPayload.items || depositsPayload.Items || [];
    dashboard.className = "";
    dashboard.innerHTML = `<div class="dash"><section class="box"><h4>Счета</h4><div class="list">${accounts.length ? accounts.map((a) => `<article class="row"><div><p class="t1">${a.accountNumber || a.AccountNumber}</p><p class="t2">${a.type || a.Type} · ${a.currency || a.Currency}</p><p class="t3">Создан: ${formatDate(a.createdAt || a.CreatedAt)}</p></div><div class="pill">${formatMoney(a.balance || a.Balance || 0, a.currency || a.Currency)}</div></article>`).join("") : messageBox("info", "У пользователя пока нет счетов.")}</div></section><section class="box"><h4>Вклады</h4><div class="list">${deposits.length ? deposits.map((d) => `<article class="row"><div><p class="t1">${formatMoney(d.amount || d.Amount || 0, d.currency || d.Currency)}</p><p class="t2">Ставка: ${d.interestRate || d.InterestRate}% · Статус: ${d.status || d.Status}</p><p class="t3">До: ${formatDate(d.endDate || d.EndDate)}</p></div><div class="pill">+ ${formatMoney(d.expectedProfit || d.ExpectedProfit || 0, d.currency || d.Currency)}</div></article>`).join("") : messageBox("info", "Активных вкладов пока нет.")}</div></section></div>`;
  } catch (error) {
    dashboard.className = "msg err";
    dashboard.textContent = error.message;
  }
}

void loadDashboard();
