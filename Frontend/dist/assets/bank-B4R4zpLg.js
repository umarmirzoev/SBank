import"./modulepreload-polyfill-B5Qt9EMX.js";import{g as E,c as C,a as R,s as I}from"./common-B9vdsGd4.js";const u=E(),B=()=>{const t=encodeURIComponent("bank.html");window.location.href=`login.html?redirect=${t}`};u?.token||B();const U=document.getElementById("userName"),$=document.getElementById("userAvatar"),h=document.getElementById("ratesRows"),L=document.getElementById("promoGrid"),S=document.getElementById("servicesGrid"),d=document.getElementById("searchInput"),l=document.getElementById("toastStatus"),b=u?.fullName||u?.FullName||"Иван Иванов";U.textContent=b;$.textContent=b.trim().charAt(0).toUpperCase();document.getElementById("logoutButton")?.addEventListener("click",()=>{C(),window.location.href="login.html"});document.getElementById("searchButton")?.addEventListener("click",()=>w(d.value.trim()));d?.addEventListener("input",()=>w(d.value.trim()));document.getElementById("refreshRates")?.addEventListener("click",()=>{m(!0)});document.getElementById("detailsButton")?.addEventListener("click",()=>{window.location.href="somonibank-app.html"});function e(t){if(!l){I(t);return}l.textContent=t,l.classList.add("show"),clearTimeout(e.timer),e.timer=setTimeout(()=>l.classList.remove("show"),2400)}function v(t){return Number(t||0).toLocaleString("ru-RU",{minimumFractionDigits:2,maximumFractionDigits:4})}const T=[{title:`Депозиты
и счета`,icon:"▣",action:"deposits"},{title:`Обменник
валют`,icon:"$",action:"exchange"},{title:`Кредит
наличными`,icon:"✈",action:"loan"},{title:"Карты",icon:"▭",action:"cards"},{title:"Карты",icon:"▬",action:"cards"},{title:`Перевод
зарубеж`,icon:"◉",action:"transfers"},{title:`Снятие
наличных`,icon:"▣",action:"cash"},{title:`Покупка
авто`,icon:"◌",action:"auto"}],x=[{title:"Открыть счёт",subtitle:"Онлайн веб минут",icon:"◔",iconClass:"",action:"open-account"},{title:"Кредиты",subtitle:"Выдача и заявка",icon:"◫",iconClass:"green",action:"loan"},{title:"Карты",subtitle:"Доступные дизайны",icon:"▭",iconClass:"",action:"cards"},{title:"Переводы",subtitle:"Карта на карту и QR",icon:"↔",iconClass:"orange",action:"transfers"},{title:"Платежи",subtitle:"Коммунальные и другое",icon:"▣",iconClass:"",action:"payments"},{title:"Помощь счёт",subtitle:"Обзор и переводы",icon:"◒",iconClass:"",action:"help"},{title:"Заказать карту",subtitle:"Добавим за день",icon:"◧",iconClass:"",action:"cards"},{title:"Кредитный калькулятор",subtitle:"Платёж и срок",icon:"⌗",iconClass:"",action:"loan-calc"},{title:"Отделения и банкоматы",subtitle:"Рядом с вами",icon:"⌖",iconClass:"",action:"branches"},{title:"Безопасность",subtitle:"Защита и советы",icon:"✔",iconClass:"green",action:"security"}];L.innerHTML=T.map(t=>`
  <button class="feature-tile" type="button" data-action="${t.action}" data-label="${t.title.replace(/\n/g," ")}">
    <span class="feature-icon">${t.icon}</span>
    <strong>${t.title.replace(/\n/g,"<br>")}</strong>
  </button>
`).join("");S.innerHTML=x.map(t=>`
  <button class="service-card" type="button" data-action="${t.action}" data-label="${t.title}">
    <span class="service-icon ${t.iconClass||""}">${t.icon}</span>
    <span class="service-copy">
      <strong>${t.title}</strong>
      <small>${t.subtitle}</small>
    </span>
  </button>
`).join("");function k(){document.querySelectorAll("[data-action]").forEach(t=>{t.addEventListener("click",()=>A(t.dataset.action,t.dataset.label||""))})}function A(t,n){switch(t){case"deposits":case"open-account":window.location.href="deposits.html";return;case"exchange":e("Курсы валют обновлены."),m(!0);return;case"loan":case"loan-calc":e("Кредитный раздел готов к подключению заявки.");return;case"cards":window.location.href="cards.html";return;case"transfers":window.location.href="transfers.html";return;case"payments":window.location.href="payments.html";return;case"auto":window.location.href="auto.html";return;case"branches":window.location.href="addresses.html";return;case"security":e("Профиль защищён. Используйте проверенные устройства и не передавайте SMS-коды.");return;case"cash":e("Ближайшие банкоматы можно найти в разделе отделений.");return;case"help":e("Раздел помощи открывается из поддержки и истории операций.");return;default:e(`${n||"Раздел"} открыт.`)}}function w(t){const n=String(t||"").trim().toLowerCase(),o=Array.from(document.querySelectorAll(".feature-tile, .service-card"));if(!n){o.forEach(a=>{a.hidden=!1});return}let i=0;o.forEach(a=>{const c=a.textContent.toLowerCase().includes(n);a.hidden=!c,c&&(i+=1)}),i||e("По запросу ничего не найдено.")}function y(t){if(!t.length){h.innerHTML=`
      <div class="rate-row">
        <div class="currency"><span class="flag">🇺🇸</span><strong>USD</strong></div>
        <strong>9,50</strong>
        <strong>9,60</strong>
      </div>
      <div class="rate-row">
        <div class="currency"><span class="flag">🇪🇺</span><strong>EUR</strong></div>
        <strong>10,94</strong>
        <strong>11,15</strong>
      </div>
      <div class="rate-row">
        <div class="currency"><span class="flag">🇷🇺</span><strong>RUB</strong></div>
        <strong>0,1184</strong>
        <strong>0,1207</strong>
      </div>
    `;return}h.innerHTML=t.map(n=>`
    <div class="rate-row">
      <div class="currency"><span class="flag">${n.flag}</span><strong>${n.code}</strong></div>
      <strong>${n.buy}</strong>
      <strong>${n.sell}</strong>
    </div>
  `).join("")}async function m(t=!1){try{const n=await R("/api/exchange/rates?page=1&pageSize=30",{auth:!0}),o=n?.items||n?.Items||[],i=["USD","EUR","RUB"],a={USD:"🇺🇸",EUR:"🇪🇺",RUB:"🇷🇺"},c=i.map(s=>{const g=o.find(f=>String(f.fromCurrency||f.FromCurrency||"").toUpperCase()===s),r=Number(g?.rate||g?.Rate||0),p=r?r*1.011:0;return{code:s,flag:a[s]||"•",buy:r?v(r):s==="USD"?"9,50":s==="EUR"?"10,94":"0,1184",sell:p?v(p):s==="USD"?"9,60":s==="EUR"?"11,15":"0,1207"}});y(c),t&&e("Курс валют обновлён.")}catch{y([]),t&&e("Не удалось загрузить курсы, показаны базовые значения.")}}k();m();
