import"./modulepreload-polyfill-B5Qt9EMX.js";import{g as E,c as R,a as I,s as B}from"./common-B9vdsGd4.js";const u=E(),L=()=>{const t=encodeURIComponent("bank.html");window.location.href=`login.html?redirect=${t}`};u?.token||L();const U=document.getElementById("userName"),d=document.getElementById("userAvatar"),v=document.getElementById("ratesRows"),S=document.getElementById("promoGrid"),$=document.getElementById("servicesGrid"),m=document.getElementById("searchInput"),l=document.getElementById("toastStatus"),g=u?.fullName||u?.FullName||"Иван Иванов";U.textContent=g;d&&(d.setAttribute("aria-label",g),d.innerHTML=`<span>${g.trim().charAt(0).toUpperCase()}</span>`);document.getElementById("logoutButton")?.addEventListener("click",()=>{R(),window.location.href="login.html"});document.getElementById("searchButton")?.addEventListener("click",()=>w(m.value.trim()));m?.addEventListener("input",()=>w(m.value.trim()));document.getElementById("refreshRates")?.addEventListener("click",()=>{C(!0)});document.getElementById("detailsButton")?.addEventListener("click",()=>{window.location.href="somonibank-app.html"});function n(t){if(!l){B(t);return}l.textContent=t,l.classList.add("show"),clearTimeout(n.timer),n.timer=setTimeout(()=>l.classList.remove("show"),2400)}function y(t){return Number(t||0).toLocaleString("ru-RU",{minimumFractionDigits:2,maximumFractionDigits:4})}const T=[{title:`Депозиты
и счета`,iconClass:"deposit",action:"deposits"},{title:`Обменник
валют`,iconClass:"exchange",action:"exchange"},{title:`Кредит
наличными`,iconClass:"loan",action:"loan"},{title:"Карты",iconClass:"cards",action:"cards"},{title:"Карты",iconClass:"cards-secondary",action:"cards"},{title:`Перевод
зарубеж`,iconClass:"globe",action:"transfers"},{title:`Снятие
наличных`,iconClass:"cash",action:"cash"},{title:`Покупка
авто`,iconClass:"auto",action:"auto"}],x=[{title:"Открыть счёт",subtitle:"Счёт за 5 минут",iconClass:"account",action:"open-account"},{title:"Кредиты",subtitle:"Выгодная заявка",iconClass:"credit",action:"loan"},{title:"Карты",subtitle:"Доступные дизайны",iconClass:"card",action:"cards"},{title:"Переводы",subtitle:"Карта, номер и QR",iconClass:"transfer",action:"transfers"},{title:"Платежи",subtitle:"Коммунальные и другие",iconClass:"payment",action:"payments"},{title:"Помощь счёт",subtitle:"Обзор и переводы",iconClass:"help",action:"help"},{title:"Заказать карту",subtitle:"Добавим за день",iconClass:"order",action:"cards"},{title:"Кредитный калькулятор",subtitle:"Платёж и срок",iconClass:"calc",action:"loan-calc"},{title:"Отделения и банкоматы",subtitle:"Рядом с вами",iconClass:"branch",action:"branches"},{title:"Безопасность",subtitle:"Защита и советы",iconClass:"security",action:"security"}];S.innerHTML=T.map(t=>`
  <button class="feature-tile" type="button" data-action="${t.action}" data-label="${t.title.replace(/\n/g," ")}">
    <span class="feature-icon ${t.iconClass}" aria-hidden="true"></span>
    <strong>${t.title.replace(/\n/g,"<br>")}</strong>
  </button>
`).join("");$.innerHTML=x.map(t=>`
  <button class="service-card" type="button" data-action="${t.action}" data-label="${t.title}">
    <span class="service-icon ${t.iconClass||""}" aria-hidden="true"></span>
    <span class="service-copy">
      <strong>${t.title}</strong>
      <small>${t.subtitle}</small>
    </span>
  </button>
`).join("");function k(){document.querySelectorAll("[data-action]").forEach(t=>{t.addEventListener("click",()=>A(t.dataset.action,t.dataset.label||""))})}function A(t,e){switch(t){case"deposits":case"open-account":window.location.href="deposits.html";return;case"exchange":window.location.href="index.html";return;case"loan":case"loan-calc":window.location.href="somonibank-app.html";return;case"cards":window.location.href="cards.html";return;case"transfers":window.location.href="transfers.html";return;case"payments":window.location.href="payments.html";return;case"auto":window.location.href="auto.html";return;case"branches":window.location.href="addresses.html";return;case"security":n("Профиль защищён. Используйте проверенные устройства и не передавайте SMS-коды.");return;case"cash":window.location.href="addresses.html";return;case"help":n("Раздел помощи открывается из поддержки и истории операций.");return;default:n(`${e||"Раздел"} открыт.`)}}function w(t){const e=String(t||"").trim().toLowerCase(),o=Array.from(document.querySelectorAll(".feature-tile, .service-card"));if(!e){o.forEach(a=>{a.hidden=!1});return}let i=0;o.forEach(a=>{const c=a.textContent.toLowerCase().includes(e);a.hidden=!c,c&&(i+=1)}),i||n("По запросу ничего не найдено.")}function b(t){if(!t.length){v.innerHTML=`
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
    `;return}v.innerHTML=t.map(e=>`
    <div class="rate-row">
      <div class="currency"><span class="flag">${e.flag}</span><strong>${e.code}</strong></div>
      <strong>${e.buy}</strong>
      <strong>${e.sell}</strong>
    </div>
  `).join("")}async function C(t=!1){try{const e=await I("/api/exchange/rates?page=1&pageSize=30",{auth:!0}),o=e?.items||e?.Items||[],i=["USD","EUR","RUB"],a={USD:"🇺🇸",EUR:"🇪🇺",RUB:"🇷🇺"},c=i.map(s=>{const p=o.find(f=>String(f.fromCurrency||f.FromCurrency||"").toUpperCase()===s),r=Number(p?.rate||p?.Rate||0),h=r?r*1.011:0;return{code:s,flag:a[s]||"•",buy:r?y(r):s==="USD"?"9,50":s==="EUR"?"10,94":"0,1184",sell:h?y(h):s==="USD"?"9,60":s==="EUR"?"11,15":"0,1207"}});b(c),t&&n("Курс валют обновлён.")}catch{b([]),t&&n("Не удалось загрузить курсы, показаны базовые значения.")}}k();C();
