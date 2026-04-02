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

const TARIFFS = {
  ru: {
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
  },
  en: {
    services: [
      ["Term", "Up to 5 years"],
      ["Currency", "TJS / € / $"],
      ["Cost", "Free — first card. Additional card issue — 100 TJS"],
      ["Service", "First year is free. Following years are free if monthly payments exceed 500 TJS."]
    ],
    operations: [
      ["Transfers", "Transfer funds between the company settlement account and the card within available banking operations."],
      ["Statements", "Account details and statements can be downloaded in internet banking and the customer cabinet."],
      ["Control", "Card blocking, reissue and operation control are available after login."]
    ],
    limits: [
      ["Purchases", "Purchase and cash limits are defined by the bank and may be adjusted individually for the company."],
      ["Cash withdrawal", "Available 24/7 within established limits."],
      ["Security", "Additional checks may be used to reduce transaction risks."]
    ]
  },
  tj: {
    services: [
      ["Муҳлат", "То 5 сол"],
      ["Асъор", "TJS / € / $"],
      ["Арзиш", "Ройгон — корти аввал. Барориши корти иловагӣ — 100 сомонӣ"],
      ["Хизматрасонӣ", "Соли аввал — ройгон. Солҳои баъдӣ — ройгон ҳангоми пардохт аз 500 сомонӣ дар як моҳ."]
    ],
    operations: [
      ["Интиқолҳо", "Маблағро байни ҳисоби ҷории ширкат ва корт дар доираи хизматрасониҳои бонкӣ интиқол диҳед."],
      ["Иқтибосҳо", "Боргирии реквизитҳо ва иқтибосҳо дар интернет-банк ва кабинети муштарӣ дастрас аст."],
      ["Идоракунӣ", "Бастан, аз нав баровардан ва назорати амалиёт баъди вуруд дастрас аст."]
    ],
    limits: [
      ["Харидҳо", "Лимитҳо барои харид ва гирифтани нақд тибқи қоидаҳои бонк муқаррар мешаванд."],
      ["Гирифтани нақд", "Шабонарӯзӣ дар доираи маҳдудиятҳои муқарраршуда дастрас аст."],
      ["Амният", "Барои коҳиши хавф амалиёт метавонад бо санҷишҳои иловагӣ тасдиқ шавад."]
    ]
  }
};

