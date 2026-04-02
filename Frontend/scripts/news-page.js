import { showToast } from "./common.js";

const newsData = {
  important: {
    2026: [
      ["Рабочие часы с 21 по 25 марта", "19 марта 2026", "bank-schedule-imp"],
      ["День защиты прав потребителей", "11 марта 2026", "consumer-rights-imp"],
      ["Кэшбэк 10% с Mastercard", "18 февраля 2026", "cashback-imp"]
    ],
    2025: [
      ["Запуск обновлённого мобильного сервиса", "22 ноября 2025", "mobile-service-imp"],
      ["Новые условия по дебетовым картам", "14 сентября 2025", "debit-cards-imp"],
      ["Расширение сети банкоматов", "03 июля 2025", "atm-imp"]
    ],
    2024: [
      ["Новая линейка карт для клиентов банка", "18 октября 2024", "bank-cards-imp"],
      ["Обновление тарифов на переводы", "27 июня 2024", "tariffs-imp"],
      ["Сервис быстрых платежей получил обновление", "12 февраля 2024", "fast-pay-imp"]
    ],
    2023: [
      ["Сомонибонк открыл новый офис обслуживания", "16 ноября 2023", "new-office-imp"],
      ["Обновлены правила интернет-банкинга", "07 августа 2023", "internet-bank-imp"]
    ]
  }
};

document.querySelectorAll("[data-toast]").forEach((element) => {
  element.addEventListener("click", (event) => {
    if (element.getAttribute("href") === "#") {
      event.preventDefault();
    }

    showToast(element.dataset.toast);
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

let activeTab = "important";
let activeYear = "2026";

const newsList = document.getElementById("newsList");

function renderNews() {
  const items = newsData[activeTab]?.[activeYear] || [];
  newsList.innerHTML = items.map(([title, date, seed]) => `
    <article class="news-item">
      <img class="news-item-img" src="https://picsum.photos/seed/${seed}/400/200" alt="${title}" loading="lazy">
      <div class="news-item-body">
        <h3>${title}</h3>
        <p>${date}</p>
      </div>
    </article>
  `).join("");

  newsList.querySelectorAll(".news-item").forEach((item) => {
    item.addEventListener("click", () => {
      showToast(`Открытие новости: ${item.querySelector("h3")?.textContent || "Новость"}`);
    });
  });
}

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    activeTab = button.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    renderNews();
  });
});

document.querySelectorAll(".year-btn").forEach((button) => {
  button.addEventListener("click", () => {
    activeYear = button.dataset.year;
    document.querySelectorAll(".year-btn").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    renderNews();
  });
});

renderNews();
