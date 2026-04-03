import { apiRequest, setSession, showToast, unwrapResponse } from "./common.js";

const SAVED_CREDENTIALS_KEY = "sbank-login-credentials";
const DEV_DEFAULT_CREDENTIALS = {
  phone: "+992979117007",
  password: "gumarjon.1711"
};

const form = document.getElementById("loginForm");
const status = document.getElementById("loginStatus");
const registerLink = document.getElementById("registerLink");
const forgotLink = document.getElementById("forgotLink");
const params = new URLSearchParams(window.location.search);
const redirectTarget = params.get("redirect") || "bank.html";
const isLocalDevHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

function loadSavedCredentials() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_CREDENTIALS_KEY) || "null");
  } catch {
    return null;
  }
}

function saveCredentials(phone, password) {
  localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify({
    phone,
    password
  }));
}

function applyInitialCredentials() {
  if (!form) {
    return;
  }

  const savedCredentials = loadSavedCredentials();
  const initialCredentials = savedCredentials || (isLocalDevHost ? DEV_DEFAULT_CREDENTIALS : null);

  if (!form.phone.value && initialCredentials?.phone) {
    form.phone.value = initialCredentials.phone;
  }

  if (!form.password.value && initialCredentials?.password) {
    form.password.value = initialCredentials.password;
  }
}

if (params.get("email")) {
  form.phone.value = params.get("email");
}

if (params.get("registered") === "1") {
  status.className = "status success";
  status.textContent = "Регистрация завершена. Теперь войдите в систему.";
}

applyInitialCredentials();

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  const rawPhone = form.phone.value.trim();
  const password = form.password.value;

  status.className = "status";
  status.textContent = "Выполняем вход...";
  submitButton.disabled = true;

  try {
    const response = unwrapResponse(await apiRequest("/api/auth/login", {
      method: "POST",
      body: {
        email: rawPhone,
        password
      }
    }));

    setSession(response.data);
    saveCredentials(rawPhone, password);
    status.className = "status success";
    status.textContent = response.messages[0] || "Вход успешен.";
    showToast("Вход успешен.");

    setTimeout(() => {
      window.location.href = redirectTarget;
    }, 450);
  } catch (error) {
    status.className = "status error";
    status.textContent = error.message || "Не удалось выполнить вход.";
  } finally {
    submitButton.disabled = false;
  }
});

registerLink?.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "registration.html";
});

forgotLink?.addEventListener("click", (event) => {
  event.preventDefault();
  status.className = "status";
  status.textContent = "Для восстановления пароля обратитесь в поддержку банка.";
});
