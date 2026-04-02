import { showToast } from "./common.js";

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

document.getElementById("feedbackForm")?.addEventListener("submit", (event) => {
  event.preventDefault();

  const fullName = document.getElementById("fullName");
  const phone = document.getElementById("phone");
  const question = document.getElementById("question");
  const agreeData = document.getElementById("agreeData");

  if (!fullName.value.trim() || !phone.value.trim() || !question.value.trim()) {
    showToast("Заполните ФИО, телефон и вопрос.");
    return;
  }

  if (!agreeData.checked) {
    showToast("Подтвердите согласие на обработку данных.");
    return;
  }

  showToast("Обращение отправлено. Мы свяжемся с вами.");
  event.currentTarget.reset();
});
