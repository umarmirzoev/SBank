import {
  apiRequest,
  mountHeaderAuth,
  requireAuth,
  showToast
} from "./common.js";

mountHeaderAuth();

document.querySelectorAll("[data-toast]").forEach((element) => {
  element.addEventListener("click", (event) => {
    if (element.getAttribute("href") === "#") {
      event.preventDefault();
    }
    showToast(element.dataset.toast);
  });
});

document.querySelectorAll(".hero button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".rates-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll(".rate-tab").forEach((tab) => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelectorAll(".rate-tab").forEach((item) => item.classList.toggle("active", item === tab));
    if (tab.dataset.tab === "rates") {
      document.querySelector(".rates-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (tab.dataset.toast) {
      showToast(tab.dataset.toast);
    }
  });
});

const tableBody = document.getElementById("ratesTableBody");
const receiveAmount = document.getElementById("receiveAmount");
const payAmount = document.getElementById("payAmount");
const receiveCurrency = document.getElementById("receiveCurrency");
const payCurrency = document.getElementById("payCurrency");

async function loadRates() {
  try {
    const latest = await apiRequest("/api/exchange-rates/latest");
    const rows = ["USD", "EUR", "RUB"];

    tableBody.innerHTML = rows.map((currencyCode) => {
      const rate = latest.rates.find((item) => item.currencyCode === currencyCode || item.CurrencyCode === currencyCode);
      const value = Number(rate?.rate ?? rate?.Rate ?? 0);
      const flagClass = currencyCode.toLowerCase();
      return `
        <tr data-currency="${currencyCode}">
          <td><div class="currency-cell"><span class="flag ${flagClass}"></span><span>1 ${currencyCode}</span></div></td>
          <td>${value.toFixed(4)}</td>
          <td>${value.toFixed(4)}</td>
        </tr>
      `;
    }).join("");

    const footer = document.querySelector(".rates-footer");
    if (footer) {
      footer.innerHTML = `
        <span>Дата курса: ${new Date(latest.rateDate || latest.RateDate).toLocaleDateString("ru-RU")}</span>
        <span>Источник: ${latest.source || latest.Source}</span>
      `;
    }
  } catch (error) {
    showToast(error.message);
  }
}

function formatAmount(value) {
  return Number(value || 0).toFixed(4).replace(/\.?0+$/, "");
}

async function convert(from, to, amount) {
  const result = await apiRequest(`/api/exchange-rates/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`);
  return result.convertedAmount || result.ConvertedAmount || 0;
}

async function convertFromPay() {
  try {
    receiveAmount.value = formatAmount(await convert(payCurrency.value, receiveCurrency.value, Number(payAmount.value || 0)));
  } catch (error) {
    showToast(error.message);
  }
}

async function convertFromReceive() {
  try {
    payAmount.value = formatAmount(await convert(receiveCurrency.value, payCurrency.value, Number(receiveAmount.value || 0)));
  } catch (error) {
    showToast(error.message);
  }
}

receiveAmount?.addEventListener("input", () => void convertFromReceive());
payAmount?.addEventListener("input", () => void convertFromPay());
receiveCurrency?.addEventListener("change", () => void convertFromPay());
payCurrency?.addEventListener("change", () => void convertFromPay());

document.getElementById("swapButton")?.addEventListener("click", () => {
  const nextReceiveCurrency = payCurrency.value;
  payCurrency.value = receiveCurrency.value;
  receiveCurrency.value = nextReceiveCurrency;

  const nextReceiveAmount = payAmount.value;
  payAmount.value = receiveAmount.value;
  receiveAmount.value = nextReceiveAmount;
  void convertFromPay();
});

document.querySelectorAll("#rateMode .rate-filter, #rateMiniMode .mini-filter, #directionSwitch button").forEach((button) => {
  button.addEventListener("click", () => {
    button.parentElement?.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    showToast("Курсы и конвертация обновлены по данным backend API.");
    void loadRates();
    void convertFromPay();
  });
});

document.getElementById("sendMoneyButton")?.addEventListener("click", () => {
  requireAuth(() => {
    window.location.href = "somonibank-app.html#sb-transfer-form";
  });
});

void loadRates();
void convertFromPay();
