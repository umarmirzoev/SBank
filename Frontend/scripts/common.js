const STORAGE_KEY = "sbank-session";

let authModal;
let authSuccessHandler = null;

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
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
    showToast("Вы вышли из аккаунта.");
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

  const response = await fetch(resolveUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth && session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

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
  if (payload && typeof payload === "object" && "StatusCode" in payload) {
    return {
      data: payload.Data,
      messages: Array.isArray(payload.Description) ? payload.Description : [],
      statusCode: payload.StatusCode
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

function createAuthModal() {
  if (authModal) {
    return authModal;
  }

  authModal = document.createElement("div");
  authModal.className = "sb-modal-backdrop";
  authModal.hidden = true;
  authModal.innerHTML = `
    <div class="sb-modal" role="dialog" aria-modal="true" aria-labelledby="sb-auth-title">
      <div class="sb-modal-head">
        <div>
          <h2 class="sb-modal-title" id="sb-auth-title">Вход в SomoniBank</h2>
          <p class="sb-modal-subtitle">Авторизуйтесь, чтобы открыть личный кабинет и работать с данными из backend API.</p>
        </div>
        <button class="sb-ghost-btn sb-modal-close" type="button" data-auth-close>&times;</button>
      </div>
      <div class="sb-tab-row">
        <button class="sb-tab-btn active" type="button" data-auth-tab="login">Вход</button>
        <button class="sb-tab-btn" type="button" data-auth-tab="register">Регистрация</button>
      </div>
      <div class="sb-stack">
        <div class="sb-message info" data-auth-message>Введите email и пароль от backend-сервиса.</div>
        <form data-auth-form="login">
          <div class="sb-form-grid">
            <div class="sb-field sb-field-full">
              <label for="sb-login-email">Email</label>
              <input id="sb-login-email" name="email" type="email" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-login-password">Пароль</label>
              <input id="sb-login-password" name="password" type="password" required>
            </div>
          </div>
          <div class="sb-cta" style="margin-top:18px;">
            <button class="sb-btn" type="submit">Войти</button>
          </div>
        </form>
        <form data-auth-form="register" hidden>
          <div class="sb-form-grid">
            <div class="sb-field">
              <label for="sb-register-firstName">Имя</label>
              <input id="sb-register-firstName" name="firstName" type="text" required>
            </div>
            <div class="sb-field">
              <label for="sb-register-lastName">Фамилия</label>
              <input id="sb-register-lastName" name="lastName" type="text" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-register-email">Email</label>
              <input id="sb-register-email" name="email" type="email" required>
            </div>
            <div class="sb-field">
              <label for="sb-register-phone">Телефон</label>
              <input id="sb-register-phone" name="phone" type="text" placeholder="+992..." required>
            </div>
            <div class="sb-field">
              <label for="sb-register-passportNumber">Паспорт</label>
              <input id="sb-register-passportNumber" name="passportNumber" type="text" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-register-address">Адрес</label>
              <input id="sb-register-address" name="address" type="text" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-register-password">Пароль</label>
              <input id="sb-register-password" name="password" type="password" minlength="6" required>
            </div>
          </div>
          <div class="sb-cta" style="margin-top:18px;">
            <button class="sb-btn" type="submit">Создать аккаунт</button>
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
        ? "Введите email и пароль от backend-сервиса."
        : "Регистрация создаст нового пользователя через API /api/auth/register.";
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
      messageBox.textContent = response.messages[0] || "Вход выполнен.";
      showToast(`Здравствуйте, ${response.data.fullName || response.data.FullName || "пользователь"}!`);
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
      messageBox.textContent = response.messages[0] || "Регистрация завершена. Теперь войдите.";
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
  const host = document.querySelector(".header-right");
  if (!host || host.querySelector(".sb-auth-controls")) {
    return;
  }

  const controls = document.createElement("div");
  controls.className = "sb-auth-controls";
  host.appendChild(controls);

  function render() {
    const session = getSession();
    if (!session) {
      controls.innerHTML = `
        <button class="sb-ghost-btn" type="button" data-action="login">Войти</button>
        <a class="sb-btn" href="somonibank-app.html">Кабинет</a>
      `;
      controls.querySelector('[data-action="login"]').addEventListener("click", () => openAuthModal("login"));
      return;
    }

    controls.innerHTML = `
      <span class="sb-auth-greeting">${session.fullName || session.FullName || "Пользователь"}</span>
      <a class="sb-ghost-btn" href="somonibank-app.html">Кабинет</a>
      <button class="sb-btn" type="button" data-action="logout">Выйти</button>
    `;
    controls.querySelector('[data-action="logout"]').addEventListener("click", () => clearSession(true));
  }

  render();
  window.addEventListener("sbank:session-changed", render);
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
