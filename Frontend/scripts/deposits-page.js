import {
  apiRequest,
  formatDate,
  formatMoney,
  getSession,
  messageBox,
  mountHeaderAuth,
  openAuthModal,
  requireAuth,
  showToast,
  unwrapResponse
} from "./common.js";

const LANG_KEY = "sbank-lang";

const PRODUCTS = {
  maksad: {
    title: "Вклад «Максад»",
    sub: "Классический депозит на 12 месяцев.",
    min: 1,
    term: 12,
    cur: "TJS",
    body: `<div class="msg info">Подходит тем, кому нужен понятный срок и стабильная ставка.</div><div style="margin-top:14px;line-height:1.7;color:#7184a2"><p>Для открытия понадобится активный счёт клиента и достаточный баланс.</p><p>Кнопка «Открыть вклад» запускает рабочую форму с отправкой в backend API.</p></div>`
  },
  mukhlatnok: {
    title: "Вклад «Мухлатнок»",
    sub: "Повышенная ставка для максимальной доходности.",
    min: 1,
    term: 12,
    cur: "TJS",
    body: `<div class="msg info">Вариант для размещения средств на полный срок.</div><div style="margin-top:14px;line-height:1.7;color:#7184a2"><p>Продукт рассчитан на сумму от 1 сомони.</p><p>При необходимости валюту и срок можно изменить прямо в форме открытия.</p></div>`
  },
  current: {
    title: "Расчётный счёт",
    sub: "Счёт для ежедневных операций, переводов и хранения средств.",
    body: `<div class="msg info">Открытие счёта бесплатно. После создания он появится в блоке клиента ниже.</div><div style="margin-top:14px;line-height:1.7;color:#7184a2"><p>Поддерживаются TJS, USD и RUB.</p><p>Форма отправляет данные в backend endpoint <code>/api/accounts/open</code>.</p></div>`
  },
  dilkhokh: {
    title: "Вклад «Дилхох вақт»",
    sub: "Долгий срок размещения для накоплений.",
    min: 1,
    term: 60,
    cur: "TJS",
    body: `<div class="msg info">Подходит для накоплений с горизонтом до пяти лет.</div><div style="margin-top:14px;line-height:1.7;color:#7184a2"><p>Итоговая ставка в backend определяется сроком размещения.</p><p>Можно использовать любой активный счёт пользователя.</p></div>`
  },
  insurance: {
    title: "Страхование вкладов",
    sub: "Информация о защите средств вкладчиков.",
    body: `<div class="msg ok">На странице отдельно выделен блок надёжности и страхования вкладов.</div><div style="margin-top:14px;line-height:1.7;color:#7184a2"><p>Это повторяет акцент из вашего макета: большой заголовок, иллюстрация щита и короткое объяснение.</p></div>`
  }
};

