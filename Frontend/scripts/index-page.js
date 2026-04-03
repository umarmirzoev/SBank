import {
  apiRequest,
  mountHeaderAuth,
  requireAuth,
  showToast
} from "./common.js";

mountHeaderAuth();

const DEFAULT_RATES = {
  USD: { buy: 9.55, sell: 9.62 },
  RUB: { buy: 0.1164, sell: 0.1187 },
  EUR: { buy: 10.94, sell: 11.15 },
  TJS: { buy: 1, sell: 1 }
};

const state = {
  rates: { ...DEFAULT_RATES },
  mode: "buy",
  lastEdited: "pay",
  receiveCurrency: "TJS",
  payCurrency: "USD"
};

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
const directionButtons = Array.from(document.querySelectorAll("#directionSwitch button"));

state.receiveCurrency = receiveCurrency?.value || "TJS";
state.payCurrency = payCurrency?.value || "USD";

function normalizeRatesPayload(payload) {
  const list = payload?.rates || payload?.Rates || [];
  const nextRates = { ...DEFAULT_RATES };

  if (!Array.isArray(list)) {
    return nextRates;
  }

  list.forEach((item) => {
    const code = String(item.currencyCode || item.CurrencyCode || "").toUpperCase();
    const value = Number(item.rate ?? item.Rate ?? 0);
    if (!code || !Number.isFinite(value) || value <= 0) {
      return;
    }

    const fallback = DEFAULT_RATES[code] || { buy: value, sell: value };
    const buySpread = fallback.buy / (fallback.sell || fallback.buy || value);
    const sellSpread = fallback.sell / (fallback.buy || fallback.sell || value);

    nextRates[code] = {
      buy: Number((value * buySpread).toFixed(4)),
      sell: Number((value * sellSpread).toFixed(4))
    };
  });

  nextRates.TJS = { buy: 1, sell: 1 };
  return nextRates;
}

function formatRate(value) {
  return Number(value || 0).toFixed(4);
}

function renderRatesTable() {
  if (!tableBody) {
    return;
  }

  const rows = ["USD", "RUB", "EUR"];
  tableBody.innerHTML = rows.map((currencyCode) => {
    const rate = state.rates[currencyCode] || DEFAULT_RATES[currencyCode];
    const flagClass = currencyCode.toLowerCase();
    return `
      <tr data-currency="${currencyCode}">
        <td><div class="currency-cell"><span class="flag ${flagClass}"></span><span>1 ${currencyCode}</span></div></td>
        <td>${formatRate(rate.buy)}</td>
        <td>${formatRate(rate.sell)}</td>
      </tr>
    `;
  }).join("");
}

async function loadRates() {
  try {
    const latest = await apiRequest("/api/exchange-rates/latest");
    state.rates = normalizeRatesPayload(latest);
    renderRatesTable();

    const footer = document.querySelector(".rates-footer");
    if (footer) {
      const rateDate = latest?.rateDate || latest?.RateDate;
      const source = latest?.source || latest?.Source || "NBT";
      footer.innerHTML = `
        <span>Дата курса: ${rateDate ? new Date(rateDate).toLocaleDateString("ru-RU") : "не указана"}</span>
        <span>Источник: ${source}</span>
      `;
    }
  } catch (error) {
    state.rates = { ...DEFAULT_RATES };
    renderRatesTable();
    showToast("Курсы из API недоступны. Используются последние сохранённые значения.");
  }
}

function formatAmount(value) {
  return Number(value || 0).toFixed(4).replace(/\.?0+$/, "");
}

function pickDifferentCurrency(excludedCurrency) {
  const options = Array.from(receiveCurrency?.options || payCurrency?.options || []);
  const fallback = options.find((option) => option.value !== excludedCurrency);
  return fallback?.value || "TJS";
}

