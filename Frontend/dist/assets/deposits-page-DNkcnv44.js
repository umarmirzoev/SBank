import{i as g,g as x,s as u,a as v,f as c,b as f}from"./common-CmFqHCKi.js";const d={deposits:[],transactions:[],accounts:[],selectedDepositId:null},e={profileName:document.querySelector(".user-name"),depositsOverview:document.getElementById("depositsOverview"),middleList:document.querySelector(".middle-col .dep-list"),mainFocusBox:document.querySelector(".focus-box"),totalDisplay:document.querySelector(".total-val"),pageTitle:document.querySelector(".page-title-row h1"),pageSubtitle:document.querySelector(".page-title-row p"),datePill:document.querySelector(".date-pill"),quickTabs:document.querySelector(".quick-tabs"),rightCol:document.querySelector(".right-col")};function s(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function h(t){const a=[{className:"pink",icon:"🏦",gradient:"linear-gradient(135deg, #be185d 0%, #3b82f6 100%)"},{className:"teal",icon:"💎",gradient:"linear-gradient(135deg, #0f766e 0%, #1d4ed8 100%)"},{className:"yellow",icon:"💰",gradient:"linear-gradient(135deg, #b45309 0%, #1d4ed8 100%)"},{className:"purple",icon:"🎯",gradient:"linear-gradient(135deg, #6d28d9 0%, #1d4ed8 100%)"}];return a[t%a.length]}function S(t,a){const o=Math.max(1,Math.round((new Date(t.endDate)-new Date(t.startDate))/2592e6));return o<=3?`Вклад на ${o} мес.`:o<=12?`Срочный вклад ${a+1}`:`Долгосрочный вклад ${a+1}`}function b(t){const a=String(t||"").toLowerCase();return a==="active"?"Активен":a==="closed"?"Закрыт":t||"Неизвестно"}function w(){const t=x();e.profileName&&(e.profileName.textContent=t?.fullName||"Пользователь")}async function I(){g()&&(w(),D(),await $())}function D(){e.pageTitle&&(e.pageTitle.textContent="Депозиты"),e.pageSubtitle&&(e.pageSubtitle.textContent="Здесь показываются только ваши реальные вклады без мок-данных."),e.datePill&&(e.datePill.innerHTML=`
      <button class="date-btn active" type="button">Реальные данные</button>
      <button class="date-btn" type="button">Без демо-вкладов</button>
    `),e.quickTabs&&(e.quickTabs.innerHTML=`
      <a href="#" class="tab-link" data-deposit-action="topup">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Пополнить
      </a>
      <a href="app-transfers.html" class="tab-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        Переводы
      </a>
      <a href="#" class="tab-link" data-deposit-action="statement">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Выписка
      </a>
    `,e.quickTabs.querySelectorAll("[data-deposit-action]").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),u(t.dataset.depositAction==="topup"?"Пополнение депозита будет подключено к реальному API.":"Выписка по депозиту будет подключена к реальному API.")})}))}async function $(){try{const[t,a,o]=await Promise.all([v("/api/deposit/my?page=1&pageSize=50",{auth:!0}),v("/api/transactions/my?page=1&pageSize=50",{auth:!0}),v("/api/accounts/my?page=1&pageSize=50",{auth:!0})]);d.deposits=(t.items||t.Items||[]).map((i,n)=>{const r=h(n),l=(o.items||o.Items||[]).find(m=>String(m.id||m.Id)===String(i.accountId||i.AccountId));return{...i,theme:r,amount:Number(i.amount??i.Amount??0),interestRate:Number(i.interestRate??i.InterestRate??0),expectedProfit:Number(i.expectedProfit??i.ExpectedProfit??0),currency:i.currency||i.Currency||"TJS",status:i.status||i.Status||"Unknown",startDate:i.startDate||i.StartDate,endDate:i.endDate||i.EndDate,accountNumber:l?.accountNumber||l?.AccountNumber||"",iban:l?.iban||l?.Iban||"",label:S({startDate:i.startDate||i.StartDate,endDate:i.endDate||i.EndDate},n)}}),d.transactions=(a.items||a.Items||[]).filter(i=>{const n=String(i.type||i.Type||"").toLowerCase();return n==="deposit"||n==="depositinterest"}),d.accounts=o.items||o.Items||[],d.selectedDepositId=d.deposits[0]?.id||d.deposits[0]?.Id||null,p()}catch(t){console.error("Failed to load deposits",t),N(t),u("Не удалось загрузить депозиты")}}function p(){T(),A(),k(),q(),M()}function T(){if(e.depositsOverview){if(!d.deposits.length){e.depositsOverview.innerHTML=`
      <div class="row-card pink" style="grid-column:1 / -1;cursor:default;">
        <div class="row-card-top">
          <div class="card-icon-sq">🏦</div>
        </div>
        <div>
          <div class="card-label">У вас пока нет депозитов</div>
          <div class="card-bal">0 TJS</div>
          <div class="card-details">Как только вы откроете вклад, он отобразится здесь.</div>
        </div>
      </div>
    `;return}e.depositsOverview.innerHTML=d.deposits.map(t=>{const a=t.id||t.Id;return`
      <div class="row-card ${t.theme.className}" data-deposit-id="${a}">
        <div class="row-card-top">
          <div class="card-icon-sq">${t.theme.icon}</div>
          <div class="card-rate">${s(String(t.interestRate))}%</div>
        </div>
        <div>
          <div class="card-label">${s(t.label)}</div>
          <div class="card-bal">${s(c(t.amount,t.currency))}</div>
          <div class="card-details">До ${s(f(t.endDate))} · ${s(b(t.status))}</div>
        </div>
        <div class="card-link">Подробнее ></div>
      </div>
    `}).join(""),e.depositsOverview.querySelectorAll("[data-deposit-id]").forEach(t=>{t.addEventListener("click",()=>{d.selectedDepositId=t.dataset.depositId,p()})})}}function A(){if(e.middleList){if(!d.deposits.length){e.middleList.innerHTML=`
      <div class="box-header">
        <span class="box-title">Ваши депозиты</span>
      </div>
      <div class="dep-item">
        <div class="dep-icon-sq">ℹ️</div>
        <div class="dep-info">
          <div class="dep-name">Депозитов нет</div>
          <div class="dep-sub">Здесь будет список ваших реальных вкладов.</div>
        </div>
      </div>
    `;return}e.middleList.innerHTML=`
    <div class="box-header">
      <span class="box-title">Ваши депозиты</span>
    </div>
    ${d.deposits.map(t=>`
        <div class="dep-item" data-deposit-id="${t.id||t.Id}" style="cursor:pointer;">
          <div class="dep-icon-sq">${t.theme.icon}</div>
          <div class="dep-info">
            <div class="dep-name">${s(t.label)}</div>
            <div class="dep-sub">${s(t.accountNumber||"Счёт не найден")}</div>
          </div>
          <div class="dep-val-col">
            <div class="dep-val">${s(c(t.amount,t.currency))}</div>
            <div class="dep-rate">${s(String(t.interestRate))}% годовых</div>
          </div>
        </div>
      `).join("")}
  `,e.middleList.querySelectorAll("[data-deposit-id]").forEach(t=>{t.addEventListener("click",()=>{d.selectedDepositId=t.dataset.depositId,p()})})}}function y(){return d.deposits.find(t=>String(t.id||t.Id)===String(d.selectedDepositId))||null}function L(t){return d.transactions.filter(a=>{const o=a.fromAccountId||a.FromAccountId,i=a.toAccountId||a.ToAccountId;return String(o)===String(t.accountId||t.AccountId)||String(i)===String(t.accountId||t.AccountId)})}function k(){if(!e.mainFocusBox)return;const t=y();if(!t){e.mainFocusBox.innerHTML=`
      <div class="box-header">
        <span class="box-title">Депозиты не найдены</span>
      </div>
      <div style="color:#64748b;font-size:14px;line-height:1.7;">
        На этой странице больше нет мок-данных. Когда у вас появится вклад, здесь будет показана его реальная сводка.
      </div>
    `;return}const a=L(t),o=a.filter(n=>!n.fromAccountId&&n.toAccountId).reduce((n,r)=>n+Number(r.amount??r.Amount??0),0),i=a.filter(n=>n.fromAccountId).reduce((n,r)=>n+Number(r.amount??r.Amount??0),0);e.mainFocusBox.innerHTML=`
    <div class="box-header">
      <span class="box-title">${s(t.label)}</span>
    </div>
    <div class="visual-deposit" style="background:${t.theme.gradient};">
      <div class="v-dep-top">
        <div>
          <div class="v-dep-title">${s(t.label)}</div>
          <div style="font-size:11px; opacity:0.7; margin-top:2px;">${s(t.accountNumber||"Депозитный счёт")}</div>
        </div>
        <div>
          <div class="v-dep-bal">${s(c(t.amount,t.currency))}</div>
          <div class="v-dep-trend">${s(String(t.interestRate))}% годовых</div>
        </div>
      </div>
      <div class="v-dep-bottom">
        <div class="v-dep-iban">IBAN: ${s(t.iban||"не указан")}</div>
        <div class="v-dep-icon">${t.theme.icon}</div>
      </div>
    </div>
    <div class="focus-actions">
      <button class="btn-dep-action btn-secondary-link" type="button" data-deposit-toast="История по депозиту скоро будет расширена.">История</button>
      <button class="btn-dep-action btn-secondary-link" type="button" data-deposit-toast="Условия депозита будут показаны из backend.">Условия</button>
      <button class="btn-dep-action btn-primary-dep" type="button" data-deposit-toast="Пополнение депозита будет подключено к реальному API.">Пополнить</button>
    </div>
    <div class="activity-section">
      <div class="chart-header">
        <span class="box-title" style="font-size:14px;">Сводка по депозиту</span>
        <span style="font-size:14px; font-weight:800;">+ ${s(c(o,t.currency))} | - ${s(c(i,t.currency))}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
        <div style="padding:16px;border-radius:18px;background:#f8fafc;">
          <div style="font-size:11px;font-weight:800;color:#94a3b8;">Статус</div>
          <div style="margin-top:8px;font-size:16px;font-weight:900;color:#1e293b;">${s(b(t.status))}</div>
        </div>
        <div style="padding:16px;border-radius:18px;background:#f8fafc;">
          <div style="font-size:11px;font-weight:800;color:#94a3b8;">Ожидаемая прибыль</div>
          <div style="margin-top:8px;font-size:16px;font-weight:900;color:#1e293b;">${s(c(t.expectedProfit,t.currency))}</div>
        </div>
        <div style="padding:16px;border-radius:18px;background:#f8fafc;">
          <div style="font-size:11px;font-weight:800;color:#94a3b8;">До даты</div>
          <div style="margin-top:8px;font-size:16px;font-weight:900;color:#1e293b;">${s(f(t.endDate))}</div>
        </div>
      </div>
    </div>
  `,e.mainFocusBox.querySelectorAll("[data-deposit-toast]").forEach(n=>{n.addEventListener("click",()=>u(n.dataset.depositToast||"Функция скоро появится"))})}function q(){if(!e.rightCol)return;const t=y(),a=d.deposits.reduce((i,n)=>i+n.amount,0),o=d.deposits.reduce((i,n)=>i+n.expectedProfit,0);e.rightCol.innerHTML=`
    <div class="stats-widget">
      <div class="box-header">
        <span class="box-title" style="font-size:14px;">Ваши депозиты</span>
      </div>
      <div class="income-stat" style="margin-top:16px;">
        <span class="income-label">Ожидаемая прибыль</span>
        <span class="income-val">${s(c(o,t?.currency||"TJS"))}</span>
      </div>
      <button class="btn-new-dep" type="button">Новый депозит</button>
    </div>
    <div class="popular-widget">
      <div class="box-header">
        <span class="box-title" style="font-size:14px;">Сводка</span>
      </div>
      <div class="utility-item" style="margin-top:16px;">
        <div class="utility-icon">🏦</div>
        <div class="utility-text">
          <div class="utility-title">Всего вкладов</div>
          <div class="utility-desc">${d.deposits.length} активных и закрытых записей</div>
        </div>
      </div>
      <div class="utility-item">
        <div class="utility-icon">💵</div>
        <div class="utility-text">
          <div class="utility-title">Общая сумма</div>
          <div class="utility-desc">${s(c(a,t?.currency||"TJS"))}</div>
        </div>
      </div>
    </div>
    <div class="popular-widget">
      <div class="box-header">
        <span class="box-title" style="font-size:14px;">Без мок-данных</span>
      </div>
      <div class="utility-item" style="margin-top:16px;">
        <div class="utility-icon" style="background:#dcfce7; color:#10b981;">✅</div>
        <div class="utility-text">
          <div class="utility-title">Только реальные депозиты</div>
          <div class="utility-desc">Фейковые накопительные вклады и цели удалены.</div>
        </div>
      </div>
    </div>
  `,e.rightCol.querySelector(".btn-new-dep")?.addEventListener("click",()=>{u("Открытие нового депозита будет подключено к реальному API.")})}function M(){if(!e.totalDisplay)return;const t=d.deposits.reduce((a,o)=>a+o.amount,0);e.totalDisplay.textContent=c(t,"TJS")}function N(t){e.depositsOverview&&(e.depositsOverview.innerHTML=""),e.middleList&&(e.middleList.innerHTML=""),e.rightCol&&(e.rightCol.innerHTML=""),e.mainFocusBox&&(e.mainFocusBox.innerHTML=`
      <div class="box-header">
        <span class="box-title">Не удалось загрузить депозиты</span>
      </div>
      <div style="color:#64748b;font-size:14px;line-height:1.7;">
        ${s(t?.message||"Попробуйте обновить страницу.")}
      </div>
    `),e.totalDisplay&&(e.totalDisplay.textContent="0 TJS")}document.addEventListener("DOMContentLoaded",I);
