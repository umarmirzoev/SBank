import { showToast } from "./common.js";

const tariffData = {
  dushanbe: {
    note: "Доставка по Душанбе каждый день с 09:00 до 20:00.",
    rows: [
      ["Карта «Сомони»", "Бесплатно", "В течение 2 дней", "Курьер доставит карту домой или в офис."],
      ["Карта Visa", "Бесплатно", "В течение 3 рабочих дней", "Доступна доставка после оформления заявки онлайн."],
      ["Mastercard", "Бесплатно", "В течение 3 рабочих дней", "Подтверждение заявки приходит по SMS."],
      ["Идентификация приложения Somonibank", "10 сомони", "В течение дня", "Курьер поможет проверить документы."],
      ["Смена номера телефона", "10 сомони", "Занимает 2 дня", "Услуга доступна для действующих клиентов."],
      ["Экспресс-доставка", "20 сомони", "В течение 3-4 часов", "При наличии свободного окна в день заказа."]
    ]
  },
  khujand: {
    note: "Доставка по Худжанду доступна по будням с 10:00 до 18:00.",
    rows: [
      ["Карта «Сомони»", "Бесплатно", "В течение 3 дней", "Оформление и подтверждение занимают один рабочий день."],
      ["Карта Visa", "Бесплатно", "В течение 4 рабочих дней", "Курьер привезёт карту по указанному адресу."],
      ["Mastercard", "Бесплатно", "В течение 4 рабочих дней", "После готовности карты мы позвоним заранее."],
      ["Идентификация приложения Somonibank", "10 сомони", "В течение дня", "Услуга доступна в пределах города."],
      ["Смена номера телефона", "15 сомони", "До 2 дней", "Понадобится паспорт или ID-карта."],
      ["Экспресс-доставка", "25 сомони", "В течение дня", "Доступно ограниченное количество слотов."]
    ]
  }
};

document.querySelectorAll("[data-toast]").forEach((element) => {
  element.addEventListener("click", () => {
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

const rowsContainer = document.getElementById("tariffRows");
const cityNote = document.getElementById("cityNote");
const cityButtons = Array.from(document.querySelectorAll(".city-pill"));

function renderTariffs(city) {
  const data = tariffData[city];

  rowsContainer.innerHTML = data.rows.map(([service, price, term, note]) => `
    <div class="table-row">
      <span>
        <strong>${service}</strong>
        <small>${note}</small>
      </span>
      <span class="price">${price}</span>
      <span class="term">${term}</span>
    </div>
  `).join("");

  cityNote.textContent = data.note;
}

cityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    cityButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderTariffs(button.dataset.city);
  });
});

renderTariffs("dushanbe");