const TRANSLATIONS = {
  ru: {
    title: "Visa Business — Сомонибанк",
    langLabel: "Рус",
    login: "Вход",
    topNav: ["Частным лицам", "Бизнесу", "Сомонибанк"],
    bottomNav: ["Somonibank Business", "Зарплатный проект", "Финансирование", "Продажи в рассрочку", "Эквайринг", "Расчётный счёт", "Visa Business", "Переводы"],
    heroTitle: "SomoniBank Visa Business",
    heroDesc: "Корпоративная карта для хозяйственных, командировочных и представительских расходов с круглосуточным доступом",
    heroBtn: "Получить карту",
    features: [
      ["Мультивалютный счёт", "Открывайте счета в сомони, долларах и евро"],
      ["Бесплатный выпуск", "Получите бесплатную карту и обслуживание первый год уже сейчас"],
      ["Круглосуточный доступ", "Доступ к средствам в режиме 24/7/365"]
    ],
    sectionTitle: "Тарифы и условия",
    tariffTabs: ["Услуги", "Операции", "Суточные лимиты"],
    applyTitle: "Заявка на карту",
    applyDesc: "Если вы клиент интернет-банка, войдите и оформите карту. Если нет, оставьте контакты, и мы свяжемся.",
    applyCards: [
      ["Получите первую карту бесплатно", "Авторизуйтесь в интернет-банке Сомонибонк Business и получите карту"],
      ["Ещё не клиент?", "Оставьте контакты, и менеджер банка поможет подключиться и оформить карту"]
    ],
    applyButtons: ["Перейти", "Оставить заявку"],
    benefits: [
      ["Переводы", "Переводите деньги легко и быстро со своего расчётного счёта на карту"],
      ["Удобное управление", "Управляйте картой в интернет-банке с возможностью менять PIN-код"],
      ["Выписки и реквизиты", "Скачивайте реквизиты и выписки с вашего юридического счёта в два счёта"],
      ["Безопасность", "Все ваши операции по карте защищены"]
    ],
    docsTitle: "Документы и тарифы",
    docsDesc: "Более подробную информацию об этой карте вы можете увидеть здесь.",
    docButtons: ["Дополнительная информация", "Архив юридических документов"],
    faqTitle: "Часто задаваемые вопросы",
    faqs: [
      ["Как и кому открыть карту SomoniBank Visa Business?", "Карта оформляется на активный счёт клиента банка. Нажмите «Получить карту», авторизуйтесь и отправьте заявку."],
      ["Какие документы нужны для открытия карты?", "Для действующего клиента достаточно активного счёта. Новым клиентам нужно оставить контактные данные."],
      ["Где я могу получить карту?", "После выпуска банк сообщит удобную точку получения карты."],
      ["Могу ли я привязать карту к приложению?", "Да, после входа в кабинет карта появится в списке и будет доступна для операций."],
      ["Как пополнить карту?", "Карту можно пополнять с расчётного счёта компании для корпоративных расходов."],
      ["За какой срок можно получить карту?", "Срок действия карты до 5 лет. Выпуск выполняется после обработки заявки."]
    ],
    dashboardTitle: "Мои счета и карты",
    dashboardDesc: "После входа здесь отображаются реальные бизнес-счета и выпущенные карты.",
    dashboardActions: ["Войти", "Обновить"],
    footerAddress: "ул. Рудаки, 48<br>Душанбе, Таджикистан",
    footerLink: "Филиалы и точки обслуживания",
    footerHeadings: ["900", "Приложения", "Соцсети"]
  },
  en: {
    title: "Visa Business — Somonibank",
    langLabel: "Eng",
    login: "Login",
    topNav: ["Individuals", "Business", "Somonibank"],
    bottomNav: ["Somonibank Business", "Payroll Project", "Financing", "Installment Sales", "Acquiring", "Settlement Account", "Visa Business", "Transfers"],
    heroTitle: "SomoniBank Visa Business",
    heroDesc: "Corporate card for business, travel and representative expenses with round-the-clock access",
    heroBtn: "Get card",
    features: [
      ["Multi-currency account", "Open accounts in somoni, dollars and euro"],
      ["Free issue", "Get a free card with first-year service at no charge"],
      ["24/7 access", "Access your funds in 24/7/365 mode"]
    ],
    sectionTitle: "Tariffs and terms",
    tariffTabs: ["Services", "Operations", "Daily limits"],
    applyTitle: "Card application",
    applyDesc: "If you already use internet banking, sign in and issue the card. Otherwise leave your contact details and we will call you back.",
    applyCards: [
      ["Get your first card for free", "Sign in to Somonibank Business internet banking and request your card"],
      ["Not a client yet?", "Leave your contact details and a manager will help you connect and issue the card"]
    ],
    applyButtons: ["Proceed", "Send request"],
    benefits: [
      ["Transfers", "Send money quickly from your settlement account to the card"],
      ["Easy management", "Manage the card in internet banking and change the PIN code"],
      ["Statements and details", "Download account details and statements for your legal account"],
      ["Security", "All card operations are protected"]
    ],
    docsTitle: "Documents and tariffs",
    docsDesc: "You can find more detailed information about this card here.",
    docButtons: ["Additional information", "Legal documents archive"],
    faqTitle: "Frequently asked questions",
    faqs: [
      ["How can I open a SomoniBank Visa Business card?", "The card is issued for an active client account. Click “Get card”, sign in and submit the request."],
      ["What documents are needed?", "Existing clients only need an active account. New clients should leave their contact details."],
      ["Where can I receive the card?", "After issuance the bank will inform you about the convenient pick-up location."],
      ["Can I link the card to the app?", "Yes, after login the card appears in the cabinet and becomes available for operations."],
      ["How can I top up the card?", "The card can be funded from the company settlement account for corporate expenses."],
      ["How long does it take to receive the card?", "The card term is up to 5 years. Issuance starts after the request is processed."]
    ],
    dashboardTitle: "My Accounts and Cards",
    dashboardDesc: "After login, real business accounts and issued cards are shown here.",
    dashboardActions: ["Login", "Refresh"],
    footerAddress: "48 Rudaki Ave.<br>Dushanbe, Tajikistan",
    footerLink: "Branches and service points",
    footerHeadings: ["900", "Applications", "Social"]
  },
  tj: {
    title: "Visa Business — Сомонибонк",
    langLabel: "Тҷ",
    login: "Вуруд",
    topNav: ["Шахсони воқеӣ", "Бизнес", "Сомонибонк"],
    bottomNav: ["Somonibank Business", "Лоиҳаи музд", "Маблағгузорӣ", "Фурӯш бо муҳлат", "Эквайринг", "Ҳисоби ҷорӣ", "Visa Business", "Интиқолҳо"],
    heroTitle: "SomoniBank Visa Business",
    heroDesc: "Корти корпоративӣ барои хароҷоти хоҷагӣ, хизматӣ ва намояндагӣ бо дастрасии шабонарӯзӣ",
    heroBtn: "Гирифтани корт",
    features: [
      ["Ҳисоби бисёрасъора", "Ҳисобҳоро бо сомонӣ, доллар ва евро кушоед"],
      ["Барориши ройгон", "Корти ройгон гиред ва соли аввал хизматрасонӣ низ ройгон аст"],
      ["Дастрасии шабонарӯзӣ", "Дастрасӣ ба маблағҳо 24/7/365"]
    ],
    sectionTitle: "Тарифҳо ва шартҳо",
    tariffTabs: ["Хизматҳо", "Амалиёт", "Лимити рӯзона"],
    applyTitle: "Дархост барои корт",
    applyDesc: "Агар шумо муштарии интернет-банк бошед, ворид шавед ва кортро фармоиш диҳед. Агар не, тамосро гузоред ва мо бо шумо дар тамос мешавем.",
    applyCards: [
      ["Корти аввалро ройгон гиред", "Ба Somonibank Business ворид шавед ва барои корт дархост фиристед"],
      ["Ҳоло муштарӣ нестед?", "Маълумоти тамосро гузоред ва менеҷер ба шумо барои пайвастшавӣ кӯмак мекунад"]
    ],
    applyButtons: ["Гузариш", "Фиристодани дархост"],
    benefits: [
      ["Интиқолҳо", "Пулро зуд аз ҳисоби ҷории худ ба корт интиқол диҳед"],
      ["Идоракунии осон", "Кортро дар интернет-банк идора кунед ва PIN-кодро иваз намоед"],
      ["Иқтибос ва реквизитҳо", "Реквизитҳо ва иқтибосҳоро барои ҳисоби ҳуқуқӣ боргирӣ намоед"],
      ["Амният", "Ҳама амалиётҳои корти шумо муҳофизат шудаанд"]
    ],
    docsTitle: "Ҳуҷҷатҳо ва тарифҳо",
    docsDesc: "Маълумоти муфассалтарро дар бораи ин корт дар ин ҷо бинед.",
    docButtons: ["Маълумоти иловагӣ", "Бойгонии ҳуҷҷатҳои ҳуқуқӣ"],
    faqTitle: "Саволҳои маъмул",
    faqs: [
      ["Кортро чӣ гуна кушодан мумкин аст?", "Корт ба ҳисоби фаъоли муштарии бонк бароварда мешавад. «Гирифтани корт»-ро зер кунед, ворид шавед ва дархост фиристед."],
      ["Кадом ҳуҷҷатҳо лозиманд?", "Барои муштарии амалкунанда ҳисоби фаъол кофист. Муштариёни нав бояд маълумоти тамос гузоранд."],
      ["Кортро аз куҷо мегирам?", "Баъд аз барориш бонк нуқтаи мувофиқи гирифтани кортро хабар медиҳад."],
      ["Оё кортро ба барнома пайваст кардан мумкин аст?", "Бале, баъди вуруд корт дар кабинет пайдо мешавад ва барои амалиёт дастрас мегардад."],
      ["Кортро чӣ тавр пур кунам?", "Кортро аз ҳисоби ҷории ширкат барои хароҷоти корпоративӣ пур кардан мумкин аст."],
      ["Дар кадом муҳлат кортро мегирам?", "Муҳлати амал то 5 сол аст. Барориш баъд аз коркарди дархост оғоз мешавад."]
    ],
    dashboardTitle: "Ҳисобҳо ва кортҳои ман",
    dashboardDesc: "Баъд аз вуруд ҳисобҳои воқеии бизнес ва кортҳои баровардашуда дар ин ҷо нишон дода мешаванд.",
    dashboardActions: ["Вуруд", "Навсозӣ"],
    footerAddress: "к. Рӯдакӣ, 48<br>Душанбе, Тоҷикистон",
    footerLink: "Филиалҳо ва нуқтаҳои хизматрасонӣ",
    footerHeadings: ["900", "Барномаҳо", "Иҷтимоӣ"]
  }
};

