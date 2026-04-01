import { mountHeaderAuth, showToast } from "./common.js";

mountHeaderAuth();

document.querySelectorAll("[data-toast]").forEach((element) => {
  element.addEventListener("click", (event) => {
    if (element.getAttribute("href") === "#") {
      event.preventDefault();
    }
    showToast(element.dataset.toast);
  });
});

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.scrollTarget);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const priceInput = document.getElementById("auto-price");
const downPaymentInput = document.getElementById("auto-down-payment");
const termInput = document.getElementById("auto-term-range");
const currencyInputs = document.querySelectorAll('input[name="auto-currency"]');

const priceValue = document.getElementById("auto-price-value");
const downPaymentValue = document.getElementById("auto-down-payment-value");
const financedValue = document.getElementById("auto-financed-value");
const termValue = document.getElementById("auto-term-range-value");
const monthlyValue = document.getElementById("auto-monthly");
const overpaymentValue = document.getElementById("auto-overpayment");

const rateValue = document.getElementById("auto-rate");
const annualRate = 0.23;
const usdRate = 10.92;

function selectedCurrency() {
  return document.querySelector('input[name="auto-currency"]:checked')?.value || "TJS";
}

function formatMoney(value) {
  const currency = selectedCurrency();
  const numeric = currency === "USD" ? value / usdRate : value;
  const digits = currency === "USD" ? 2 : (Number.isInteger(numeric) ? 0 : 1);
  const symbol = currency === "USD" ? "$" : "с.";
  return `${numeric.toLocaleString("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${symbol}`;
}

function paintRange(input) {
  if (!input) {
    return;
  }

  const min = Number(input.min);
  const max = Number(input.max);
  const value = Number(input.value);
  const percent = ((value - min) / (max - min)) * 100;
  input.style.background = `linear-gradient(90deg, #2f7df6 ${percent}%, #cfdbed ${percent}%)`;
}

function updateCalculator() {
  if (!priceInput || !downPaymentInput || !termInput) {
    return;
  }

  const price = Number(priceInput.value);
  const minDownPayment = 0; // поддержка 100% финансирования (нулевой первый взнос)
  const maxDownPayment = price; // вплоть до полной стоимости автомобиля

  downPaymentInput.min = String(minDownPayment);
  downPaymentInput.max = String(maxDownPayment);

  let downPayment = Number(downPaymentInput.value);
  if (downPayment < minDownPayment) {
    downPayment = minDownPayment;
    downPaymentInput.value = String(downPayment);
  }
  if (downPayment > maxDownPayment) {
    downPayment = maxDownPayment;
    downPaymentInput.value = String(downPayment);
  }

  const financed = Math.max(price - downPayment, 0);
  const months = Number(termInput.value);
  const monthlyRate = annualRate / 12;
  const monthlyPayment = financed > 0
    ? (financed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
    : 0;
  const totalPaid = monthlyPayment * months;
  const overpayment = Math.max(totalPaid - financed, 0);

  priceValue.textContent = formatMoney(price);
  downPaymentValue.textContent = formatMoney(downPayment);
  financedValue.textContent = formatMoney(financed);
  termValue.textContent = String(months);
  monthlyValue.textContent = formatMoney(monthlyPayment);
  overpaymentValue.textContent = formatMoney(overpayment);
  rateValue.textContent = `${Math.round(annualRate * 100)}%`;

  [priceInput, downPaymentInput, termInput].forEach(paintRange);
}

[priceInput, downPaymentInput, termInput].forEach((input) => {
  input?.addEventListener("input", updateCalculator);
  paintRange(input);
});

currencyInputs.forEach((input) => input.addEventListener("change", updateCalculator));

const form = document.getElementById("auto-form");
const steps = Array.from(document.querySelectorAll(".form-step"));
const progress = document.getElementById("step-progress");
const stepCaption = document.getElementById("step-caption");
const stepIndexLabel = document.getElementById("step-index-label");
const prevButton = document.getElementById("prev-step");
const nextButton = document.getElementById("next-step");
const submitButton = document.getElementById("submit-step");
const reviewNodes = document.querySelectorAll("[data-review]");
let currentStep = 0;

function updateReview() {
  if (!form) {
    return;
  }

  const data = new FormData(form);
  const map = {
    name: data.get("name"),
    phone: data.get("phone"),
    city: data.get("city"),
    category: data.get("category"),
    budget: data.get("budget"),
    term: data.get("term")
  };

  reviewNodes.forEach((node) => {
    node.textContent = map[node.dataset.review] || "Не указано";
  });
}

function showStep(index) {
  currentStep = index;
  steps.forEach((step, stepIndex) => {
    step.classList.toggle("active", stepIndex === currentStep);
  });

  const activeStep = steps[currentStep];
  const total = steps.length;
  stepCaption.textContent = activeStep.dataset.title || "";
  stepIndexLabel.textContent = `Шаг ${currentStep + 1} из ${total}`;
  progress.style.width = `${((currentStep + 1) / total) * 100}%`;
  prevButton.hidden = currentStep === 0;
  nextButton.hidden = currentStep === total - 1;
  submitButton.hidden = currentStep !== total - 1;

  if (currentStep === total - 1) {
    updateReview();
  }
}

function validateStep(index) {
  const activeStep = steps[index];
  const fields = Array.from(activeStep.querySelectorAll("input, select, textarea"));
  for (const field of fields) {
    if (!field.reportValidity()) {
      return false;
    }
  }
  return true;
}

nextButton?.addEventListener("click", () => {
  if (!validateStep(currentStep)) {
    return;
  }
  showStep(Math.min(currentStep + 1, steps.length - 1));
});

prevButton?.addEventListener("click", () => {
  showStep(Math.max(currentStep - 1, 0));
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateStep(currentStep)) {
    return;
  }

  const data = new FormData(form);
  const name = data.get("name")?.toString().trim() || "клиент";
  const category = data.get("category")?.toString() || "авто";
  showToast(`Заявка на "${category}" отправлена. Спасибо, ${name}!`);
  form.reset();
  showStep(0);
  updateCalculator();
});

document.querySelectorAll(".faq-item").forEach((item) => {
  const button = item.querySelector(".faq-toggle");
  button?.addEventListener("click", () => {
    item.classList.toggle("open");
  });
});

showStep(0);
updateCalculator();