function syncCurrencyPair(changedSide) {
  if (!receiveCurrency || !payCurrency) {
    return;
  }

  if (receiveCurrency.value !== payCurrency.value) {
    state.receiveCurrency = receiveCurrency.value;
    state.payCurrency = payCurrency.value;
    return;
  }

  if (changedSide === "receive") {
    const nextPayCurrency = state.receiveCurrency !== receiveCurrency.value
      ? state.receiveCurrency
      : pickDifferentCurrency(receiveCurrency.value);
    payCurrency.value = nextPayCurrency;
  } else {
    const nextReceiveCurrency = state.payCurrency !== payCurrency.value
      ? state.payCurrency
      : pickDifferentCurrency(payCurrency.value);
    receiveCurrency.value = nextReceiveCurrency;
  }

  state.receiveCurrency = receiveCurrency.value;
  state.payCurrency = payCurrency.value;
}

function getDirectionalRate(code) {
  const normalizedCode = String(code || "").toUpperCase();
  const rate = state.rates[normalizedCode] || DEFAULT_RATES[normalizedCode];
  if (!rate) {
    return 1;
  }

  return state.mode === "sell" ? Number(rate.sell || rate.buy || 1) : Number(rate.buy || rate.sell || 1);
}

function convertUsingRates(from, to, amount) {
  const normalizedFrom = String(from || "").toUpperCase();
  const normalizedTo = String(to || "").toUpperCase();
  const numericAmount = Number(amount || 0);

  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    return 0;
  }

  if (normalizedFrom === normalizedTo) {
    return numericAmount;
  }

  if (normalizedFrom === "TJS") {
    return numericAmount / getDirectionalRate(normalizedTo);
  }

  if (normalizedTo === "TJS") {
    return numericAmount * getDirectionalRate(normalizedFrom);
  }

  const tjsAmount = numericAmount * getDirectionalRate(normalizedFrom);
  return tjsAmount / getDirectionalRate(normalizedTo);
}

async function convert(from, to, amount) {
  const numericAmount = Number(amount || 0);
  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    return 0;
  }

  if (String(from).toUpperCase() === String(to).toUpperCase()) {
    return numericAmount;
  }

  return convertUsingRates(from, to, numericAmount);
}

async function convertFromPay() {
  if (!receiveAmount || !payAmount || !receiveCurrency || !payCurrency) {
    return;
  }

  state.lastEdited = "pay";
  receiveAmount.value = formatAmount(await convert(payCurrency.value, receiveCurrency.value, payAmount.value));
}

async function convertFromReceive() {
  if (!receiveAmount || !payAmount || !receiveCurrency || !payCurrency) {
    return;
  }

  state.lastEdited = "receive";
  payAmount.value = formatAmount(await convert(receiveCurrency.value, payCurrency.value, receiveAmount.value));
}

receiveAmount?.addEventListener("input", () => void convertFromReceive());
payAmount?.addEventListener("input", () => void convertFromPay());
receiveCurrency?.addEventListener("change", () => {
  syncCurrencyPair("receive");
  void (state.lastEdited === "receive" ? convertFromReceive() : convertFromPay());
});
payCurrency?.addEventListener("change", () => {
  syncCurrencyPair("pay");
  void (state.lastEdited === "receive" ? convertFromReceive() : convertFromPay());
});

document.getElementById("swapButton")?.addEventListener("click", () => {
  const nextReceiveCurrency = payCurrency.value;
  payCurrency.value = receiveCurrency.value;
  receiveCurrency.value = nextReceiveCurrency;

  const nextReceiveAmount = payAmount.value;
  payAmount.value = receiveAmount.value;
  receiveAmount.value = nextReceiveAmount;
  state.receiveCurrency = receiveCurrency.value;
  state.payCurrency = payCurrency.value;

  void (state.lastEdited === "receive" ? convertFromReceive() : convertFromPay());
});

directionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    directionButtons.forEach((item) => item.classList.toggle("active", item === button));
    state.mode = button.dataset.direction || "buy";
    renderRatesTable();
    void (state.lastEdited === "receive" ? convertFromReceive() : convertFromPay());
  });
});

document.querySelectorAll("#rateMode .rate-filter, #rateMiniMode .mini-filter").forEach((button) => {
  button.addEventListener("click", () => {
    button.parentElement?.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    void loadRates();
    void (state.lastEdited === "receive" ? convertFromReceive() : convertFromPay());
  });
});

document.getElementById("sendMoneyButton")?.addEventListener("click", () => {
  requireAuth(() => {
    window.location.href = "somonibank-app.html#sb-transfer-form";
  });
});

void loadRates().finally(() => {
  void convertFromPay();
});
