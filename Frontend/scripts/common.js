const STORAGE_KEY = "sbank-session";

const LANG_KEY = "sbank-lang";
const THEME_KEY = "sbank-theme";

let authModal;
let authSuccessHandler = null;
let globalUiInitialized = false;

const PAGE_TITLES = {
  "index.html": { ru: "Сомонибанк — Главная", en: "Somonibank — Home", tj: "Сомонибонк — Асосӣ" },
  "business.html": { ru: "Бизнесу — Сомонибанк", en: "Business — Somonibank", tj: "Барои бизнес — Сомонибонк" },
  "addresses.html": { ru: "Адреса и банкоматы — Сомонибанк", en: "Branches and ATMs — Somonibank", tj: "Суроғаҳо ва банкоматҳо — Сомонибонк" },
  "auto.html": { ru: "Покупка авто — Сомонибанк", en: "Car Purchase — Somonibank", tj: "Хариди авто — Сомонибонк" },
  "cards.html": { ru: "Карты — Сомонибанк", en: "Cards — Somonibank", tj: "Кортҳо — Сомонибонк" },
  "contact.html": { ru: "Контакты — Сомонибанк", en: "Contacts — Somonibank", tj: "Тамос — Сомонибонк" },
  "delivery.html": { ru: "Доставка — Сомонибанк", en: "Delivery — Somonibank", tj: "Расондан — Сомонибонк" },
  "deposits.html": { ru: "Депозиты и счета — Сомонибанк", en: "Deposits and Accounts — Somonibank", tj: "Пасандозҳо ва ҳисобҳо — Сомонибонк" },
  "documents.html": { ru: "Документы — Сомонибанк", en: "Documents — Somonibank", tj: "Ҳуҷҷатҳо — Сомонибонк" },
  "financing.html": { ru: "Финансирование — Сомонибанк", en: "Financing — Somonibank", tj: "Маблағгузорӣ — Сомонибонк" },
  "news.html": { ru: "Новости — Сомонибанк", en: "News — Somonibank", tj: "Хабарҳо — Сомонибонк" },
  "salary-project.html": { ru: "Зарплатный проект — Сомонибанк", en: "Payroll Project — Somonibank", tj: "Лоиҳаи музд — Сомонибонк" },
  "settlement-account.html": { ru: "Расчётный счёт — Сомонибанк", en: "Settlement Account — Somonibank", tj: "Ҳисоби ҷорӣ — Сомонибонк" },
  "login.html": { ru: "Вход в Сомонибанк", en: "Login to Somonibank", tj: "Вуруд ба Сомонибонк" },
    "registration.html": { ru: "Регистрация в Сомонибанк", en: "Register in Somonibank", tj: "Бақайдгирӣ дар Сомонибонк" },
    "somonibank-app.html": { ru: "Приложение Somoni — Сомонибанк", en: "Somoni App — Somonibank", tj: "Барномаи Somoni — Сомонибонк" },
    "app-mobile-topup.html": { ru: "Пополнение мобильного — Сомонибанк", en: "Mobile Top Up — Somonibank", tj: "Пуркунии мобилӣ — Сомонибонк" },
    "app-internet-tv.html": { ru: "Интернет и ТВ — Сомонибанк", en: "Internet and TV — Somonibank", tj: "Интернет ва ТВ — Сомонибонк" },
    "app-utilities.html": { ru: "Коммунальные услуги — Сомонибанк", en: "Utilities — Somonibank", tj: "Хизматрасониҳои коммуналӣ — Сомонибонк" },
    "app-gov-services.html": { ru: "Госуслуги — Сомонибанк", en: "Government Services — Somonibank", tj: "Хизматрасониҳои давлатӣ — Сомонибонк" },
    "app-taxes.html": { ru: "Налоги — Сомонибанк", en: "Taxes — Somonibank", tj: "Андозҳо — Сомонибонк" },
    "somonibank.html": { ru: "Сомонибанк", en: "Somonibank", tj: "Сомонибонк" },
  "transfers.html": { ru: "Переводы — Сомонибанк", en: "Transfers — Somonibank", tj: "Интиқолҳо — Сомонибонк" },
  "visa-business.html": { ru: "Visa Business — Сомонибанк", en: "Visa Business — Somonibank", tj: "Visa Business — Сомонибонк" }
};

