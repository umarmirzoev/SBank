(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function o(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(r){if(r.ep)return;r.ep=!0;const a=o(r);fetch(r.href,a)}})();const E="sbank-session",R="sbank-lang",O="sbank-theme";let s,x=null,M=!1;const z={"index.html":{ru:"Сомонибанк — Главная",en:"Somonibank — Home",tj:"Сомонибонк — Асосӣ"},"business.html":{ru:"Бизнесу — Сомонибанк",en:"Business — Somonibank",tj:"Барои бизнес — Сомонибонк"},"addresses.html":{ru:"Адреса и банкоматы — Сомонибанк",en:"Branches and ATMs — Somonibank",tj:"Суроғаҳо ва банкоматҳо — Сомонибонк"},"auto.html":{ru:"Покупка авто — Сомонибанк",en:"Car Purchase — Somonibank",tj:"Хариди авто — Сомонибонк"},"cards.html":{ru:"Карты — Сомонибанк",en:"Cards — Somonibank",tj:"Кортҳо — Сомонибонк"},"contact.html":{ru:"Контакты — Сомонибанк",en:"Contacts — Somonibank",tj:"Тамос — Сомонибонк"},"delivery.html":{ru:"Доставка — Сомонибанк",en:"Delivery — Somonibank",tj:"Расондан — Сомонибонк"},"deposits.html":{ru:"Депозиты и счета — Сомонибанк",en:"Deposits and Accounts — Somonibank",tj:"Пасандозҳо ва ҳисобҳо — Сомонибонк"},"documents.html":{ru:"Документы — Сомонибанк",en:"Documents — Somonibank",tj:"Ҳуҷҷатҳо — Сомонибонк"},"financing.html":{ru:"Финансирование — Сомонибанк",en:"Financing — Somonibank",tj:"Маблағгузорӣ — Сомонибонк"},"news.html":{ru:"Новости — Сомонибанк",en:"News — Somonibank",tj:"Хабарҳо — Сомонибонк"},"salary-project.html":{ru:"Зарплатный проект — Сомонибанк",en:"Payroll Project — Somonibank",tj:"Лоиҳаи музд — Сомонибонк"},"settlement-account.html":{ru:"Расчётный счёт — Сомонибанк",en:"Settlement Account — Somonibank",tj:"Ҳисоби ҷорӣ — Сомонибонк"},"login.html":{ru:"Вход в Сомонибанк",en:"Login to Somonibank",tj:"Вуруд ба Сомонибонк"},"registration.html":{ru:"Регистрация в Сомонибанк",en:"Register in Somonibank",tj:"Бақайдгирӣ дар Сомонибонк"},"somonibank-app.html":{ru:"Приложение Somoni — Сомонибанк",en:"Somoni App — Somonibank",tj:"Барномаи Somoni — Сомонибонк"},"app-mobile-topup.html":{ru:"Пополнение мобильного — Сомонибанк",en:"Mobile Top Up — Somonibank",tj:"Пуркунии мобилӣ — Сомонибонк"},"somonibank.html":{ru:"Сомонибанк",en:"Somonibank",tj:"Сомонибонк"},"transfers.html":{ru:"Переводы — Сомонибанк",en:"Transfers — Somonibank",tj:"Интиқолҳо — Сомонибонк"},"visa-business.html":{ru:"Visa Business — Сомонибанк",en:"Visa Business — Somonibank",tj:"Visa Business — Сомонибонк"}},w={ru:{langShort:"Рус",login:"Вход",logout:"Выйти",cabinet:"Кабинет",light:"Светлая",dark:"Тёмная",loggedOut:"Вы вышли из аккаунта.",hello:"Здравствуйте",user:"пользователь",authTitle:"Вход в SomoniBank",authSubtitle:"Авторизуйтесь, чтобы открыть личный кабинет и работать с данными из backend API.",authLoginTab:"Вход",authRegisterTab:"Регистрация",authMessageLogin:"Введите email и пароль от backend-сервиса.",authMessageRegister:"Регистрация создаст нового пользователя через API /api/auth/register.",firstName:"Имя",lastName:"Фамилия",phone:"Телефон",passport:"Паспорт",address:"Адрес",password:"Пароль",signIn:"Войти",createAccount:"Создать аккаунт",loginDone:"Вход выполнен.",registerDone:"Регистрация завершена. Теперь войдите."},en:{langShort:"Eng",login:"Login",logout:"Logout",cabinet:"Cabinet",light:"Light",dark:"Dark",loggedOut:"You have been logged out.",hello:"Hello",user:"user",authTitle:"Sign in to SomoniBank",authSubtitle:"Sign in to open your cabinet and work with backend API data.",authLoginTab:"Login",authRegisterTab:"Register",authMessageLogin:"Enter your email and password from the backend service.",authMessageRegister:"Registration will create a new user through the /api/auth/register API.",firstName:"First name",lastName:"Last name",phone:"Phone",passport:"Passport",address:"Address",password:"Password",signIn:"Login",createAccount:"Create account",loginDone:"Login completed.",registerDone:"Registration completed. Please sign in."},tj:{langShort:"Тҷ",login:"Вуруд",logout:"Баромад",cabinet:"Кабинет",light:"Равшан",dark:"Тира",loggedOut:"Шумо аз аккаунт баромадед.",hello:"Салом",user:"корбар",authTitle:"Вуруд ба SomoniBank",authSubtitle:"Барои кушодани кабинет ва кор бо маълумоти backend API ворид шавед.",authLoginTab:"Вуруд",authRegisterTab:"Бақайдгирӣ",authMessageLogin:"Email ва пароли хизматрасонии backend-ро ворид намоед.",authMessageRegister:"Бақайдгирӣ корбари навро тавассути API /api/auth/register эҷод мекунад.",firstName:"Ном",lastName:"Насаб",phone:"Телефон",passport:"Шиноснома",address:"Суроға",password:"Рамз",signIn:"Вуруд",createAccount:"Эҷоди аккаунт",loginDone:"Вуруд анҷом ёфт.",registerDone:"Бақайдгирӣ анҷом ёфт. Акнун ворид шавед."}},K={ru:{"Частным лицам":"Частным лицам",Бизнесу:"Бизнесу",Сомонибанк:"Сомонибанк","Приложение Somoni":"Приложение Somoni",Карты:"Карты","Покупка авто":"Покупка авто","Somoni Shop":"Somoni Shop",Переводы:"Переводы",Депозиты:"Депозиты",Авиабилеты:"Авиабилеты","Ещё ▾":"Ещё ▾","Somonibank Business":"Somonibank Business","Зарплатный проект":"Зарплатный проект",Финансирование:"Финансирование","Продажи в рассрочку":"Продажи в рассрочку",Эквайринг:"Эквайринг","Расчётный счёт":"Расчётный счёт","Филиалы и точки обслуживания":"Филиалы и точки обслуживания",Приложения:"Приложения",Соцсети:"Соцсети",Подробнее:"Подробнее","Открыть счёт":"Открыть счёт","Открыть вклад":"Открыть вклад","Получить карту":"Получить карту",Обновить:"Обновить"},en:{"Частным лицам":"Individuals",Бизнесу:"Business",Сомонибанк:"Somonibank","Приложение Somoni":"Somoni App",Карты:"Cards","Покупка авто":"Car Purchase","Somoni Shop":"Somoni Shop",Переводы:"Transfers",Депозиты:"Deposits",Авиабилеты:"Air Tickets","Ещё ▾":"More ▾","Somonibank Business":"Somonibank Business","Зарплатный проект":"Payroll Project",Финансирование:"Financing","Продажи в рассрочку":"Installment Sales",Эквайринг:"Acquiring","Расчётный счёт":"Settlement Account","Филиалы и точки обслуживания":"Branches and service points",Приложения:"Applications",Соцсети:"Social",Подробнее:"Details","Открыть счёт":"Open account","Открыть вклад":"Open deposit","Получить карту":"Get card",Обновить:"Refresh"},tj:{"Частным лицам":"Шахсони воқеӣ",Бизнесу:"Бизнес",Сомонибанк:"Сомонибонк","Приложение Somoni":"Барномаи Somoni",Карты:"Кортҳо","Покупка авто":"Хариди авто","Somoni Shop":"Somoni Shop",Переводы:"Интиқолҳо",Депозиты:"Пасандозҳо",Авиабилеты:"Чиптаҳои ҳавоӣ","Ещё ▾":"Боз ▾","Somonibank Business":"Somonibank Business","Зарплатный проект":"Лоиҳаи музд",Финансирование:"Маблағгузорӣ","Продажи в рассрочку":"Фурӯш бо муҳлат",Эквайринг:"Эквайринг","Расчётный счёт":"Ҳисоби ҷорӣ","Филиалы и точки обслуживания":"Филиалҳо ва нуқтаҳои хизматрасонӣ",Приложения:"Барномаҳо",Соцсети:"Иҷтимоӣ",Подробнее:"Муфассал","Открыть счёт":"Кушодани ҳисоб","Открыть вклад":"Кушодани пасандоз","Получить карту":"Гирифтани корт",Обновить:"Навсозӣ"}};function V(t){try{return JSON.parse(t)}catch{return null}}function h(){const t=localStorage.getItem(R);return t&&w[t]?t:"ru"}function k(){return localStorage.getItem(O)==="dark"?"dark":"light"}function J(t){localStorage.setItem(R,t),f()}function Y(t){localStorage.setItem(O,t),T()}function c(){return w[h()]||w.ru}function X(t){const e=String(t||"").trim();return e?K[h()]?.[e]??t:t}function B(t,e){const o=String(t||""),n=o.match(/^\s*/)?.[0]||"",r=o.match(/\s*$/)?.[0]||"";return`${n}${e}${r}`}function g(){return V(localStorage.getItem(E)||"null")}function U(){return!!g()?.token}function Z(t){localStorage.setItem(E,JSON.stringify(t)),window.dispatchEvent(new CustomEvent("sbank:session-changed",{detail:t}))}function L(t=!1){localStorage.removeItem(E),window.dispatchEvent(new CustomEvent("sbank:session-changed",{detail:null})),t&&v(c().loggedOut)}function W(t,e){if(!t)return e;if(Array.isArray(t.Description)&&t.Description.length>0)return t.Description.join(" ");if(t.title)return t.detail?`${t.title} ${t.detail}`:t.title;if(t.errors){const o=Object.values(t.errors).flat();if(o.length>0)return o.join(" ")}return typeof t=="string"?t:e}async function I(t,e={}){const{method:o="GET",body:n,auth:r=!1,headers:a={}}=e,i=g(),d=u=>{const m=String(u||"").trim();if(!m||/^https?:\/\//i.test(m))return m;const p=String(nt||"").replace(/\/$/,""),l=m.startsWith("/")?m:`/${m}`;return`${p}${l}`},F=()=>({method:o,headers:{"Content-Type":"application/json",...r&&i?.token?{Authorization:`Bearer ${i.token}`}:{},...a},body:n===void 0?void 0:JSON.stringify(n)}),G=u=>{const m=d(u),p=[m];try{const l=new URL(m,window.location.origin),j=["localhost","127.0.0.1"].includes(l.hostname);j&&l.port==="5142"?p.push(`${l.protocol}//${l.hostname}:5000${l.pathname}${l.search}`):j&&l.port==="5000"&&p.push(`${l.protocol}//${l.hostname}:5142${l.pathname}${l.search}`)}catch{return p}return[...new Set(p)]};let b,q;const C=G(t);for(const u of C)try{b=await fetch(u,F()),u!==C[0]&&it(new URL(u).origin);break}catch(m){q=m}if(!b)throw q||new Error("Failed to fetch");const $=(b.headers.get("content-type")||"").includes("application/json")?await b.json():await b.text();if(!b.ok)throw b.status===401&&L(),new Error(W($,`Ошибка запроса: ${b.status}`));return $}function P(t){if(t&&typeof t=="object"&&("StatusCode"in t||"statusCode"in t)){const e=t.Data??t.data,o=Array.isArray(t.Description)?t.Description:Array.isArray(t.description)?t.description:[],n=t.StatusCode??t.statusCode??200;return{data:e,messages:o,statusCode:n}}return{data:t,messages:[],statusCode:200}}function dt(t,e=""){const o=Number(t||0),n=o.toLocaleString("ru-RU",{minimumFractionDigits:o%1===0?0:2,maximumFractionDigits:2});return e?`${n} ${e}`:n}function mt(t){return t?new Date(t).toLocaleString("ru-RU",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"Не указано"}function v(t){const e=document.getElementById("toast");e&&(e.textContent=t,e.classList.add("show"),clearTimeout(v.timer),v.timer=setTimeout(()=>e.classList.remove("show"),2200))}function Q(){if(document.getElementById("sb-global-ui-style"))return;const t=document.createElement("style");t.id="sb-global-ui-style",t.textContent=`
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
  `,document.head.appendChild(t)}function H(){document.querySelectorAll(".sb-location-link").forEach(t=>t.remove()),document.querySelectorAll(".sb-nav-bottom a").forEach(t=>{const e=t.textContent.trim().toLowerCase();(e==="салом"||e==="salom")&&t.remove()})}function tt(){const t=window.location.pathname.split("/").pop()||"index.html",e=z[t];e&&(document.title=e[h()]||e.ru)}function et(){document.querySelectorAll("body h1, body h2, body h3, body h4, body p, body span, body a, body button, body label, body strong").forEach(t=>{if(t.children.length>0)return;const e=t.dataset.sbBaseText||t.textContent.trim();if(!e)return;t.dataset.sbBaseText||(t.dataset.sbBaseText=e);const o=X(e);o!==e?t.textContent=B(t.textContent,o):h()==="ru"&&(t.textContent=B(t.textContent,e))})}function at(t){return t==="dark"?'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v2.2M12 18.8V21M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M3 12h2.2M18.8 12H21M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>':'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'}function N(){const t=c();document.querySelectorAll("[data-sb-theme-toggle]").forEach(e=>{e.innerHTML=at(k()),e.title=k()==="dark"?t.light:t.dark,e.setAttribute("aria-label",e.title)})}function T(){document.documentElement.dataset.sbTheme=k(),N()}function _(){if(!s)return;const t=c();s.querySelector("#sb-auth-title")?.replaceChildren(document.createTextNode(t.authTitle)),s.querySelector(".sb-modal-subtitle")?.replaceChildren(document.createTextNode(t.authSubtitle)),s.querySelector('[data-auth-tab="login"]')?.replaceChildren(document.createTextNode(t.authLoginTab)),s.querySelector('[data-auth-tab="register"]')?.replaceChildren(document.createTextNode(t.authRegisterTab)),s.querySelector('label[for="sb-login-password"]')?.replaceChildren(document.createTextNode(t.password)),s.querySelector('label[for="sb-register-firstName"]')?.replaceChildren(document.createTextNode(t.firstName)),s.querySelector('label[for="sb-register-lastName"]')?.replaceChildren(document.createTextNode(t.lastName)),s.querySelector('label[for="sb-register-phone"]')?.replaceChildren(document.createTextNode(t.phone)),s.querySelector('label[for="sb-register-passportNumber"]')?.replaceChildren(document.createTextNode(t.passport)),s.querySelector('label[for="sb-register-address"]')?.replaceChildren(document.createTextNode(t.address)),s.querySelector('label[for="sb-register-password"]')?.replaceChildren(document.createTextNode(t.password))}function S(){const t=document.querySelector(".sb-header-actions, .header-right, .top-actions, .header-actions");if(!t)return;let e=t.querySelector(".sb-global-controls");e||(e=document.createElement("div"),e.className="sb-global-controls",t.appendChild(e));const o=!document.querySelector(".sb-header-actions"),n=c(),r=g();o?e.innerHTML=`
      <button class="sb-theme-btn" type="button" data-sb-theme-toggle></button>
    `:e.innerHTML=`
      <select class="sb-lang-select" data-sb-lang>
        <option value="ru">Рус</option>
        <option value="en">Eng</option>
        <option value="tj">Тҷ</option>
      </select>
      ${r?`<a class="sb-cabinet-btn" href="somonibank-app.html"><span data-sb-cabinet-label>${n.cabinet}</span></a><button class="sb-theme-btn" type="button" data-sb-theme-toggle></button><button class="sb-logout-btn" type="button" data-sb-logout><span data-sb-logout-label>${n.logout}</span></button>`:`<a class="sb-login-btn" href="login.html"><span data-sb-login-label>${n.login}</span></a><button class="sb-theme-btn" type="button" data-sb-theme-toggle></button>`}
    `;const a=e.querySelector("[data-sb-lang]");a&&(a.value=h(),a.addEventListener("change",()=>J(a.value))),e.querySelector("[data-sb-logout]")?.addEventListener("click",()=>L(!0)),e.querySelector("[data-sb-theme-toggle]")?.addEventListener("click",()=>Y(k()==="dark"?"light":"dark")),N()}function y(){const t=document.querySelector(".sidebar-bottom .nav-list");if(!t)return;const e=t.querySelector("[data-sb-sidebar-logout]");if(!U()){e?.remove();return}if(e)return;const o=document.createElement("li");o.className="nav-item",o.dataset.sbSidebarLogout="true",o.innerHTML=`
    <a href="#" style="display:flex; align-items:center; gap:16px; color:inherit; width:100%;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="16 17 21 12 16 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="21" y1="12" x2="9" y2="12" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Выход</span>
    </a>
  `,o.querySelector("a")?.addEventListener("click",n=>{n.preventDefault(),L(!0),window.location.href="login.html"}),t.appendChild(o)}function f(){const t=c();document.documentElement.lang=h()==="tj"?"tg":h(),H(),tt(),et(),document.querySelectorAll(".sb-lang-select").forEach(e=>{e.value=h()}),document.querySelectorAll("[data-sb-login-label]").forEach(e=>{e.textContent=t.login}),document.querySelectorAll("[data-sb-cabinet-label]").forEach(e=>{e.textContent=t.cabinet}),document.querySelectorAll("[data-sb-logout-label]").forEach(e=>{e.textContent=t.logout}),_(),N()}function A(){if(M){S(),y(),T(),f();return}M=!0,Q(),H(),S(),y(),T(),f(),window.addEventListener("sbank:session-changed",()=>{S(),y(),f()})}function rt(){if(s)return _(),s;const t=c();s=document.createElement("div"),s.className="sb-modal-backdrop",s.hidden=!0,s.innerHTML=`
    <div class="sb-modal" role="dialog" aria-modal="true" aria-labelledby="sb-auth-title">
      <div class="sb-modal-head">
        <div>
          <h2 class="sb-modal-title" id="sb-auth-title">${t.authTitle}</h2>
          <p class="sb-modal-subtitle">${t.authSubtitle}</p>
        </div>
        <button class="sb-ghost-btn sb-modal-close" type="button" data-auth-close>&times;</button>
      </div>
      <div class="sb-tab-row">
        <button class="sb-tab-btn active" type="button" data-auth-tab="login">${t.authLoginTab}</button>
        <button class="sb-tab-btn" type="button" data-auth-tab="register">${t.authRegisterTab}</button>
      </div>
      <div class="sb-stack">
        <div class="sb-message info" data-auth-message>${t.authMessageLogin}</div>
        <form data-auth-form="login">
          <div class="sb-form-grid">
            <div class="sb-field sb-field-full">
              <label for="sb-login-email">Email</label>
              <input id="sb-login-email" name="email" type="email" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-login-password">${t.password}</label>
              <input id="sb-login-password" name="password" type="password" required>
            </div>
          </div>
          <div class="sb-cta" style="margin-top:18px;">
            <button class="sb-btn" type="submit">${t.signIn}</button>
          </div>
        </form>
        <form data-auth-form="register" hidden>
          <div class="sb-form-grid">
            <div class="sb-field">
              <label for="sb-register-firstName">${t.firstName}</label>
              <input id="sb-register-firstName" name="firstName" type="text" required>
            </div>
            <div class="sb-field">
              <label for="sb-register-lastName">${t.lastName}</label>
              <input id="sb-register-lastName" name="lastName" type="text" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-register-email">Email</label>
              <input id="sb-register-email" name="email" type="email" required>
            </div>
            <div class="sb-field">
              <label for="sb-register-phone">${t.phone}</label>
              <input id="sb-register-phone" name="phone" type="text" placeholder="+992..." required>
            </div>
            <div class="sb-field">
              <label for="sb-register-passportNumber">${t.passport}</label>
              <input id="sb-register-passportNumber" name="passportNumber" type="text" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-register-address">${t.address}</label>
              <input id="sb-register-address" name="address" type="text" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-register-password">${t.password}</label>
              <input id="sb-register-password" name="password" type="password" minlength="6" required>
            </div>
          </div>
          <div class="sb-cta" style="margin-top:18px;">
            <button class="sb-btn" type="submit">${t.createAccount}</button>
          </div>
        </form>
      </div>
    </div>
  `,document.body.appendChild(s),s.addEventListener("click",r=>{(r.target===s||r.target.closest("[data-auth-close]"))&&D()});const e=s.querySelectorAll("[data-auth-form]"),o=s.querySelectorAll("[data-auth-tab]"),n=s.querySelector("[data-auth-message]");return o.forEach(r=>{r.addEventListener("click",()=>{const a=r.dataset.authTab;o.forEach(i=>i.classList.toggle("active",i===r)),e.forEach(i=>{i.hidden=i.dataset.authForm!==a}),n.className="sb-message info",n.textContent=a==="login"?c().authMessageLogin:c().authMessageRegister})}),s.querySelector('[data-auth-form="login"]').addEventListener("submit",async r=>{r.preventDefault();const a=r.currentTarget,i=a.querySelector('button[type="submit"]');i.disabled=!0;try{const d=P(await I("/api/auth/login",{method:"POST",body:{email:a.email.value.trim(),password:a.password.value}}));Z(d.data),n.className="sb-message success",n.textContent=d.messages[0]||c().loginDone,v(`${c().hello}, ${d.data.fullName||d.data.FullName||c().user}!`),D(),x?.(g()),x=null}catch(d){n.className="sb-message error",n.textContent=d.message}finally{i.disabled=!1}}),s.querySelector('[data-auth-form="register"]').addEventListener("submit",async r=>{r.preventDefault();const a=r.currentTarget,i=a.querySelector('button[type="submit"]');i.disabled=!0;try{const d=P(await I("/api/auth/register",{method:"POST",body:{firstName:a.firstName.value.trim(),lastName:a.lastName.value.trim(),email:a.email.value.trim(),password:a.password.value,phone:a.phone.value.trim(),address:a.address.value.trim(),passportNumber:a.passportNumber.value.trim()}}));n.className="sb-message success",n.textContent=d.messages[0]||c().registerDone,s.querySelector('[data-auth-tab="login"]').click(),s.querySelector("#sb-login-email").value=a.email.value.trim(),a.reset()}catch(d){n.className="sb-message error",n.textContent=d.message}finally{i.disabled=!1}}),s}function ot(t="login",e=null){const o=rt();x=e,o.hidden=!1,o.querySelector(`[data-auth-tab="${t}"]`)?.click()}function D(){s&&(s.hidden=!0)}function ct(t,e="login"){if(U()){t(g());return}ot(e,t)}function bt(){A()}function ht(t,e){return`<div class="sb-message ${t}">${e}</div>`}const st=`${location.protocol}//${location.hostname}:5142`,nt=localStorage.getItem("sbank-api-base-url")||window.SBANK_API_BASE_URL||st;function it(t){if(!t){localStorage.removeItem("sbank-api-base-url");return}localStorage.setItem("sbank-api-base-url",String(t))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",A,{once:!0}):A();export{nt as A,I as a,mt as b,Z as c,L as d,ht as e,dt as f,g,U as i,bt as m,ot as o,ct as r,v as s,P as u};
