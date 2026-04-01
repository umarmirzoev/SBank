import { formatMoney, mountHeaderAuth, requireAuth, showToast } from "./common.js";

mountHeaderAuth();

const amountInput = document.getElementById("finance-amount");
const termInput = document.getElementById("finance-term");
const amountValue = document.getElementById("finance-amount-value");
const termValue = document.getElementById("finance-term-value");
const monthlyValue = document.getElementById("finance-monthly");
const overpayValue = document.getElementById("finance-overpay");
const rateValue = document.getElementById("finance-rate");

function updateRangeBackground(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = Number(input.value || min);
  const percent = ((value - min) / (max - min)) * 100;
  input.style.background = `linear-gradient(90deg, #2f8ef2 ${percent}%, #d6e4f7 ${percent}%)`;
}

function getSelectedCurrency() {
  return document.querySelector('input[name="fin-currency"]:checked')?.value || "TJS";
}

function calculateFinance() {
  const amount = Number(amountInput.value || 0);
  const months = Number(termInput.value || 12);
  const currency = getSelectedCurrency();
  const yearlyRate = currency === "USD" ? 13 : 22;
  const monthlyRate = yearlyRate / 100 / 12;
  const monthlyPayment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  const totalPaid = monthlyPayment * months;
  const overpay = totalPaid - amount;
  const suffix = currency === "USD" ? "$" : "с.";

  amountValue.textContent = `${formatMoney(amount)} ${suffix}`;
  termValue.textContent = String(months);
  monthlyValue.textContent = `${formatMoney(monthlyPayment)} ${suffix}`;
  overpayValue.textContent = `${formatMoney(overpay)} ${suffix}`;
  rateValue.textContent = `${yearlyRate}%`;

  updateRangeBackground(amountInput);
  updateRangeBackground(termInput);
}

document.querySelectorAll("[data-toast]").forEach((element) => {
  element.addEventListener("click", (event) => {
    if (element.getAttribute("href") === "#") {
      event.preventDefault();
    }
    showToast(element.dataset.toast);
  });
});

document.querySelectorAll("[data-scroll-target]").forEach((element) => {
  element.addEventListener("click", () => {
    document.getElementById(element.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll("[data-mini]").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll("[data-mini]").forEach((item) => {
      item.classList.toggle("active", item === card);
    });
  });
});

document.querySelectorAll(".faq-item").forEach((item) => {
  item.querySelector(".faq-button")?.addEventListener("click", () => {
    item.classList.toggle("open");
  });
});

document.querySelectorAll('input[name="fin-currency"]').forEach((input) => {
  input.addEventListener("change", calculateFinance);
});

amountInput?.addEventListener("input", calculateFinance);
termInput?.addEventListener("input", calculateFinance);

document.querySelector("[data-submit-financing]")?.addEventListener("click", () => {
  requireAuth(() => {
    const company = document.getElementById("fin-company")?.value.trim();
    const inn = document.getElementById("fin-inn")?.value.trim();
    const phone = document.getElementById("fin-phone")?.value.trim();

    if (!company || !inn || !phone) {
      showToast("Заполните название компании, ИНН и телефон.");
      return;
    }

    showToast("Заявка на финансирование отправлена.");
  });
});

calculateFinance();
