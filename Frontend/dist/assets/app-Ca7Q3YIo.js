import{m as k,s as o,o as b,b as c,a as l,f as n,c as g,r as q}from"./common-Cwdypr2M.js";/* empty css                    */k();document.querySelectorAll("[data-toast]").forEach(t=>{t.addEventListener("click",a=>{t.getAttribute("href")==="#"&&a.preventDefault(),o(t.dataset.toast)})});const f=document.querySelectorAll(".guide-tab"),i=document.querySelectorAll(".guide-mini-card");f.forEach(t=>{t.addEventListener("click",()=>{f.forEach(a=>a.classList.toggle("active",a===t)),t.dataset.guide==="security"?(i[0]?.classList.add("primary"),i[1]?.classList.remove("primary"),i[2]?.classList.remove("primary"),o("Открыт раздел: Настройки и безопасность.")):(i[0]?.classList.remove("primary"),i[1]?.classList.add("primary"),i[2]?.classList.remove("primary"),o("Открыт раздел: Карты."))})});const A=document.querySelector(".hero"),e=document.createElement("section");e.className="sb-dashboard";e.id="sb-dashboard";e.innerHTML=`
  <div class="sb-dashboard-head">
    <div>
      <h2 class="sb-dashboard-title">Личный кабинет</h2>
      <p class="sb-dashboard-copy">Здесь мы показываем краткую информацию из backend: счета, карты, последние операции и уведомления.</p>
    </div>
    <div class="sb-cta">
      <button class="sb-ghost-btn" type="button" data-dashboard-action="refresh">Обновить</button>
      <button class="sb-btn" type="button" data-dashboard-action="auth">Войти</button>
    </div>
  </div>
  <div data-dashboard-content></div>
`;A.insertAdjacentElement("afterend",e);e.querySelector('[data-dashboard-action="auth"]').addEventListener("click",()=>b("login",d));e.querySelector('[data-dashboard-action="refresh"]').addEventListener("click",()=>{d()});async function d(){const t=e.querySelector("[data-dashboard-content]");if(!localStorage.getItem("sbank-session")){t.innerHTML=`
      ${c("info","Войдите в аккаунт, чтобы открыть данные backend API.")}
      <div class="sb-cta" style="margin-top:12px;">
        <button class="sb-btn" type="button" data-dashboard-login>Войти</button>
        <button class="sb-ghost-btn" type="button" data-dashboard-register>Регистрация</button>
      </div>
    `,t.querySelector("[data-dashboard-login]")?.addEventListener("click",()=>b("login",d)),t.querySelector("[data-dashboard-register]")?.addEventListener("click",()=>b("register",d));return}t.innerHTML=c("info","Загружаем данные пользователя...");try{const[a,v,u,m]=await Promise.all([l("/api/accounts/my?page=1&pageSize=10",{auth:!0}),l("/api/cards/my?page=1&pageSize=10",{auth:!0}),l("/api/transactions/recent",{auth:!0}),l("/api/notifications/my?page=1&pageSize=10",{auth:!0})]),r=a.items||a.Items||[],$=v.items||v.Items||[],p=u.items||u.Items||[],h=m.items||m.Items||[],L=r.reduce((s,y)=>s+Number(y.balance||y.Balance||0),0);t.innerHTML=`
      <div class="sb-grid">
        <article class="sb-card span-4"><div class="sb-kpi"><strong>${r.length}</strong><span>Счетов</span></div></article>
        <article class="sb-card span-4"><div class="sb-kpi"><strong>${n(L)}</strong><span>Общий баланс</span></div></article>
        <article class="sb-card span-4"><div class="sb-kpi"><strong>${$.length}</strong><span>Карт</span></div></article>

        <article class="sb-card span-6" id="sb-transfer-form">
          <h3>Быстрые действия</h3>
          <div class="sb-cta">
            <button class="sb-btn" type="button" data-quick-action="cards">Мои карты</button>
            <button class="sb-ghost-btn" type="button" data-quick-action="transfers">Переводы</button>
          </div>
          <div style="margin-top:14px;">${c("info","Для расширенных операций используйте API-панели на этой и соседних страницах.")}</div>
        </article>

        <article class="sb-card span-6">
          <h3>Счета</h3>
          ${r.length===0?'<div class="sb-empty">Счетов пока нет.</div>':`<div class="sb-list">${r.map(s=>`
            <div class="sb-list-item">
              <div class="sb-list-main">
                <div class="sb-list-title">${s.accountNumber||s.AccountNumber}</div>
                <div class="sb-list-subtitle">${s.type||s.Type} · ${s.currency||s.Currency}</div>
                <div class="sb-list-meta">${n(s.balance||s.Balance,s.currency||s.Currency)}</div>
              </div>
            </div>`).join("")}</div>`}
        </article>

        <article class="sb-card span-6">
          <h3>Последние операции</h3>
          ${p.length===0?'<div class="sb-empty">Операций пока нет.</div>':`<div class="sb-list">${p.slice(0,5).map(s=>`
            <div class="sb-list-item">
              <div class="sb-list-main">
                <div class="sb-list-title">${s.type||s.Type}</div>
                <div class="sb-list-subtitle">${s.description||s.Description||"Без описания"}</div>
                <div class="sb-list-meta">${n(s.amount||s.Amount,s.currency||s.Currency)} · ${g(s.createdAt||s.CreatedAt)}</div>
              </div>
            </div>`).join("")}</div>`}
        </article>

        <article class="sb-card span-6">
          <h3>Уведомления</h3>
          ${h.length===0?'<div class="sb-empty">Уведомлений пока нет.</div>':`<div class="sb-list">${h.slice(0,5).map(s=>`
            <div class="sb-list-item">
              <div class="sb-list-main">
                <div class="sb-list-title">${s.title||s.Title}</div>
                <div class="sb-list-subtitle">${s.message||s.Message}</div>
                <div class="sb-list-meta">${g(s.createdAt||s.CreatedAt)}</div>
              </div>
            </div>`).join("")}</div>`}
        </article>
      </div>
    `,t.querySelector('[data-quick-action="cards"]')?.addEventListener("click",()=>{window.location.href="cards.html#sb-cards-panel"}),t.querySelector('[data-quick-action="transfers"]')?.addEventListener("click",()=>{window.location.href="transfers.html"})}catch(a){t.innerHTML=c("error",a.message)}}document.querySelector(".download-btn")?.addEventListener("click",()=>{q(()=>{document.getElementById("sb-dashboard")?.scrollIntoView({behavior:"smooth",block:"start"})})});d();
