import { apiRequest, setSession, showToast, unwrapResponse } from "./common.js";

const form = document.getElementById("loginForm");
const status = document.getElementById("loginStatus");
const registerLink = document.getElementById("registerLink");
const forgotLink = document.getElementById("forgotLink");
const params = new URLSearchParams(window.location.search);

if (params.get("email")) {
  form.phone.value = params.get("email");
}

if (params.get("registered") === "1") {
  status.className = "status success";
  status.textContent = "Регистрация завершена. Теперь войдите в систему.";
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  const rawPhone = form.phone.value.trim();
  const password = form.password.value;
  const emailCandidate = rawPhone.includes("@") ? rawPhone : `${rawPhone.replace(/[^\d+]/g, "").replace(/^\+/, "")}@sbank.local`;

  status.className = "status";
  status.textContent = "Выполняем вход...";
  submitButton.disabled = true;

  try {
    const response = unwrapResponse(await apiRequest("/api/auth/login", {
      method: "POST",
      body: {
        email: emailCandidate,
        password
      }
    }));

    setSession(response.data);
    status.className = "status success";
    status.textContent = response.messages[0] || "Вход выполнен успешно.";
    showToast("Вход выполнен.");
    setTimeout(() => {
      window.location.href = "somonibank-app.html";
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