const UI_TEXT = {
  ru: { langShort: "Рус", login: "Вход", logout: "Выйти", cabinet: "Кабинет", light: "Светлая", dark: "Тёмная", loggedOut: "Вы вышли из аккаунта.", hello: "Здравствуйте", user: "пользователь", authTitle: "Вход в SomoniBank", authSubtitle: "Авторизуйтесь, чтобы открыть личный кабинет и работать с данными из backend API.", authLoginTab: "Вход", authRegisterTab: "Регистрация", authMessageLogin: "Введите email и пароль от backend-сервиса.", authMessageRegister: "Регистрация создаст нового пользователя через API /api/auth/register.", firstName: "Имя", lastName: "Фамилия", phone: "Телефон", passport: "Паспорт", address: "Адрес", password: "Пароль", signIn: "Войти", createAccount: "Создать аккаунт", loginDone: "Вход выполнен.", registerDone: "Регистрация завершена. Теперь войдите." },
  en: { langShort: "Eng", login: "Login", logout: "Logout", cabinet: "Cabinet", light: "Light", dark: "Dark", loggedOut: "You have been logged out.", hello: "Hello", user: "user", authTitle: "Sign in to SomoniBank", authSubtitle: "Sign in to open your cabinet and work with backend API data.", authLoginTab: "Login", authRegisterTab: "Register", authMessageLogin: "Enter your email and password from the backend service.", authMessageRegister: "Registration will create a new user through the /api/auth/register API.", firstName: "First name", lastName: "Last name", phone: "Phone", passport: "Passport", address: "Address", password: "Password", signIn: "Login", createAccount: "Create account", loginDone: "Login completed.", registerDone: "Registration completed. Please sign in." },
  tj: { langShort: "Тҷ", login: "Вуруд", logout: "Баромад", cabinet: "Кабинет", light: "Равшан", dark: "Тира", loggedOut: "Шумо аз аккаунт баромадед.", hello: "Салом", user: "корбар", authTitle: "Вуруд ба SomoniBank", authSubtitle: "Барои кушодани кабинет ва кор бо маълумоти backend API ворид шавед.", authLoginTab: "Вуруд", authRegisterTab: "Бақайдгирӣ", authMessageLogin: "Email ва пароли хизматрасонии backend-ро ворид намоед.", authMessageRegister: "Бақайдгирӣ корбари навро тавассути API /api/auth/register эҷод мекунад.", firstName: "Ном", lastName: "Насаб", phone: "Телефон", passport: "Шиноснома", address: "Суроға", password: "Рамз", signIn: "Вуруд", createAccount: "Эҷоди аккаунт", loginDone: "Вуруд анҷом ёфт.", registerDone: "Бақайдгирӣ анҷом ёфт. Акнун ворид шавед." }
};

const EXACT_TEXT_MAP = {
  ru: {
    "Частным лицам": "Частным лицам",
    "Бизнесу": "Бизнесу",
    "Сомонибанк": "Сомонибанк",
    "Приложение Somoni": "Приложение Somoni",
    "Карты": "Карты",
    "Покупка авто": "Покупка авто",
    "Somoni Shop": "Somoni Shop",
    "Переводы": "Переводы",
    "Депозиты": "Депозиты",
    "Авиабилеты": "Авиабилеты",
    "Ещё ▾": "Ещё ▾",
    "Somonibank Business": "Somonibank Business",
    "Зарплатный проект": "Зарплатный проект",
    "Финансирование": "Финансирование",
    "Продажи в рассрочку": "Продажи в рассрочку",
    "Эквайринг": "Эквайринг",
    "Расчётный счёт": "Расчётный счёт",
    "Филиалы и точки обслуживания": "Филиалы и точки обслуживания",
    "Приложения": "Приложения",
    "Соцсети": "Соцсети",
    "Подробнее": "Подробнее",
    "Открыть счёт": "Открыть счёт",
    "Открыть вклад": "Открыть вклад",
    "Получить карту": "Получить карту",
    "Обновить": "Обновить"
  },
  en: {
    "Частным лицам": "Individuals",
    "Бизнесу": "Business",
    "Сомонибанк": "Somonibank",
    "Приложение Somoni": "Somoni App",
    "Карты": "Cards",
    "Покупка авто": "Car Purchase",
    "Somoni Shop": "Somoni Shop",
    "Переводы": "Transfers",
    "Депозиты": "Deposits",
    "Авиабилеты": "Air Tickets",
    "Ещё ▾": "More ▾",
    "Somonibank Business": "Somonibank Business",
    "Зарплатный проект": "Payroll Project",
    "Финансирование": "Financing",
    "Продажи в рассрочку": "Installment Sales",
    "Эквайринг": "Acquiring",
    "Расчётный счёт": "Settlement Account",
    "Филиалы и точки обслуживания": "Branches and service points",
    "Приложения": "Applications",
    "Соцсети": "Social",
    "Подробнее": "Details",
    "Открыть счёт": "Open account",
    "Открыть вклад": "Open deposit",
    "Получить карту": "Get card",
    "Обновить": "Refresh"
  },
  tj: {
    "Частным лицам": "Шахсони воқеӣ",
    "Бизнесу": "Бизнес",
    "Сомонибанк": "Сомонибонк",
    "Приложение Somoni": "Барномаи Somoni",
    "Карты": "Кортҳо",
    "Покупка авто": "Хариди авто",
    "Somoni Shop": "Somoni Shop",
    "Переводы": "Интиқолҳо",
    "Депозиты": "Пасандозҳо",
    "Авиабилеты": "Чиптаҳои ҳавоӣ",
    "Ещё ▾": "Боз ▾",
    "Somonibank Business": "Somonibank Business",
    "Зарплатный проект": "Лоиҳаи музд",
    "Финансирование": "Маблағгузорӣ",
    "Продажи в рассрочку": "Фурӯш бо муҳлат",
    "Эквайринг": "Эквайринг",
    "Расчётный счёт": "Ҳисоби ҷорӣ",
    "Филиалы и точки обслуживания": "Филиалҳо ва нуқтаҳои хизматрасонӣ",
    "Приложения": "Барномаҳо",
    "Соцсети": "Иҷтимоӣ",
    "Подробнее": "Муфассал",
    "Открыть счёт": "Кушодани ҳисоб",
    "Открыть вклад": "Кушодани пасандоз",
    "Получить карту": "Гирифтани корт",
    "Обновить": "Навсозӣ"
  }
};

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getLanguage() {
  const saved = localStorage.getItem(LANG_KEY);
  return saved && UI_TEXT[saved] ? saved : "ru";
}

