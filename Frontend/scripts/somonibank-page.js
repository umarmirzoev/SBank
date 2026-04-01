import { showToast } from "./common.js";

const timelineData = {
  2024: [
    {
      title: "Январь",
      text: "Запущено обновление ключевых клиентских сценариев: быстрее вход, понятнее продукты, удобнее ежедневные операции."
    },
    {
      title: "Май",
      text: "Усилен фокус на цифровом сервисе для частных клиентов и улучшена визуальная подача банковских продуктов."
    },
    {
      title: "Август",
      text: "Развита продуктовая линейка для карт и переводов, чтобы основные действия занимали меньше шагов."
    },
    {
      title: "Ноябрь",
      text: "Сайт и промо-страницы банка получили более современный вид, а коммуникация с клиентом стала яснее."
    },
    {
      title: "Декабрь",
      text: "Сомонибонк завершил год с сильной продуктовой экосистемой, объединяющей частные сервисы и решения для бизнеса."
    }
  ],
  2025: [
    {
      title: "Февраль",
      text: "Расширены цифровые сценарии для карт и платежей, что сделало ежедневный банкинг заметно удобнее."
    },
    {
      title: "Июнь",
      text: "Усилено направление Somonibonk Business: больше внимания расчётам, интерфейсам и сервису для компаний."
    },
    {
      title: "Сентябрь",
      text: "Обновлены продуктовые лендинги и коммуникация банка, чтобы клиентам было проще ориентироваться в услугах."
    },
    {
      title: "Ноябрь",
      text: "Банк ускорил запуск промо-страниц и цифровых материалов для новых услуг и внутренних инициатив."
    },
    {
      title: "Декабрь",
      text: "Год завершился укреплением бренда Сомонибонк как современного и технологичного банка."
    }
  ],
  2026: [
    {
      title: "Январь",
      text: "Сайт банка получил новые визуальные сценарии с акцентом на ясность, навигацию и современную подачу."
    },
    {
      title: "Апрель",
      text: "Раздел о Сомонибонк стал более живым: цифры, ценности, достижения и продукты теперь собраны в одной странице."
    },
    {
      title: "Июль",
      text: "Продолжилось развитие интерфейсов для клиентов и бизнеса, чтобы основные операции выполнялись быстрее."
    },
    {
      title: "Октябрь",
      text: "Банк усилил единый цифровой стиль и продуктовую экосистему вокруг карт, переводов и бизнес-решений."
    },
    {
      title: "Декабрь",
      text: "Сомонибонк закрепил курс на удобный клиентский опыт, стабильность и рост цифровых сервисов."
    }
  ]
};

document.querySelectorAll("[data-toast]").forEach((element) => {
  element.addEventListener("click", (event) => {
    if (element.getAttribute("href") === "#") {
      event.preventDefault();
    }

    showToast(element.dataset.toast);
  });
});

document.querySelectorAll("[data-scroll-target]").forEach((element) => {
  element.addEventListener("click", (event) => {
    const target = document.getElementById(element.dataset.scrollTarget);
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelectorAll(".sub-nav a").forEach((link) => {
      link.classList.toggle("active-sub", link === element);
    });
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    counterObserver.unobserve(entry.target);
    const targetValue = Number(entry.target.dataset.counter || 0);
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.round(targetValue * (1 - (1 - progress) ** 3));
      entry.target.textContent = formatCounter(value);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  });
}, { threshold: 0.45 });

document.querySelectorAll("[data-counter]").forEach((counter) => {
  counterObserver.observe(counter);
});

function formatCounter(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(".", ",")} млн +`;
  }

  if (value >= 1000) {
    return `${value.toLocaleString("ru-RU")} +`;
  }

  return `${value} +`;
}

function renderTimeline(year) {
  const container = document.getElementById("timelineContent");
  const items = timelineData[year] || [];
  const columns = [[], [], []];

  items.forEach((item, index) => {
    columns[index % 3].push(item);
  });

  container.innerHTML = columns.map((column) => `
    <div class="timeline-column">
      ${column.map((item) => `
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      `).join("")}
    </div>
  `).join("");
}

document.querySelectorAll(".timeline-year").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".timeline-year").forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    renderTimeline(button.dataset.year);
  });
});