const modal = document.getElementById("issueModal");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const modalBody = document.getElementById("modalBody");
const dashboard = document.getElementById("dashboardContent");
const modeButtons = document.querySelectorAll("[data-apply-mode]");

mountHeaderAuth();
setupHeaderControls();
applyLanguage(getSavedLanguage());
renderTariffTable("services");

document.querySelectorAll(".tab").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("active", item === button));
  renderTariffTable(button.dataset.tab);
}));

document.querySelectorAll(".faq-item").forEach((item) => item.querySelector(".faq-question")?.addEventListener("click", () => item.classList.toggle("active")));
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

  document.querySelectorAll(".feature-card").forEach((card, index) => {
    const item = t.features[index];
    if (!item) return;
    setTextIn(card, "h3", item[0]);
    setTextIn(card, "p", item[1]);
  });

  setText(".tariff-section .section-title", t.sectionTitle);
  setTexts(".tariff-tabs .tab", t.tariffTabs);

  setText(".apply-section h2", t.applyTitle);
  setText(".apply-section > p", t.applyDesc);
  document.querySelectorAll(".apply-card").forEach((card, index) => {
    const item = t.applyCards[index];
    if (!item) return;
    setTextIn(card, "h3", item[0]);
    setTextIn(card, "p", item[1]);
    setTextIn(card, "button", t.applyButtons[index]);
  });

  document.querySelectorAll(".benefit-card").forEach((card, index) => {
    const item = t.benefits[index];
    if (!item) return;
    setTextIn(card, "h3", item[0]);
    setTextIn(card, "p", item[1]);
  });

  setText(".docs-content h2", t.docsTitle);
  setText(".docs-content > p", t.docsDesc);
  setTexts(".doc-btn", t.docButtons);

  setText(".faq-section .section-title", t.faqTitle);
  document.querySelectorAll(".faq-item").forEach((item, index) => {
    const faq = t.faqs[index];
    if (!faq) return;
    setTextIn(item, ".faq-question span", faq[0]);
    setTextIn(item, ".faq-answer p", faq[1]);
  });

  setText(".dashboard-header h2", t.dashboardTitle);
  setText(".dashboard-header p", t.dashboardDesc);
  setTexts(".dashboard-actions button", t.dashboardActions);

  setHTML(".sb-footer-address", t.footerAddress);
  setText(".sb-footer-link", t.footerLink);
  setTexts(".sb-footer-section h4", t.footerHeadings);

  renderTariffTable(document.querySelector(".tab.active")?.dataset.tab || "services");
}

