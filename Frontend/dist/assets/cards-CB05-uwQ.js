import{m as h,s as c,r as y,o as f,a as n,b as o,c as g,d as S,u}from"./common-Bzbd_rB1.js";h();document.querySelectorAll("[data-toast]").forEach(e=>{e.addEventListener("click",a=>{e.getAttribute("href")==="#"&&a.preventDefault(),c(e.dataset.toast)})});document.querySelectorAll(".pill").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".pill").forEach(a=>a.classList.toggle("active",a===e)),c(`Фильтр "${e.textContent}" выбран.`)})});document.querySelectorAll(".faq-item").forEach(e=>{e.addEventListener("click",()=>e.classList.toggle("open"))});document.querySelectorAll(".btn-primary").forEach(e=>{e.addEventListener("click",()=>{y(()=>{document.getElementById("sb-cards-panel")?.scrollIntoView({behavior:"smooth",block:"start"})})})});const $=document.querySelector(".page"),E=document.querySelector(".faq-wrap"),d=document.createElement("section");d.className="sb-dashboard";d.id="sb-cards-panel";d.innerHTML=`
  <div class="sb-dashboard-head">
    <div>
      <h2 class="sb-dashboard-title">Карты из backend</h2>
      <p class="sb-dashboard-copy">Панель показывает банковские карты пользователя и позволяет выпускать новые через API.</p>
    </div>
    <div class="sb-cta">
      <button class="sb-ghost-btn" type="button" data-sb-cards-action="refresh">Обновить</button>
      <button class="sb-btn" type="button" data-sb-cards-action="auth">Войти</button>
    </div>
  </div>
  <div data-sb-cards-content></div>
`;$.insertBefore(d,E);d.querySelector('[data-sb-cards-action="auth"]').addEventListener("click",()=>f("login",l));d.querySelector('[data-sb-cards-action="refresh"]').addEventListener("click",()=>{l()});async function l(){const e=d.querySelector("[data-sb-cards-content]");if(!localStorage.getItem("sbank-session")){e.innerHTML=n("info","Авторизуйтесь, чтобы увидеть свои карты и выпустить новую через backend.");return}e.innerHTML=n("info","Загружаем счета и карты...");try{const[a,b]=await Promise.all([o("/api/accounts/my?page=1&pageSize=50",{auth:!0}),o("/api/cards/my?page=1&pageSize=50",{auth:!0})]),m=a.items||a.Items||[],p=b.items||b.Items||[],v=m.map(t=>`
      <option value="${t.id||t.Id}">
        ${t.accountNumber||t.AccountNumber} · ${t.currency||t.Currency}
      </option>
    `).join("");e.innerHTML=`
      <div class="sb-grid">
        <article class="sb-card span-6">
          <h3>Выпустить новую карту</h3>
          ${m.length===0?n("info","Сначала откройте счёт в приложении, после этого можно выпустить карту."):`
            <form id="sb-card-create-form" class="sb-form-grid">
              <div class="sb-field sb-field-full">
                <label for="sb-card-account">Счёт</label>
                <select id="sb-card-account" name="accountId" required>${v}</select>
              </div>
              <div class="sb-field">
                <label for="sb-card-holder">Имя держателя</label>
                <input id="sb-card-holder" name="cardHolderName" type="text" required>
              </div>
              <div class="sb-field">
                <label for="sb-card-type">Тип карты</label>
                <select id="sb-card-type" name="type">
                  <option value="Physical">Physical</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>
              <div class="sb-field sb-field-full">
                <button class="sb-btn" type="submit">Выпустить карту</button>
              </div>
            </form>
          `}
        </article>
        <article class="sb-card span-6">
          <h3>Мои карты</h3>
          <div class="sb-list">
            ${p.length===0?'<div class="sb-empty">У пользователя пока нет карт.</div>':p.map(t=>`
              <div class="sb-list-item">
                <div class="sb-list-main">
                  <div class="sb-list-title">${t.type||t.Type} · ${t.maskedNumber||t.MaskedNumber}</div>
                  <div class="sb-list-subtitle">${t.cardHolderName||t.CardHolderName} · ${t.expiryDate||t.ExpiryDate}</div>
                  <div class="sb-list-meta">Создана: ${g(t.createdAt||t.CreatedAt)} · <span class="sb-pill ${S(t.status||t.Status)}">${t.status||t.Status}</span></div>
                </div>
                <div class="sb-list-actions">
                  <button class="sb-inline-btn" type="button" data-card-action="toggle" data-card-id="${t.id||t.Id}" data-card-status="${t.status||t.Status}">${(t.status||t.Status)==="Blocked"?"Разблокировать":"Заблокировать"}</button>
                  <button class="sb-inline-btn" type="button" data-card-action="delete" data-card-id="${t.id||t.Id}">Удалить</button>
                </div>
              </div>
            `).join("")}
          </div>
        </article>
      </div>
    `,e.querySelector("#sb-card-create-form")?.addEventListener("submit",async t=>{t.preventDefault();const s=t.currentTarget;try{const i=u(await o("/api/cards/create",{method:"POST",auth:!0,body:{accountId:s.accountId.value,cardHolderName:s.cardHolderName.value.trim(),type:s.type.value}}));c(i.messages[0]||"Карта выпущена."),s.reset(),await l()}catch(i){c(i.message)}}),e.querySelectorAll("[data-card-action]").forEach(t=>{t.addEventListener("click",async()=>{const s=t.dataset.cardId,i=t.dataset.cardStatus;try{if(t.dataset.cardAction==="delete"){const r=u(await o(`/api/cards/${s}`,{method:"DELETE",auth:!0}));c(r.messages[0]||"Карта удалена.")}else if(i==="Blocked"){const r=u(await o(`/api/cards/${s}/unblock`,{method:"PATCH",auth:!0}));c(r.messages[0]||"Карта разблокирована.")}else{const r=u(await o(`/api/cards/${s}/block`,{method:"PATCH",auth:!0}));c(r.messages[0]||"Карта заблокирована.")}await l()}catch(r){c(r.message)}})})}catch(a){e.innerHTML=n("error",a.message)}}l();