const TRANSLATIONS = {
  ru: {
    title: "Депозиты и счета — Сомонибанк",
    langLabel: "Рус",
    login: "Вход",
    topNav: ["Частным лицам", "Бизнесу", "Сомонибанк"],
    bottomNav: ["Приложение Somoni", "Карты", "Салом", "Покупка авто", "Somoni Shop", "Переводы", "Депозиты", "Авиабилеты", "Ещё ▾"],
    heroTitle: "Депозиты и счета",
    heroDesc: "Ваши сбережения в надёжных руках — выберите подходящий вклад с выгодной ставкой до 15% годовых",
    heroBtn: "Выбрать вклад",
    products: [
      {
        name: "«Максад»",
        labels: ["Ставка в сом.", "Ставка в дол.", "Срок", "Сумма"],
        values: ["до 11%", "до 5%", "1 год", "от 1 сом."],
        buttons: ["Открыть вклад", "Подробнее"]
      },
      {
        name: "«Мухлатнок»",
        labels: ["Ставка в сом.", "Ставка в дол.", "Срок", "Сумма"],
        values: ["до 15%", "до 7%", "1 год", "от 1 сом."],
        buttons: ["Открыть вклад", "Подробнее"]
      },
      {
        name: "Расчётный счёт",
        labels: ["Открытие", "Валюта", "Доступ", "Сумма"],
        values: ["Бесплатно", "TJS, USD, RUB", "24/7", "от 0 сом."],
        buttons: ["Открыть счёт", "Подробнее"]
      },
      {
        name: "«Дилхох вақт»",
        labels: ["Ставка в сом.", "Ставка в дол.", "Срок", "Сумма"],
        values: ["до 13%", "до 3%", "до 5 лет", "от 1 сом."],
        buttons: ["Открыть вклад", "Подробнее"]
      }
    ],
    dashboardTitle: "Мои вклады и счета",
    dashboardDesc: "После входа здесь отображаются ваши реальные продукты из системы.",
    dashboardActions: ["Войти", "Обновить"],
    bannerTitle: "Ваш вклад в надёжных руках",
    bannerDesc: "Средства клиентов защищены и находятся под контролем банка. Для вас доступны прозрачные условия и управление продуктами онлайн.",
    bannerBtn: "Подробнее",
    faqTitle: "Часто задаваемые вопросы",
    faqs: [
      ["Можно ли открыть вклад онлайн?", "Да. Нажмите «Открыть вклад», войдите в аккаунт, выберите счёт списания, сумму и срок."],
      ["Можно ли управлять операциями по вкладу онлайн?", "Да, после входа можно просматривать свои продукты и обновлять данные на этой странице."],
      ["В каких валютах можно открыть вклад?", "Поддержаны TJS, USD и RUB. Для вкладов лучше выбирать валюту, совпадающую со счётом списания."],
      ["Какова минимальная сумма для открытия вклада?", "Минимальный порог начинается от 1 сомони. В форме можно задать больше, если на счёте хватает средств."],
      ["Что будет, если снять деньги досрочно?", "Условия зависят от выбранного продукта. Кнопка «Подробнее» открывает правила каждого предложения."],
      ["Какой налог удерживается с дохода по вкладу?", "Налоговый режим определяется действующими правилами банка и законодательства."]
    ],
    footerAddress: "ул. Рудаки, 48<br>Душанбе, Таджикистан",
    footerLink: "Филиалы и точки обслуживания",
    footerHeadings: ["900", "Приложения", "Соцсети"]
  },
  en: {
    title: "Deposits and Accounts — Somonibank",
    langLabel: "Eng",
    login: "Login",
    topNav: ["Individuals", "Business", "Somonibank"],
    bottomNav: ["Somoni App", "Cards", "Salom", "Car Purchase", "Somoni Shop", "Transfers", "Deposits", "Air Tickets", "More ▾"],
    heroTitle: "Deposits and Accounts",
    heroDesc: "Keep your savings in safe hands and choose a suitable deposit with an attractive rate up to 15% annually",
    heroBtn: "Choose a deposit",
    products: [
      {
        name: "“Maksad”",
        labels: ["Rate in TJS", "Rate in USD", "Term", "Amount"],
        values: ["up to 11%", "up to 5%", "1 year", "from 1 TJS"],
        buttons: ["Open deposit", "Details"]
      },
      {
        name: "“Mukhlatnok”",
        labels: ["Rate in TJS", "Rate in USD", "Term", "Amount"],
        values: ["up to 15%", "up to 7%", "1 year", "from 1 TJS"],
        buttons: ["Open deposit", "Details"]
      },
      {
        name: "Settlement account",
        labels: ["Opening", "Currency", "Access", "Amount"],
        values: ["Free", "TJS, USD, RUB", "24/7", "from 0 TJS"],
        buttons: ["Open account", "Details"]
      },
      {
        name: "“Dilkhokh Vaqt”",
        labels: ["Rate in TJS", "Rate in USD", "Term", "Amount"],
        values: ["up to 13%", "up to 3%", "up to 5 years", "from 1 TJS"],
        buttons: ["Open deposit", "Details"]
      }
    ],
    dashboardTitle: "My Deposits and Accounts",
    dashboardDesc: "After login, your real products from the system are shown here.",
    dashboardActions: ["Login", "Refresh"],
    bannerTitle: "Your money is in safe hands",
    bannerDesc: "Client funds are protected and managed under transparent banking terms, with online access to key product actions.",
    bannerBtn: "Learn more",
    faqTitle: "Frequently asked questions",
    faqs: [
      ["Can I open a deposit online?", "Yes. Click “Open deposit”, sign in, choose the debit account, amount and term."],
      ["Can I manage deposit operations online?", "Yes, after login you can view your products and refresh the data on this page."],
      ["Which currencies are supported?", "TJS, USD and RUB are supported. It is best to use the same currency as the source account."],
      ["What is the minimum amount?", "The minimum starts from 1 somoni. You can enter a larger amount if the balance is sufficient."],
      ["What happens if I withdraw early?", "Terms depend on the selected product. The “Details” button opens the rules for each offer."],
      ["What tax applies to deposit income?", "Tax treatment depends on current bank rules and applicable law."]
    ],
    footerAddress: "48 Rudaki Ave.<br>Dushanbe, Tajikistan",
    footerLink: "Branches and service points",
    footerHeadings: ["900", "Applications", "Social"]
  },
  tj: {
    title: "Пасандозҳо ва ҳисобҳо — Сомонибонк",
    langLabel: "Тҷ",
    login: "Вуруд",
    topNav: ["Шахсони воқеӣ", "Бизнес", "Сомонибонк"],
    bottomNav: ["Барномаи Somoni", "Кортҳо", "Салом", "Хариди авто", "Somoni Shop", "Интиқолҳо", "Пасандозҳо", "Чиптаҳои ҳавоӣ", "Боз ▾"],
    heroTitle: "Пасандозҳо ва ҳисобҳо",
    heroDesc: "Пасандозҳои худро дар дасти боэътимод нигоҳ доред ва пасандози мувофиқро бо фоизи то 15% солона интихоб кунед",
    heroBtn: "Интихоби пасандоз",
    products: [
      {
        name: "«Максад»",
        labels: ["Фоиз бо сомонӣ", "Фоиз бо доллар", "Муҳлат", "Ҳаҷм"],
        values: ["то 11%", "то 5%", "1 сол", "аз 1 сомонӣ"],
        buttons: ["Кушодани пасандоз", "Муфассал"]
      },
      {
        name: "«Мухлатнок»",
        labels: ["Фоиз бо сомонӣ", "Фоиз бо доллар", "Муҳлат", "Ҳаҷм"],
        values: ["то 15%", "то 7%", "1 сол", "аз 1 сомонӣ"],
        buttons: ["Кушодани пасандоз", "Муфассал"]
      },
      {
        name: "Ҳисоби ҷорӣ",
        labels: ["Кушодан", "Асъор", "Дастрасӣ", "Ҳаҷм"],
        values: ["Ройгон", "TJS, USD, RUB", "24/7", "аз 0 сомонӣ"],
        buttons: ["Кушодани ҳисоб", "Муфассал"]
      },
      {
        name: "«Дилхоҳ вақт»",
        labels: ["Фоиз бо сомонӣ", "Фоиз бо доллар", "Муҳлат", "Ҳаҷм"],
        values: ["то 13%", "то 3%", "то 5 сол", "аз 1 сомонӣ"],
        buttons: ["Кушодани пасандоз", "Муфассал"]
      }
    ],
    dashboardTitle: "Пасандозҳо ва ҳисобҳои ман",
    dashboardDesc: "Баъд аз вуруд маҳсулоти воқеии шумо аз система дар ин ҷо нишон дода мешаванд.",
    dashboardActions: ["Вуруд", "Навсозӣ"],
    bannerTitle: "Пули шумо дар дасти боэътимод аст",
    bannerDesc: "Маблағҳои мизоҷон ҳифз мешаванд ва хизматрасонӣ бо шартҳои шаффофи бонкӣ ва идоракунии онлайн дастрас аст.",
    bannerBtn: "Муфассал",
    faqTitle: "Саволҳои маъмул",
    faqs: [
      ["Оё метавон пасандозро онлайн кушод?", "Бале. «Кушодани пасандоз»-ро зер кунед, ворид шавед ва ҳисоб, маблағ ва муҳлатро интихоб намоед."],
      ["Оё идоракунии пасандоз онлайн имконпазир аст?", "Бале, баъди вуруд шумо метавонед маҳсулоти худро бинед ва маълумотро нав кунед."],
      ["Пасандоз бо кадом асъор кушода мешавад?", "TJS, USD ва RUB дастгирӣ мешаванд. Беҳтараш асъори ҳисоб мувофиқ бошад."],
      ["Ҳадди ақали маблағ чанд аст?", "Ҳадди ақал аз 1 сомонӣ оғоз мешавад. Агар маблағ кофӣ бошад, метавонед бештар ворид кунед."],
      ["Ҳангоми бозпасгирии пеш аз муҳлат чӣ мешавад?", "Шартҳо аз маҳсулоти интихобшуда вобастаанд. Тугмаи «Муфассал» қоидаҳоро нишон медиҳад."],
      ["Аз даромади пасандоз кадом андоз гирифта мешавад?", "Низоми андоз аз қоидаҳои амалкунандаи бонк ва қонунгузорӣ вобаста аст."]
    ],
    footerAddress: "к. Рӯдакӣ, 48<br>Душанбе, Тоҷикистон",
    footerLink: "Филиалҳо ва нуқтаҳои хизматрасонӣ",
    footerHeadings: ["900", "Барномаҳо", "Иҷтимоӣ"]
  }
};

