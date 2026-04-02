import { API_BASE_URL, showToast, unwrapResponse } from "./common.js";

const form = document.getElementById("registrationForm");
const status = document.getElementById("registrationStatus");
const progressLine = document.getElementById("progressLine");
const stepCaption = document.getElementById("stepCaption");
const stepTitle = document.getElementById("stepTitle");
const stepDescription = document.getElementById("stepDescription");
const panels = Array.from(document.querySelectorAll("[data-step-panel]"));
const markers = Array.from(document.querySelectorAll("[data-step-marker]"));
const nextButtons = Array.from(document.querySelectorAll("[data-next-step]"));
const prevButtons = Array.from(document.querySelectorAll("[data-prev-step]"));
const summaryPersonal = document.getElementById("summaryPersonal");
const summaryDocuments = document.getElementById("summaryDocuments");
const summaryAccount = document.getElementById("summaryAccount");
const submitButton = document.getElementById("submitRegistration");
const termsAccepted = document.getElementById("termsAccepted");

const stepMeta = {
  1: { caption: "Шаг 1 из 4", title: "Личные данные", description: "Введите ваши персональные данные точно как в паспорте" },
  2: { caption: "Шаг 2 из 4", title: "Документы", description: "Загрузите фотографии паспорта и сделайте селфи для верификации личности" },
  3: { caption: "Шаг 3 из 4", title: "Данные аккаунта", description: "Создайте надежный пароль и укажите email для входа в банк" },
  4: { caption: "Шаг 4 из 4", title: "Подтверждение", description: "Проверьте данные перед отправкой заявки" }
};

let currentStep = 1;

function setStatus(message = "", kind = "") {
  status.className = kind ? `status ${kind}` : "status";
  status.textContent = message;
}

function formatBirthDate(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  const parts = [];
  if (digits.length > 0) parts.push(digits.slice(0, 2));
  if (digits.length >= 3) parts.push(digits.slice(2, 4));
  if (digits.length >= 5) parts.push(digits.slice(4, 8));
  return parts.join(" / ");
}

function renderSummaryItem(label, value, extraClass = "") {
  return `<div class="summary-item"><strong>${label}</strong><span class="summary-value ${extraClass}">${value || "Не указано"}</span></div>`;
}

function updateUploadState(input) {
  const label = document.querySelector(`[data-upload-label][for="${input.id}"]`);
  const text = document.querySelector(`[data-upload-text="${input.id}"]`);
  const file = input.files?.[0];
  if (!label || !text) return;
  if (file) {
    label.classList.add("is-complete");
    text.textContent = file.name;
  } else {
    label.classList.remove("is-complete");
    text.textContent = input.id === "selfieWithPassport" ? "Нажмите, чтобы прикрепить фото" : "Нажмите, чтобы прикрепить файл";
  }
}

function updateSummary() {
  summaryPersonal.innerHTML = [
    renderSummaryItem("Телефон", form.phone.value.trim() || "Не указано", "success"),
    renderSummaryItem("Имя", form.firstName.value.trim()),
    renderSummaryItem("Отчество", form.middleName.value.trim()),
    renderSummaryItem("Пол", form.gender.value),
    renderSummaryItem("Дата рождения", form.birthDate.value.trim()),
    renderSummaryItem("Паспорт", form.passportNumber.value.trim()),
    renderSummaryItem("Адрес", form.address.value.trim())
  ].join("");

  summaryDocuments.innerHTML = [
    renderSummaryItem("Паспорт (перед)", form.passportFront.files?.[0]?.name),
    renderSummaryItem("Паспорт (зад)", form.passportBack.files?.[0]?.name),
    renderSummaryItem("Селфи", form.selfieWithPassport.files?.[0]?.name)
  ].join("");

  summaryAccount.innerHTML = [
    renderSummaryItem("Email", form.email.value.trim()),
    renderSummaryItem("Пароль", form.password.value ? "••••••••" : "Не указано", form.password.value ? "masked" : ""),
    renderSummaryItem("Код", form.inviteCode.value.trim() || "Без кода")
  ].join("");
}