function getTheme() {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

function setLanguage(value) {
  localStorage.setItem(LANG_KEY, value);
  applyGlobalLanguage();
}

function setTheme(value) {
  localStorage.setItem(THEME_KEY, value);
  applyGlobalTheme();
}

function currentUiText() {
  return UI_TEXT[getLanguage()] || UI_TEXT.ru;
}

function translatePhrase(text) {
  const key = String(text || "").trim();
  if (!key) {
    return text;
  }
  return EXACT_TEXT_MAP[getLanguage()]?.[key] ?? text;
}

function preserveSpacing(source, replacement) {
  const text = String(source || "");
  const leading = text.match(/^\s*/)?.[0] || "";
  const trailing = text.match(/\s*$/)?.[0] || "";
  return `${leading}${replacement}${trailing}`;
}

export function getSession() {
  return safeJsonParse(localStorage.getItem(STORAGE_KEY) || "null");
}

export function isAuthenticated() {
  return Boolean(getSession()?.token);
}

export function setSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("sbank:session-changed", { detail: session }));
}

export function clearSession(showMessage = false) {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("sbank:session-changed", { detail: null }));
  if (showMessage) {
    showToast(currentUiText().loggedOut);
  }
}

function parseApiError(payload, fallbackMessage) {
  if (!payload) {
    return fallbackMessage;
  }

  if (Array.isArray(payload.Description) && payload.Description.length > 0) {
    return payload.Description.join(" ");
  }

  if (payload.title) {
    return payload.detail ? `${payload.title} ${payload.detail}` : payload.title;
  }

  if (payload.errors) {
    const messages = Object.values(payload.errors).flat();
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  if (typeof payload === "string") {
    return payload;
  }

  return fallbackMessage;
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    auth = false,
    headers = {}
  } = options;

  const session = getSession();

  const resolveUrl = (value) => {
    const raw = String(value || "").trim();
    if (!raw) {
      return raw;
    }

    // Absolute URL (http/https)
    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }

    // Relative URL -> use configured API base.
    const base = String(API_BASE_URL || "").replace(/\/$/, "");
    const tail = raw.startsWith("/") ? raw : `/${raw}`;
    return `${base}${tail}`;
  };

  const buildFetchOptions = () => ({
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth && session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const resolveFallbackUrls = (value) => {
    const primaryUrl = resolveUrl(value);
    const urls = [primaryUrl];

    try {
      const currentUrl = new URL(primaryUrl, window.location.origin);
      const isLocalHost = ["localhost", "127.0.0.1"].includes(currentUrl.hostname);

      if (isLocalHost && currentUrl.port === "5142") {
        urls.push(`${currentUrl.protocol}//${currentUrl.hostname}:5000${currentUrl.pathname}${currentUrl.search}`);
      } else if (isLocalHost && currentUrl.port === "5000") {
        urls.push(`${currentUrl.protocol}//${currentUrl.hostname}:5142${currentUrl.pathname}${currentUrl.search}`);
      }
    } catch {
      return urls;
    }

    return [...new Set(urls)];
  };

  let response;
  let lastError;
  const candidateUrls = resolveFallbackUrls(path);

  for (const candidateUrl of candidateUrls) {
    try {
      response = await fetch(candidateUrl, buildFetchOptions());
      if (candidateUrl !== candidateUrls[0]) {
        setApiBaseUrl(new URL(candidateUrl).origin);
      }
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!response) {
    throw lastError || new Error("Failed to fetch");
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }

    throw new Error(parseApiError(payload, `Ошибка запроса: ${response.status}`));
  }

  return payload;
}

export function unwrapResponse(payload) {
  if (payload && typeof payload === "object" && ("StatusCode" in payload || "statusCode" in payload)) {
    const data = payload.Data ?? payload.data;
    const messages = Array.isArray(payload.Description)
      ? payload.Description
      : Array.isArray(payload.description)
        ? payload.description
        : [];
    const statusCode = payload.StatusCode ?? payload.statusCode ?? 200;

    return {
      data,
      messages,
      statusCode
    };
  }

  return {
    data: payload,
    messages: [],
    statusCode: 200
  };
}

export function formatMoney(value, currency = "") {
  const numeric = Number(value || 0);
  const formatted = numeric.toLocaleString("ru-RU", {
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  });
  return currency ? `${formatted} ${currency}` : formatted;
}

export function formatDate(value) {
  if (!value) {
    return "Не указано";
  }

  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function ensureGlobalStyles() {
  if (document.getElementById("sb-global-ui-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "sb-global-ui-style";
  style.textContent = `
    .sb-location-link,.sb-lang-btn{display:none !important}
    .sb-global-controls{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
    .sb-lang-select{min-height:40px;padding:0 14px;border:1px solid var(--border,#dbe2ea);border-radius:12px;background:#fff;color:#334155;font-size:14px;font-weight:600;cursor:pointer}
    .sb-login-btn,.sb-cabinet-btn{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 16px;border:none;border-radius:12px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 8px 18px rgba(37,99,235,.2);text-decoration:none}
    .sb-logout-btn{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 14px;border:1px solid var(--border,#dbe2ea);border-radius:12px;background:#fff;color:#0f172a;font-size:14px;font-weight:600;cursor:pointer}
    .sb-theme-btn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border:1px solid var(--border,#dbe2ea);border-radius:12px;background:#fff;color:#0f172a;cursor:pointer}
    .sb-theme-btn svg{width:18px;height:18px}
    .header-right .sb-theme-btn,.top-actions .sb-theme-btn,.header-actions .sb-theme-btn{flex:0 0 auto}
    html[data-sb-theme="dark"]{--bg:#020617;--card-bg:#0f172a;--text:#f8fafc;--text-muted:#cbd5e1;--border:#334155;--shadow:0 10px 30px rgba(0,0,0,.35)}
    html[data-sb-theme="dark"] body{background:var(--bg) !important;color:var(--text) !important}
    html[data-sb-theme="dark"] .app-shell{background:#020617 !important;border-color:#1e293b !important;box-shadow:0 24px 64px rgba(0,0,0,.45) !important}
    html[data-sb-theme="dark"] .sidebar{background:#0f172a !important;border-color:#1e293b !important}
    html[data-sb-theme="dark"] .main,
    html[data-sb-theme="dark"] .content,
    html[data-sb-theme="dark"] .main-col,
    html[data-sb-theme="dark"] .right-sidebar,
    html[data-sb-theme="dark"] .right-col,
    html[data-sb-theme="dark"] .middle-col,
    html[data-sb-theme="dark"] .side-col,
    html[data-sb-theme="dark"] .list-col,
    html[data-sb-theme="dark"] .analysis-sidebar{background:transparent !important}
    html[data-sb-theme="dark"] .header,
    html[data-sb-theme="dark"] .topbar{background:transparent !important}
    html[data-sb-theme="dark"] .brand-name,
    html[data-sb-theme="dark"] .section-title,
    html[data-sb-theme="dark"] .page-title,
    html[data-sb-theme="dark"] .page-head h1,
    html[data-sb-theme="dark"] .page-title-row h1,
    html[data-sb-theme="dark"] .user-name,
    html[data-sb-theme="dark"] .nav-item,
    html[data-sb-theme="dark"] .nav-link,
    html[data-sb-theme="dark"] .w-title,
    html[data-sb-theme="dark"] .panel-title,
    html[data-sb-theme="dark"] .card-type-name,
    html[data-sb-theme="dark"] .ticket-title,
    html[data-sb-theme="dark"] .op-name,
    html[data-sb-theme="dark"] .mini-item strong{color:var(--text) !important}
    html[data-sb-theme="dark"] .page-head p,
    html[data-sb-theme="dark"] .page-title-row p,
    html[data-sb-theme="dark"] .ticket-meta,
    html[data-sb-theme="dark"] .op-memo,
    html[data-sb-theme="dark"] .pop-sub,
    html[data-sb-theme="dark"] .user-profile span[style*="color:#94a3b8"],
    html[data-sb-theme="dark"] .conversation-sub,
    html[data-sb-theme="dark"] .metric strong{color:var(--text-muted) !important}
    html[data-sb-theme="dark"] .search-pill,
    html[data-sb-theme="dark"] .search,
    html[data-sb-theme="dark"] .user-profile,
    html[data-sb-theme="dark"] .date-pill,
    html[data-sb-theme="dark"] .sidebar-box,
    html[data-sb-theme="dark"] .widget,
    html[data-sb-theme="dark"] .panel,
    html[data-sb-theme="dark"] .side-card,
    html[data-sb-theme="dark"] .info-card,
    html[data-sb-theme="dark"] .focus-box,
    html[data-sb-theme="dark"] .quick-tabs,
    html[data-sb-theme="dark"] .tabs,
    html[data-sb-theme="dark"] .cards-section-grid,
    html[data-sb-theme="dark"] .pop-card,
    html[data-sb-theme="dark"] .service-card,
    html[data-sb-theme="dark"] .quick-card,
    html[data-sb-theme="dark"] .feature-tile,
    html[data-sb-theme="dark"] .t-option,
    html[data-sb-theme="dark"] .t-form,
    html[data-sb-theme="dark"] .summary-box,
    html[data-sb-theme="dark"] .stat-card,
    html[data-sb-theme="dark"] .ticket-item,
    html[data-sb-theme="dark"] .faq-item,
    html[data-sb-theme="dark"] .message,
    html[data-sb-theme="dark"] .profile-card,
    html[data-sb-theme="dark"] .alert-item,
    html[data-sb-theme="dark"] .doc-item,
    html[data-sb-theme="dark"] .timeline-item,
    html[data-sb-theme="dark"] .empty-state{background:#0f172a !important;color:var(--text-muted) !important;border-color:#334155 !important}
    html[data-sb-theme="dark"] .nav-item:hover,
    html[data-sb-theme="dark"] .nav-link:hover{background:#172554 !important;color:#fff !important}
    html[data-sb-theme="dark"] .nav-item.active,
    html[data-sb-theme="dark"] .nav-link.active{background:#2563eb !important;color:#fff !important}
    html[data-sb-theme="dark"] .search-pill input,
    html[data-sb-theme="dark"] .search input,
    html[data-sb-theme="dark"] .message-form textarea,
    html[data-sb-theme="dark"] .ticket-form input,
    html[data-sb-theme="dark"] .ticket-form select,
    html[data-sb-theme="dark"] .ticket-form textarea{background:transparent !important;color:var(--text) !important}
    html[data-sb-theme="dark"] .hero-banner,
    html[data-sb-theme="dark"] .banner,
    html[data-sb-theme="dark"] .promo-banner{box-shadow:0 20px 50px rgba(0,0,0,.35) !important}
    html[data-sb-theme="dark"] .rates-panel{background:#111827 !important;border-color:#334155 !important;box-shadow:0 20px 50px rgba(0,0,0,.35) !important}
    html[data-sb-theme="dark"] .rates-wrap,
    html[data-sb-theme="dark"] .rates-table,
    html[data-sb-theme="dark"] .rates-footer{background:transparent !important;color:var(--text) !important}
    html[data-sb-theme="dark"] .rates-table thead th{color:var(--text-muted) !important;border-color:#334155 !important}
    html[data-sb-theme="dark"] .rates-table tbody td{background:#0b1220 !important;color:var(--text) !important;border-color:#1e293b !important}
    html[data-sb-theme="dark"] .rates-table tbody tr:hover td{background:#131c31 !important}
    html[data-sb-theme="dark"] .rate-filter,
    html[data-sb-theme="dark"] .mini-filter{background:transparent !important;color:var(--text) !important;border-color:#334155 !important}
    html[data-sb-theme="dark"] .rate-filter:hover,
    html[data-sb-theme="dark"] .mini-filter:hover{background:#172554 !important;color:#fff !important;border-color:#2563eb !important}
    html[data-sb-theme="dark"] .rate-filter.active,
    html[data-sb-theme="dark"] .mini-filter.active{background:#2563eb !important;color:#fff !important;border-color:#2563eb !important}
    html[data-sb-theme="dark"] .converter{background:linear-gradient(180deg,#f8fafc 0%,#e2e8f0 100%) !important;border:1px solid #cbd5e1 !important;box-shadow:0 20px 50px rgba(0,0,0,.35) !important}
    html[data-sb-theme="dark"] .converter,
    html[data-sb-theme="dark"] .converter label{color:#0f172a !important}
    html[data-sb-theme="dark"] .converter-switch{background:#0f172a !important;border:1px solid #1e293b !important}
    html[data-sb-theme="dark"] .converter-switch button{background:transparent !important;color:#e2e8f0 !important}
    html[data-sb-theme="dark"] .converter-switch button.active{background:#2563eb !important;color:#fff !important}
    html[data-sb-theme="dark"] .converter-row{background:#111827 !important;border-color:#334155 !important}
    html[data-sb-theme="dark"] .converter-row input{background:transparent !important;color:#fff !important;border:0 !important}
    html[data-sb-theme="dark"] .currency-select{background:#111827 !important;color:#fff !important;border:0 !important}
    html[data-sb-theme="dark"] .swap{color:#2563eb !important}
    html[data-sb-theme="dark"] .history-link{color:#3b82f6 !important}
    html[data-sb-theme="dark"] .send-button{background:#2563eb !important;color:#fff !important}
    html[data-sb-theme="dark"] .sb-header,html[data-sb-theme="dark"] .sb-header-top,html[data-sb-theme="dark"] .sb-header-bottom{background:#020617 !important;border-color:#334155 !important}
    html[data-sb-theme="dark"] .dashboard-section,html[data-sb-theme="dark"] .tariff-section,html[data-sb-theme="dark"] .docs-section,html[data-sb-theme="dark"] .banner-section,html[data-sb-theme="dark"] .product-card,html[data-sb-theme="dark"] .feature-card,html[data-sb-theme="dark"] .benefit-card,html[data-sb-theme="dark"] .news-card,html[data-sb-theme="dark"] .doc-card,html[data-sb-theme="dark"] .branch-item,html[data-sb-theme="dark"] .dash-box,html[data-sb-theme="dark"] [class*="panel"],html[data-sb-theme="dark"] [class*="card"],html[data-sb-theme="dark"] [class*="box"]{background:var(--card-bg) !important;color:var(--text) !important;border-color:var(--border) !important}
    html[data-sb-theme="dark"] .sb-nav-top a,html[data-sb-theme="dark"] .sb-nav-bottom a,html[data-sb-theme="dark"] .sb-logo,html[data-sb-theme="dark"] h1,html[data-sb-theme="dark"] h2,html[data-sb-theme="dark"] h3,html[data-sb-theme="dark"] h4,html[data-sb-theme="dark"] strong,html[data-sb-theme="dark"] label{color:var(--text) !important}
    html[data-sb-theme="dark"] p,html[data-sb-theme="dark"] span,html[data-sb-theme="dark"] li,html[data-sb-theme="dark"] .hero-desc,html[data-sb-theme="dark"] .metric-label,html[data-sb-theme="dark"] .dash-t2,html[data-sb-theme="dark"] .dash-t3{color:var(--text-muted) !important}
    html[data-sb-theme="dark"] input,html[data-sb-theme="dark"] select,html[data-sb-theme="dark"] textarea{background:#0b1220 !important;color:var(--text) !important;border-color:var(--border) !important}
    html[data-sb-theme="dark"] .sb-lang-select,html[data-sb-theme="dark"] .sb-theme-btn,html[data-sb-theme="dark"] .sb-logout-btn{background:#0f172a !important;color:var(--text) !important;border-color:#334155 !important}
    html[data-sb-theme="dark"] .sb-login-btn,html[data-sb-theme="dark"] .sb-cabinet-btn,html[data-sb-theme="dark"] .sb-btn,html[data-sb-theme="dark"] .btn-primary,html[data-sb-theme="dark"] .hero-btn{background:#fff !important;color:#000 !important}
  `;
  document.head.appendChild(style);
}

function removeHeaderNoise() {
  document.querySelectorAll(".sb-location-link").forEach((node) => node.remove());
  document.querySelectorAll(".sb-nav-bottom a").forEach((node) => {
    const text = node.textContent.trim().toLowerCase();
    if (text === "салом" || text === "salom") {
      node.remove();
    }
  });
}

function applyPageTitle() {
  const file = window.location.pathname.split("/").pop() || "index.html";
  const pageTitle = PAGE_TITLES[file];
  if (pageTitle) {
    document.title = pageTitle[getLanguage()] || pageTitle.ru;
  }
}

function applyExactTextTranslations() {
  document.querySelectorAll("body h1, body h2, body h3, body h4, body p, body span, body a, body button, body label, body strong").forEach((element) => {
    if (element.children.length > 0) {
      return;
    }
    const base = element.dataset.sbBaseText || element.textContent.trim();
    if (!base) {
      return;
    }
    if (!element.dataset.sbBaseText) {
      element.dataset.sbBaseText = base;
    }
    const next = translatePhrase(base);
    if (next !== base) {
      element.textContent = preserveSpacing(element.textContent, next);
    } else if (getLanguage() === "ru") {
      element.textContent = preserveSpacing(element.textContent, base);
    }
  });
}

function themeIconMarkup(theme) {
  return theme === "dark"
    ? `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v2.2M12 18.8V21M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M3 12h2.2M18.8 12H21M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
}

function updateThemeButtons() {
  const ui = currentUiText();
  document.querySelectorAll("[data-sb-theme-toggle]").forEach((button) => {
    button.innerHTML = themeIconMarkup(getTheme());
    button.title = getTheme() === "dark" ? ui.light : ui.dark;
    button.setAttribute("aria-label", button.title);
  });
}

function applyGlobalTheme() {
  document.documentElement.dataset.sbTheme = getTheme();
  updateThemeButtons();
}

function applyAuthModalLanguage() {
  if (!authModal) {
    return;
  }
  const ui = currentUiText();
  authModal.querySelector("#sb-auth-title")?.replaceChildren(document.createTextNode(ui.authTitle));
  authModal.querySelector(".sb-modal-subtitle")?.replaceChildren(document.createTextNode(ui.authSubtitle));
  authModal.querySelector('[data-auth-tab="login"]')?.replaceChildren(document.createTextNode(ui.authLoginTab));
  authModal.querySelector('[data-auth-tab="register"]')?.replaceChildren(document.createTextNode(ui.authRegisterTab));
  authModal.querySelector('label[for="sb-login-password"]')?.replaceChildren(document.createTextNode(ui.password));
  authModal.querySelector('label[for="sb-register-firstName"]')?.replaceChildren(document.createTextNode(ui.firstName));
  authModal.querySelector('label[for="sb-register-lastName"]')?.replaceChildren(document.createTextNode(ui.lastName));
  authModal.querySelector('label[for="sb-register-phone"]')?.replaceChildren(document.createTextNode(ui.phone));
  authModal.querySelector('label[for="sb-register-passportNumber"]')?.replaceChildren(document.createTextNode(ui.passport));
  authModal.querySelector('label[for="sb-register-address"]')?.replaceChildren(document.createTextNode(ui.address));
  authModal.querySelector('label[for="sb-register-password"]')?.replaceChildren(document.createTextNode(ui.password));
}

function renderHeaderControls() {
  const host = document.querySelector(".sb-header-actions, .header-right, .top-actions, .header-actions");
  if (!host) {
    return;
  }

  let controls = host.querySelector(".sb-global-controls");
  if (!controls) {
    controls = document.createElement("div");
    controls.className = "sb-global-controls";
    host.appendChild(controls);
  }

  const isAppShell = !document.querySelector(".sb-header-actions");
  const ui = currentUiText();
  const session = getSession();

  if (isAppShell) {
    controls.innerHTML = `
      <button class="sb-theme-btn" type="button" data-sb-theme-toggle></button>
    `;
  } else {
    controls.innerHTML = `
      <select class="sb-lang-select" data-sb-lang>
        <option value="ru">Рус</option>
        <option value="en">Eng</option>
        <option value="tj">Тҷ</option>
      </select>
      ${session
        ? `<a class="sb-cabinet-btn" href="somonibank-app.html"><span data-sb-cabinet-label>${ui.cabinet}</span></a><button class="sb-theme-btn" type="button" data-sb-theme-toggle></button><button class="sb-logout-btn" type="button" data-sb-logout><span data-sb-logout-label>${ui.logout}</span></button>`
        : `<a class="sb-login-btn" href="login.html"><span data-sb-login-label>${ui.login}</span></a><button class="sb-theme-btn" type="button" data-sb-theme-toggle></button>`}
    `;
  }

  const select = controls.querySelector("[data-sb-lang]");
  if (select) {
    select.value = getLanguage();
    select.addEventListener("change", () => setLanguage(select.value));
  }
  controls.querySelector("[data-sb-logout]")?.addEventListener("click", () => clearSession(true));
  controls.querySelector("[data-sb-theme-toggle]")?.addEventListener("click", () => setTheme(getTheme() === "dark" ? "light" : "dark"));
  updateThemeButtons();
}

function renderSidebarLogout() {
  const sidebarList = document.querySelector(".sidebar-bottom .nav-list");
  if (!sidebarList) {
    return;
  }

  const existingItem = sidebarList.querySelector("[data-sb-sidebar-logout]");
  if (!isAuthenticated()) {
    existingItem?.remove();
    return;
  }

  if (existingItem) {
    return;
  }

  const item = document.createElement("li");
  item.className = "nav-item";
  item.dataset.sbSidebarLogout = "true";
  item.innerHTML = `
    <a href="#" style="display:flex; align-items:center; gap:16px; color:inherit; width:100%;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="16 17 21 12 16 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="21" y1="12" x2="9" y2="12" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Выход</span>
    </a>
  `;

  item.querySelector("a")?.addEventListener("click", (event) => {
    event.preventDefault();
    clearSession(true);
    window.location.href = "login.html";
  });

  sidebarList.appendChild(item);
}

function applyGlobalLanguage() {
  const ui = currentUiText();
  document.documentElement.lang = getLanguage() === "tj" ? "tg" : getLanguage();
  removeHeaderNoise();
  applyPageTitle();
  applyExactTextTranslations();
  document.querySelectorAll(".sb-lang-select").forEach((node) => { node.value = getLanguage(); });
  document.querySelectorAll("[data-sb-login-label]").forEach((node) => { node.textContent = ui.login; });
  document.querySelectorAll("[data-sb-cabinet-label]").forEach((node) => { node.textContent = ui.cabinet; });
  document.querySelectorAll("[data-sb-logout-label]").forEach((node) => { node.textContent = ui.logout; });
  applyAuthModalLanguage();
  updateThemeButtons();
}

function initGlobalUi() {
  if (globalUiInitialized) {
    renderHeaderControls();
    renderSidebarLogout();
    applyGlobalTheme();
    applyGlobalLanguage();
    return;
  }

  globalUiInitialized = true;
  ensureGlobalStyles();
  removeHeaderNoise();
  renderHeaderControls();
  renderSidebarLogout();
  applyGlobalTheme();
  applyGlobalLanguage();
  window.addEventListener("sbank:session-changed", () => {
    renderHeaderControls();
    renderSidebarLogout();
    applyGlobalLanguage();
  });
}

function createAuthModal() {
  if (authModal) {
    applyAuthModalLanguage();
    return authModal;
  }

  const ui = currentUiText();
  authModal = document.createElement("div");
  authModal.className = "sb-modal-backdrop";
  authModal.hidden = true;
  authModal.innerHTML = `
    <div class="sb-modal" role="dialog" aria-modal="true" aria-labelledby="sb-auth-title">
      <div class="sb-modal-head">
        <div>
          <h2 class="sb-modal-title" id="sb-auth-title">${ui.authTitle}</h2>
          <p class="sb-modal-subtitle">${ui.authSubtitle}</p>
        </div>
        <button class="sb-ghost-btn sb-modal-close" type="button" data-auth-close>&times;</button>
      </div>
      <div class="sb-tab-row">
        <button class="sb-tab-btn active" type="button" data-auth-tab="login">${ui.authLoginTab}</button>
        <button class="sb-tab-btn" type="button" data-auth-tab="register">${ui.authRegisterTab}</button>
      </div>
      <div class="sb-stack">
        <div class="sb-message info" data-auth-message>${ui.authMessageLogin}</div>
        <form data-auth-form="login">
          <div class="sb-form-grid">
            <div class="sb-field sb-field-full">
              <label for="sb-login-email">Email</label>
              <input id="sb-login-email" name="email" type="email" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-login-password">${ui.password}</label>
              <input id="sb-login-password" name="password" type="password" required>
            </div>
          </div>
          <div class="sb-cta" style="margin-top:18px;">
            <button class="sb-btn" type="submit">${ui.signIn}</button>
          </div>
        </form>
        <form data-auth-form="register" hidden>
          <div class="sb-form-grid">
            <div class="sb-field">
              <label for="sb-register-firstName">${ui.firstName}</label>
              <input id="sb-register-firstName" name="firstName" type="text" required>
            </div>
            <div class="sb-field">
              <label for="sb-register-lastName">${ui.lastName}</label>
              <input id="sb-register-lastName" name="lastName" type="text" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-register-email">Email</label>
              <input id="sb-register-email" name="email" type="email" required>
            </div>
            <div class="sb-field">
              <label for="sb-register-phone">${ui.phone}</label>
              <input id="sb-register-phone" name="phone" type="text" placeholder="+992..." required>
            </div>
            <div class="sb-field">
              <label for="sb-register-passportNumber">${ui.passport}</label>
              <input id="sb-register-passportNumber" name="passportNumber" type="text" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-register-address">${ui.address}</label>
              <input id="sb-register-address" name="address" type="text" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-register-password">${ui.password}</label>
              <input id="sb-register-password" name="password" type="password" minlength="6" required>
            </div>
          </div>
          <div class="sb-cta" style="margin-top:18px;">
            <button class="sb-btn" type="submit">${ui.createAccount}</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(authModal);

  authModal.addEventListener("click", (event) => {
    if (event.target === authModal || event.target.closest("[data-auth-close]")) {
      closeAuthModal();
    }
  });

  const forms = authModal.querySelectorAll("[data-auth-form]");
  const tabs = authModal.querySelectorAll("[data-auth-tab]");
  const messageBox = authModal.querySelector("[data-auth-message]");

  tabs.forEach((tabButton) => {
    tabButton.addEventListener("click", () => {
      const activeTab = tabButton.dataset.authTab;
      tabs.forEach((button) => button.classList.toggle("active", button === tabButton));
      forms.forEach((form) => {
        form.hidden = form.dataset.authForm !== activeTab;
      });
      messageBox.className = "sb-message info";
      messageBox.textContent = activeTab === "login"
        ? currentUiText().authMessageLogin
        : currentUiText().authMessageRegister;
    });
  });

  authModal.querySelector('[data-auth-form="login"]').addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const response = unwrapResponse(await apiRequest("/api/auth/login", {
        method: "POST",
        body: {
          email: form.email.value.trim(),
          password: form.password.value
        }
      }));

      setSession(response.data);
      messageBox.className = "sb-message success";
      messageBox.textContent = response.messages[0] || currentUiText().loginDone;
      showToast(`${currentUiText().hello}, ${response.data.fullName || response.data.FullName || currentUiText().user}!`);
      closeAuthModal();
      authSuccessHandler?.(getSession());
      authSuccessHandler = null;
    } catch (error) {
      messageBox.className = "sb-message error";
      messageBox.textContent = error.message;
    } finally {
      submitButton.disabled = false;
    }
  });

  authModal.querySelector('[data-auth-form="register"]').addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const response = unwrapResponse(await apiRequest("/api/auth/register", {
        method: "POST",
        body: {
          firstName: form.firstName.value.trim(),
          lastName: form.lastName.value.trim(),
          email: form.email.value.trim(),
          password: form.password.value,
          phone: form.phone.value.trim(),
          address: form.address.value.trim(),
          passportNumber: form.passportNumber.value.trim()
        }
      }));

      messageBox.className = "sb-message success";
      messageBox.textContent = response.messages[0] || currentUiText().registerDone;
      authModal.querySelector('[data-auth-tab="login"]').click();
      authModal.querySelector("#sb-login-email").value = form.email.value.trim();
      form.reset();
    } catch (error) {
      messageBox.className = "sb-message error";
      messageBox.textContent = error.message;
    } finally {
      submitButton.disabled = false;
    }
  });

  return authModal;
}