const modal = document.getElementById("productModal");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const modalBody = document.getElementById("modalBody");
const dashboard = document.getElementById("dashboardContent");

mountHeaderAuth();
setupHeaderControls();
applyLanguage(getSavedLanguage());

document.querySelectorAll(".faq-item").forEach((item) => item.querySelector(".faq-question")?.addEventListener("click", () => item.classList.toggle("active")));
document.querySelector('[data-auth-open]')?.addEventListener("click", () => openAuthModal("login", () => void loadDashboard()));
document.querySelector('[data-refresh-dashboard]')?.addEventListener("click", () => void loadDashboard());
document.querySelectorAll("[data-show-details]").forEach((button) => button.addEventListener("click", () => openInfo(button.dataset.showDetails)));
document.querySelectorAll("[data-open-deposit]").forEach((button) => button.addEventListener("click", () => requireAuth(() => openDeposit(button.dataset.openDeposit))));
document.querySelectorAll("[data-open-account]").forEach((button) => button.addEventListener("click", () => requireAuth(() => openAccount())));
modal?.addEventListener("click", (event) => { if (event.target === modal || event.target.closest("[data-close-modal]")) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
window.addEventListener("sbank:session-changed", () => void loadDashboard());

function getSavedLanguage() {
  const saved = localStorage.getItem(LANG_KEY);
  return saved && TRANSLATIONS[saved] ? saved : "ru";
}

function setupHeaderControls() {
  const actions = document.querySelector(".sb-header-actions");
  if (!actions || actions.querySelector(".sb-lang-select")) return;

  const select = document.createElement("select");
  select.className = "sb-lang-select";
  select.innerHTML = `
    <option value="ru">Рус</option>
    <option value="en">Eng</option>
    <option value="tj">Тҷ</option>
  `;
  select.value = getSavedLanguage();
  select.addEventListener("change", () => {
    localStorage.setItem(LANG_KEY, select.value);
    applyLanguage(select.value);
  });

  const loginButton = document.createElement("button");
  loginButton.type = "button";
  loginButton.className = "sb-login-btn";
  loginButton.innerHTML = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 3h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 17l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span>`;
  loginButton.addEventListener("click", () => openAuthModal("login", () => void loadDashboard()));

  actions.append(select, loginButton);
}

function applyLanguage(lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;

  document.documentElement.lang = lang === "tj" ? "tg" : lang;
  document.title = t.title;

  setText(".sb-logo span", "Сомонибанк");
  setTexts(".sb-nav-top a", t.topNav);
  setTexts(".sb-nav-bottom a", t.bottomNav);
  setText(".sb-login-btn span", t.login);
  const langSelect = document.querySelector(".sb-lang-select");
  if (langSelect) langSelect.value = lang;

  setText(".hero-title", t.heroTitle);
  setText(".hero-desc", t.heroDesc);
  setText(".hero-btn", t.heroBtn);

  document.querySelectorAll(".product-card").forEach((card, index) => {
    const item = t.products[index];
    if (!item) return;
    setTextIn(card, ".product-name", item.name);
    const labels = card.querySelectorAll(".metric-label");
    const values = card.querySelectorAll(".metric-value");
    item.labels.forEach((label, labelIndex) => labels[labelIndex] && (labels[labelIndex].textContent = label));
    item.values.forEach((value, valueIndex) => values[valueIndex] && (values[valueIndex].textContent = value));
    const buttons = card.querySelectorAll(".product-actions button");
    item.buttons.forEach((label, buttonIndex) => buttons[buttonIndex] && (buttons[buttonIndex].textContent = label));
  });

  setText(".dashboard-header h2", t.dashboardTitle);
  setText(".dashboard-header p", t.dashboardDesc);
  setTexts(".dashboard-actions button", t.dashboardActions);

  setText(".banner-section h3", t.bannerTitle);
  setText(".banner-section p", t.bannerDesc);
  setText(".banner-section .btn-primary", t.bannerBtn);

  setText(".faq-section .section-title", t.faqTitle);
  document.querySelectorAll(".faq-item").forEach((item, index) => {
    const faq = t.faqs[index];
    if (!faq) return;
    setTextIn(item, ".faq-question span", faq[0]);
    setTextIn(item, ".faq-answer p", faq[1]);
  });

  setHTML(".sb-footer-address", t.footerAddress);
  setText(".sb-footer-link", t.footerLink);
  setTexts(".sb-footer-section h4", t.footerHeadings);
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function setHTML(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.innerHTML = value;
}

function setTexts(selector, values) {
  document.querySelectorAll(selector).forEach((node, index) => {
    if (values[index] !== undefined) node.textContent = values[index];
  });
}

function setTextIn(root, selector, value) {
  const node = root.querySelector(selector);
  if (node) node.textContent = value;
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

function openInfo(key) {
  const item = PRODUCTS[key];
  if (!item) return showToast("Информация скоро появится.");
  openModal(item.title, item.sub, item.body);
}

function openDeposit(key) {
  const item = PRODUCTS[key];
  if (!item) return;
  openModal(
    `${item.title} - открытие`,
    "Заполните форму, чтобы открыть вклад через backend API.",
    `<form id="depositForm"><div id="depositMsg" class="msg info">Загружаем доступные счета пользователя...</div><div class="form" style="margin-top:14px"><div class="field full"><label for="depAccount">Счёт списания</label><select id="depAccount" name="accountId" required disabled><option value="">Загрузка...</option></select></div><div class="field"><label for="depAmount">Сумма</label><input id="depAmount" name="amount" type="number" min="${item.min}" step="0.01" value="${item.min}" required></div><div class="field"><label for="depCur">Валюта</label><select id="depCur" name="currency"><option value="TJS" ${item.cur === "TJS" ? "selected" : ""}>TJS</option><option value="USD">USD</option><option value="RUB">RUB</option></select></div><div class="field full"><label for="depTerm">Срок в месяцах</label><input id="depTerm" name="termMonths" type="number" min="1" max="120" value="${item.term}" required></div></div><div class="modal-actions"><button class="btn-ghost" type="button" data-close-modal>Отмена</button><button class="btn-primary" type="submit">Открыть вклад</button></div></form>`
  );
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
  openModal(
    "Открытие расчётного счёта",
    "Создание счёта выполняется через backend endpoint /api/accounts/open.",
    `<form id="accountForm"><div id="accountMsg" class="msg info">Выберите тип и валюту для нового счёта.</div><div class="form" style="margin-top:14px"><div class="field"><label for="accType">Тип счёта</label><select id="accType" name="type"><option value="Current" selected>Current</option><option value="Savings">Savings</option><option value="Deposit">Deposit</option></select></div><div class="field"><label for="accCur">Валюта</label><select id="accCur" name="currency"><option value="TJS" selected>TJS</option><option value="USD">USD</option><option value="RUB">RUB</option></select></div></div><div class="modal-actions"><button class="btn-ghost" type="button" data-close-modal>Отмена</button><button class="btn-primary" type="submit">Открыть счёт</button></div></form>`
  );
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
    const accounts = (payload.items || payload.Items || []).filter((account) => {
      const status = String(account.status || account.Status || "").toLowerCase();
      return status !== "closed" && status !== "blocked";
    });
    if (!accounts.length) {
      msg.className = "msg err";
      msg.textContent = "Нет активных счетов. Сначала откройте счёт.";
      select.innerHTML = '<option value="">Счета не найдены</option>';
      return;
    }
    select.innerHTML = accounts.map((account) => `<option value="${account.id || account.Id}">${account.accountNumber || account.AccountNumber} · ${account.type || account.Type} · ${formatMoney(account.balance || account.Balance || 0, account.currency || account.Currency)}</option>`).join("");
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
    const [accountsPayload, depositsPayload] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true }),
      apiRequest("/api/deposit/my?page=1&pageSize=20", { auth: true })
    ]);
    const accounts = accountsPayload.items || accountsPayload.Items || [];
    const deposits = depositsPayload.items || depositsPayload.Items || [];
    dashboard.className = "";
    dashboard.innerHTML = `<div class="dash"><section class="dash-box"><h4>Счета</h4><div class="dash-list">${accounts.length ? accounts.map((account) => `<article class="dash-row"><div><p class="dash-t1">${account.accountNumber || account.AccountNumber}</p><p class="dash-t2">${account.type || account.Type} · ${account.currency || account.Currency}</p><p class="dash-t3">Создан: ${formatDate(account.createdAt || account.CreatedAt)}</p></div><div class="pill">${formatMoney(account.balance || account.Balance || 0, account.currency || account.Currency)}</div></article>`).join("") : messageBox("info", "У пользователя пока нет счетов.")}</div></section><section class="dash-box"><h4>Вклады</h4><div class="dash-list">${deposits.length ? deposits.map((deposit) => `<article class="dash-row"><div><p class="dash-t1">${formatMoney(deposit.amount || deposit.Amount || 0, deposit.currency || deposit.Currency)}</p><p class="dash-t2">Ставка: ${deposit.interestRate || deposit.InterestRate}% · Статус: ${deposit.status || deposit.Status}</p><p class="dash-t3">До: ${formatDate(deposit.endDate || deposit.EndDate)}</p></div><div class="pill">+ ${formatMoney(deposit.expectedProfit || deposit.ExpectedProfit || 0, deposit.currency || deposit.Currency)}</div></article>`).join("") : messageBox("info", "Активных вкладов пока нет.")}</div></section></div>`;
  } catch (error) {
    dashboard.className = "msg err";
    dashboard.textContent = error.message;
  }
}

void loadDashboard();