function renderTariffTable(key) {
  const lang = getSavedLanguage();
  const rows = (TARIFFS[lang] || TARIFFS.ru)[key] || [];
  const table = document.getElementById("tariffTable");
  if (!table) return;
  table.innerHTML = rows.map(([name, value]) => `<div class="tariff-row"><div class="td1">${name}</div><div class="td2">${value}</div></div>`).join("");
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

function openGuestModal() {
  openModal(
    "Заявка для нового клиента",
    "Оставьте контакты, и банк свяжется с вами.",
    `<form id="guestForm"><div id="guestMsg" class="msg info">Заполните данные для обратной связи.</div><div class="form" style="margin-top:14px"><div class="field"><label for="guestName">Имя компании</label><input id="guestName" name="company" type="text" required></div><div class="field"><label for="guestPhone">Телефон</label><input id="guestPhone" name="phone" type="text" required></div><div class="field full"><label for="guestEmail">Email</label><input id="guestEmail" name="email" type="email" required></div></div><div class="modal-actions"><button class="btn-ghost" type="button" data-close-modal>Отмена</button><button class="btn-primary" type="submit">Отправить</button></div></form>`
  );
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
  openModal(
    "Получить Visa Business",
    "Выберите счёт и отправьте заявку на выпуск карты.",
    `<form id="issueForm"><div id="issueMsg" class="msg info">Загружаем активные счета пользователя...</div><div class="form" style="margin-top:14px"><div class="field full"><label for="cardAccount">Счёт</label><select id="cardAccount" name="accountId" required disabled><option value="">Загрузка...</option></select></div><div class="field"><label for="cardHolder">Имя держателя</label><input id="cardHolder" name="cardHolderName" type="text" required></div><div class="field"><label for="cardType">Тип карты</label><select id="cardType" name="type"><option value="Physical" selected>Physical</option></select></div></div><div class="modal-actions"><button class="btn-ghost" type="button" data-close-modal>Отмена</button><button class="btn-primary" type="submit">Получить карту</button></div></form>`
  );
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
    const [accountsPayload, cardsPayload] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true }),
      apiRequest("/api/cards/my?page=1&pageSize=20", { auth: true })
    ]);
    const accounts = accountsPayload.items || accountsPayload.Items || [];
    const cards = cardsPayload.items || cardsPayload.Items || [];
    dashboard.className = "";
    dashboard.innerHTML = `<div class="dash"><section class="dash-box"><h4>Счета</h4><div class="dash-list">${accounts.length ? accounts.map((account) => `<article class="dash-row"><div><p class="dash-t1">${account.accountNumber || account.AccountNumber}</p><p class="dash-t2">${account.type || account.Type} · ${account.currency || account.Currency}</p><p class="dash-t3">Создан: ${formatDate(account.createdAt || account.CreatedAt)}</p></div><div class="pill">${formatMoney(account.balance || account.Balance || 0, account.currency || account.Currency)}</div></article>`).join("") : messageBox("info", "У пользователя пока нет счетов.")}</div></section><section class="dash-box"><h4>Карты</h4><div class="dash-list">${cards.length ? cards.map((card) => `<article class="dash-row"><div><p class="dash-t1">${card.maskedNumber || card.MaskedNumber}</p><p class="dash-t2">${card.cardHolderName || card.CardHolderName} · ${card.type || card.Type}</p><p class="dash-t3">До: ${card.expiryDate || card.ExpiryDate} · Создана: ${formatDate(card.createdAt || card.CreatedAt)}</p></div><div class="pill">${card.status || card.Status}</div></article>`).join("") : messageBox("info", "У пользователя пока нет карт.")}</div></section></div>`;
  } catch (error) {
    dashboard.className = "msg err";
    dashboard.textContent = error.message;
  }
}

void loadDashboard();