export function openAuthModal(mode = "login", onSuccess = null) {
  const modal = createAuthModal();
  authSuccessHandler = onSuccess;
  modal.hidden = false;
  modal.querySelector(`[data-auth-tab="${mode}"]`)?.click();
}

export function closeAuthModal() {
  if (authModal) {
    authModal.hidden = true;
  }
}

export function requireAuth(callback, mode = "login") {
  if (isAuthenticated()) {
    callback(getSession());
    return;
  }

  openAuthModal(mode, callback);
}

export function mountHeaderAuth() {
  initGlobalUi();
}

// Backwards-compatible alias used by some pages.
// Historically pages referenced bindAuthControls(); now the implementation is mountHeaderAuth().
export function bindAuthControls() {
  mountHeaderAuth();
}

export function messageBox(kind, text) {
  return `<div class="sb-message ${kind}">${text}</div>`;
}

export function statusClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (["active", "completed", "paid", "success", "read"].includes(normalized)) {
    return "success";
  }
  if (["pending", "reviewed", "warning", "new"].includes(normalized)) {
    return "warn";
  }
  if (["blocked", "closed", "rejected", "failed", "forbidden"].includes(normalized)) {
    return "danger";
  }
  return "";
}

// Alias for isAuthenticated for backwards compatibility
export function checkAuth() {
  return isAuthenticated();
}

// API Base URL configuration
// Priority:
// 1) localStorage key "sbank-api-base-url"
// 2) window.SBANK_API_BASE_URL (if set in a page)
// 3) default backend dev url (from launchSettings.json)
const DEFAULT_API_BASE_URL = `${location.protocol}//${location.hostname}:5142`;
export const API_BASE_URL =
  localStorage.getItem("sbank-api-base-url")
  || window.SBANK_API_BASE_URL
  || DEFAULT_API_BASE_URL;

export function setApiBaseUrl(url) {
  if (!url) {
    localStorage.removeItem("sbank-api-base-url");
    return;
  }
  localStorage.setItem("sbank-api-base-url", String(url));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlobalUi, { once: true });
} else {
  initGlobalUi();
}

// Also export as default for convenience
export default {
  getSession,
  isAuthenticated,
  checkAuth,
  setApiBaseUrl,
  setSession,
  clearSession,
  apiRequest,
  unwrapResponse,
  formatMoney,
  formatDate,
  showToast,
  openAuthModal,
  bindAuthControls,
  messageBox,
  statusClass,
  API_BASE_URL
};