function goToStep(step) {
  currentStep = step;
  panels.forEach((panel) => { panel.hidden = Number(panel.dataset.stepPanel) !== step; });
  markers.forEach((marker) => {
    const markerStep = Number(marker.dataset.stepMarker);
    marker.classList.toggle("active", markerStep === step);
    marker.classList.toggle("done", markerStep < step);
    marker.querySelector(".step-circle").textContent = markerStep < step ? "✓" : String(markerStep);
  });
  const width = step === 1 ? 0 : ((step - 1) / 3) * 100;
  progressLine.style.width = `calc(${width}% - ${width === 0 ? 0 : 46}px)`;
  stepCaption.textContent = stepMeta[step].caption;
  stepTitle.textContent = stepMeta[step].title;
  stepDescription.textContent = stepMeta[step].description;
  if (step === 4) updateSummary();
  setStatus("");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateStep(step) {
  if (step === 1) {
    const required = [form.phone, form.firstName, form.middleName, form.gender, form.birthDate, form.passportNumber, form.address];
    const firstInvalid = required.find((field) => !field.value.trim());
    if (firstInvalid) {
      firstInvalid.focus();
      setStatus("Заполните все поля личных данных.", "error");
      return false;
    }
    if (form.birthDate.value.replace(/\D/g, "").length !== 8) {
      form.birthDate.focus();
      setStatus("Введите дату рождения в формате ДД / ММ / ГГГГ.", "error");
      return false;
    }
  }
  if (step === 2) {
    const fileInputs = [form.passportFront, form.passportBack, form.selfieWithPassport];
    const missing = fileInputs.find((input) => !input.files?.length);
    if (missing) {
      missing.click();
      setStatus("Загрузите все документы перед переходом дальше.", "error");
      return false;
    }
  }
  if (step === 3) {
    const required = [form.email, form.password, form.confirmPassword];
    const firstInvalid = required.find((field) => !field.value.trim());
    if (firstInvalid) {
      firstInvalid.focus();
      setStatus("Заполните email и пароль.", "error");
      return false;
    }
    if (form.password.value.length < 8) {
      form.password.focus();
      setStatus("Пароль должен содержать минимум 8 символов.", "error");
      return false;
    }
    if (form.password.value !== form.confirmPassword.value) {
      form.confirmPassword.focus();
      setStatus("Пароли не совпадают.", "error");
      return false;
    }
  }
  if (step === 4 && !termsAccepted.checked) {
    termsAccepted.focus();
    setStatus("Подтвердите согласие с условиями использования.", "error");
    return false;
  }
  setStatus("");
  return true;
}

function buildRegisterPayload() {
  const phoneDigits = form.phone.value.replace(/\D/g, "");
  const payload = new FormData();
  payload.append("firstName", form.firstName.value.trim());
  payload.append("lastName", form.middleName.value.trim() || form.firstName.value.trim());
  payload.append("middleName", form.middleName.value.trim());
  payload.append("email", `${phoneDigits}@sbank.local`);
  payload.append("password", form.password.value);
  payload.append("phone", form.phone.value.trim());
  payload.append("address", form.address.value.trim());
  payload.append("passportNumber", form.passportNumber.value.trim());
  payload.append("gender", form.gender.value);
  payload.append("birthDate", form.birthDate.value.trim());
  payload.append("nationalIdNumber", form.passportNumber.value.trim());
  payload.append("passportFront", form.passportFront.files[0]);
  payload.append("passportBack", form.passportBack.files[0]);
  payload.append("selfieWithPassport", form.selfieWithPassport.files[0]);
  return payload;
}

form.birthDate?.addEventListener("input", (event) => {
  event.target.value = formatBirthDate(event.target.value);
});

["passportFront", "passportBack", "selfieWithPassport"].forEach((id) => {
  const input = document.getElementById(id);
  input?.addEventListener("change", () => {
    updateUploadState(input);
    if (currentStep === 4) updateSummary();
  });
});

nextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!validateStep(currentStep)) return;
    goToStep(Math.min(4, currentStep + 1));
  });
});

prevButtons.forEach((button) => {
  button.addEventListener("click", () => {
    goToStep(Math.max(1, currentStep - 1));
  });
});

form.addEventListener("input", () => {
  if (currentStep === 4) updateSummary();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateStep(4)) return;
  const payload = buildRegisterPayload();
  submitButton.disabled = true;
  setStatus("Создаём аккаунт...");
  try {
    const response = await fetch(`${String(API_BASE_URL).replace(/\/$/, "")}/api/auth/register-with-kyc`, {
      method: "POST",
      body: payload
    });
    const raw = await response.json();
    if (!response.ok) {
      throw new Error(Array.isArray(raw?.Description) ? raw.Description.join(" ") : "Не удалось завершить регистрацию.");
    }
    const result = unwrapResponse(raw);
    setStatus(result.messages[0] || "Аккаунт успешно создан. Теперь войдите в систему.", "success");
    showToast("Регистрация завершена");
    setTimeout(() => {
      const phone = encodeURIComponent(form.phone.value.trim());
      window.location.href = `login.html?email=${phone}&registered=1`;
    }, 700);
  } catch (error) {
    setStatus(error.message || "Не удалось завершить регистрацию.", "error");
  } finally {
    submitButton.disabled = false;
  }
});

goToStep(1);
