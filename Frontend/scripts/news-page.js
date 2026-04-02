import { showToast } from "./common.js";

const newsData = {
  bank: {
    2026: [
      ["Рабочие часы с 21 по 25 марта", "19 марта 2026"],
      ["День защиты прав потребителей", "11 марта 2026"],
      ["Кэшбэк 10% с Mastercard", "18 февраля 2026"],
      ["Акция на покупку авто началась", "09 февраля 2026"]
    ],
    2025: [
      ["Запуск обновлённого мобильного сервиса", "22 ноября 2025"],
      ["Новые условия по дебетовым картам", "14 сентября 2025"],
      ["Расширение сети банкоматов", "03 июля 2025"]
    ],
    2024: [
      ["Новая линейка карт для клиентов банка", "18 октября 2024"],
      ["Обновление тарифов на переводы", "27 июня 2024"],
      ["Сервис быстрых платежей получил обновление", "12 февраля 2024"]
    ],
    2023: [
      ["Сомонибонк открыл новый офис обслуживания", "16 ноября 2023"],
      ["Обновлены правила интернет-банкинга", "07 августа 2023"]
    ]
  },
  important: {
    2026: [
      ["Временные изменения графика в праздничные дни", "20 марта 2026"],
      ["Плановые технические работы в мобильном приложении", "01 марта 2026"]
    ],
    2025: [
      ["Изменения правил идентификации клиентов", "10 декабря 2025"],
      ["Обновление условий публичной оферты", "05 мая 2025"]
    ],
    2024: [
      ["Профилактические работы в интернет-банке", "17 октября 2024"]
    ],
    2023: [
      ["Изменения в порядке обработки обращений", "25 апреля 2023"]
    ]
  },
  tender: {
    2026: [
      ["Тендер на поставку офисного оборудования", "04 февраля 2026"]
    ],
    2025: [
      ["Тендер на обслуживание ИТ-инфраструктуры", "18 ноября 2025"],
      ["Закупка материалов для отделений банка", "07 апреля 2025"]
    ],
    2024: [
      ["Тендер на брендированные материалы", "13 сентября 2024"]
    ],
    2023: [
      ["Тендер на логистические услуги", "21 марта 2023"]
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

let activeTab = "bank";
let activeYear = "2026";

const newsList = document.getElementById("newsList");

function renderNews() {
  const items = newsData[activeTab]?.[activeYear] || [];
  newsList.innerHTML = items.map(([title, date]) => `
    <article class="news-item">
      <h3>${title}</h3>
      <p>${date}</p>
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
