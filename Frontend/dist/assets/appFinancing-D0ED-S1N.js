import{i as g,g as f,s as v,a as y,f as o,b as u}from"./common-Df-m9AMb.js";const n={accounts:[],loans:[],selectedLoanId:null},e={profileName:document.querySelector(".user-name"),creditsOverview:document.getElementById("creditsOverview"),middleList:document.querySelector(".credit-list"),mainFocusBox:document.querySelector(".focus-box"),pageTitle:document.querySelector(".page-title-row h1"),pageSubtitle:document.querySelector(".page-title-row p"),datePill:document.querySelector(".date-pill"),quickTabs:document.querySelector(".quick-tabs"),rightCol:document.querySelector(".right-col"),knowledgeSection:document.querySelector(".knowledge-section")};function a(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function h(t){const s=[{className:"blue",icon:"🏦"},{className:"green",icon:"🚗"},{className:"yellow",icon:"💰"}];return s[t%s.length]}function x(t,s){const i=Number(t.termMonths||t.TermMonths||0);return i>=24?"Долгосрочный кредит":i>=12?"Потребительский кредит":`Кредит ${s+1}`}function c(t){const s=String(t||"").toLowerCase();return s==="active"?"Активен":s==="pending"?"На рассмотрении":s==="paid"?"Погашен":s==="rejected"?"Отклонён":t||"Неизвестно"}function w(){const t=f();e.profileName&&(e.profileName.textContent=t?.fullName||"Пользователь")}async function $(){if(!g()){window.location.href="login.html";return}w(),L(),await S()}function L(){e.pageTitle&&(e.pageTitle.textContent="Кредиты"),e.pageSubtitle&&(e.pageSubtitle.textContent="Здесь показываются только ваши реальные кредиты без мок-данных."),e.datePill&&(e.datePill.innerHTML=`
      <button class="date-btn active" type="button">Реальные данные</button>
      <button class="date-btn" type="button">Без демо-кредитов</button>
    `),e.quickTabs&&(e.quickTabs.innerHTML=`
      <a href="#" class="tab-link" data-loan-action="pay">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Погасить
      </a>
      <a href="#" class="tab-link" data-loan-action="apply">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Новый кредит
      </a>
    `,e.quickTabs.querySelectorAll("[data-loan-action]").forEach(t=>{t.addEventListener("click",s=>{s.preventDefault();const i=t.dataset.loanAction==="pay"?"Функция погашения кредита будет подключена на реальный API.":"Подача новой заявки на кредит будет подключена на реальный API.";v(i)})}))}async function S(){try{const[t,s]=await Promise.all([y("/api/accounts/my?page=1&pageSize=50",{auth:!0}),y("/api/loan/my?page=1&pageSize=50",{auth:!0})]);n.accounts=t.items||t.Items||[],n.loans=(s.items||s.Items||[]).map((i,d)=>{const l=h(d),r=n.accounts.find(b=>String(b.id||b.Id)===String(i.accountId||i.AccountId));return{...i,theme:l,label:x(i,d),icon:l.icon,amount:Number(i.amount??i.Amount??0),remainingAmount:Number(i.remainingAmount??i.RemainingAmount??0),interestRate:Number(i.interestRate??i.InterestRate??0),monthlyPayment:Number(i.monthlyPayment??i.MonthlyPayment??0),termMonths:Number(i.termMonths??i.TermMonths??0),currency:i.currency||i.Currency||"TJS",status:i.status||i.Status||"Unknown",startDate:i.startDate||i.StartDate,endDate:i.endDate||i.EndDate,accountNumber:r?.accountNumber||r?.AccountNumber||"",iban:r?.iban||r?.Iban||""}}),n.selectedLoanId=n.loans[0]?.id||n.loans[0]?.Id||null,m()}catch(t){console.error("Failed to load loans",t),q(t),v("Не удалось загрузить кредиты")}}function m(){k(),M(),T(),A(),I()}function k(){if(e.creditsOverview){if(!n.loans.length){e.creditsOverview.innerHTML=`
      <div class="row-card blue" style="grid-column:1 / -1;cursor:default;">
        <div class="row-card-top">
          <div class="card-icon-sq">🏦</div>
        </div>
        <div>
          <div class="card-label">У вас пока нет кредитов</div>
          <div class="card-bal">0 TJS</div>
          <div class="card-details">Когда кредит появится в системе, он отобразится здесь.</div>
        </div>
      </div>
    `;return}e.creditsOverview.innerHTML=n.loans.map(t=>{const s=t.status.toLowerCase()==="paid",i=t.id||t.Id,d=s?"Погашен":"Подробнее";return`
      <div class="row-card ${t.theme.className}" data-loan-id="${i}">
        <div class="row-card-top">
          <div class="card-icon-sq">${t.icon}</div>
          <div class="card-rate">${a(String(t.interestRate))}%</div>
        </div>
        <div>
          <div class="card-label">${a(t.label)}</div>
          <div class="card-bal">${a(o(t.remainingAmount,t.currency))}</div>
          <div class="card-details">До ${a(u(t.endDate))} · ${a(c(t.status))}</div>
        </div>
        <div class="card-btn">${a(d)}</div>
      </div>
    `}).join(""),e.creditsOverview.querySelectorAll("[data-loan-id]").forEach(t=>{t.addEventListener("click",()=>{n.selectedLoanId=t.dataset.loanId,m()})})}}function M(){if(e.middleList){if(!n.loans.length){e.middleList.innerHTML=`
      <div class="box-header">
        <span class="box-title">Ваши кредиты</span>
      </div>
      <div class="credit-item">
        <div class="item-icon">ℹ️</div>
        <div class="item-info">
          <div class="item-name">Кредитов нет</div>
          <div class="item-sub">Здесь будет список ваших реальных кредитов.</div>
        </div>
      </div>
    `;return}e.middleList.innerHTML=`
    <div class="box-header">
      <span class="box-title">Ваши кредиты</span>
    </div>
    ${n.loans.map(t=>`
        <div class="credit-item" data-loan-id="${t.id||t.Id}" style="cursor:pointer;">
          <div class="item-icon">${t.icon}</div>
          <div class="item-info">
            <div class="item-name">${a(t.label)}</div>
            <div class="item-sub">Срок: ${a(`${t.termMonths} мес.`)}</div>
          </div>
          <div class="item-val-col">
            <div class="item-val">${a(o(t.remainingAmount,t.currency))}</div>
            <div class="item-date">${a(u(t.endDate))}</div>
          </div>
        </div>
      `).join("")}
  `,e.middleList.querySelectorAll("[data-loan-id]").forEach(t=>{t.addEventListener("click",()=>{n.selectedLoanId=t.dataset.loanId,m()})})}}function p(){return n.loans.find(t=>String(t.id||t.Id)===String(n.selectedLoanId))||null}function T(){if(!e.mainFocusBox)return;const t=p();if(!t){e.mainFocusBox.innerHTML=`
      <div class="box-header">
        <span class="box-title">Кредиты не найдены</span>
      </div>
      <div style="color:#64748b;font-size:14px;line-height:1.7;">
        На этой странице больше нет мок-данных. Когда у аккаунта появится реальный кредит, здесь будет показана его сводка.
      </div>
    `;return}const s=Math.max(0,t.amount-t.remainingAmount),i=t.amount>0?Math.max(0,Math.min(100,s/t.amount*100)):0;e.mainFocusBox.innerHTML=`
    <div class="box-header">
      <span class="box-title">${a(t.label)}</span>
    </div>
    <div class="visual-loan">
      <div class="v-loan-top">
        <div>
          <div class="v-loan-title">${t.icon} ${a(t.label)}</div>
          <div style="font-size:11px; opacity:0.7; margin-top:4px;">${a(t.accountNumber||t.iban||"Счёт не найден")}</div>
        </div>
        <div>
          <div class="v-loan-bal">${a(o(t.remainingAmount,t.currency))}</div>
          <div class="v-loan-trend">${a(c(t.status))}</div>
        </div>
      </div>
      <div style="font-size:12px; margin-top:20px; font-weight:700;">
        Погашено ${a(o(s,t.currency))} из ${a(o(t.amount,t.currency))}
        <span style="float:right; color:#dcfce7;">${a(String(t.interestRate))}% годовых</span>
      </div>
      <div class="v-loan-bottom">
        <div class="v-loan-info">Срок кредита: ${a(`${t.termMonths} мес.`)}</div>
        <div class="v-loan-rate">До ${a(u(t.endDate))}</div>
      </div>
    </div>
    <div class="loan-stats-row">
      <div class="loan-stat-box">
        <span class="loan-stat-label">Ежемесячный платёж</span>
        <span class="loan-stat-val">${a(o(t.monthlyPayment,t.currency))}</span>
        <div class="loan-stat-sub">Следующий платёж по графику</div>
      </div>
      <div class="loan-stat-box">
        <span class="loan-stat-label">Статус</span>
        <span class="loan-stat-val">${a(c(t.status))}</span>
      </div>
    </div>
    <div>
      <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:800; color:#64748b;">
        <span>Прогресс погашения</span>
        <span style="color:#1e293b;">${Math.round(i)}%</span>
      </div>
      <div class="repayment-bar">
        <div class="bar-segment principal" style="width:${i}%;"></div>
        <div class="bar-segment interest" style="width:${100-i}%;"></div>
      </div>
      <div style="display:flex; gap:20px; font-size:11px; font-weight:800; color:#94a3b8; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:6px;"><div style="width:8px; height:8px; border-radius:2px; background:#3b82f6;"></div> Погашено <span style="color:#1e293b;">${a(o(s,t.currency))}</span></div>
        <div style="display:flex; align-items:center; gap:6px;"><div style="width:8px; height:8px; border-radius:2px; background:#fbbf24;"></div> Осталось <span style="color:#1e293b;">${a(o(t.remainingAmount,t.currency))}</span></div>
      </div>
    </div>
    <div class="focus-actions">
      <button class="action-btn ghost" type="button" data-loan-toast="История платежей по кредиту будет подключена к реальному API.">История</button>
      <button class="action-btn ghost" type="button" data-loan-toast="Подробные условия кредита будут показаны из backend.">Условия</button>
      <button class="action-btn primary" type="button" data-loan-toast="Оплата кредита будет доступна через реальный API платежей.">Погасить</button>
    </div>
  `,e.mainFocusBox.querySelectorAll("[data-loan-toast]").forEach(d=>{d.addEventListener("click",()=>v(d.dataset.loanToast||"Функция скоро появится"))})}function A(){if(!e.knowledgeSection)return;const t=p();e.knowledgeSection.innerHTML=`
    <h3>Полезно знать</h3>
    <div class="knowledge-card">
      <div class="k-icon">📘</div>
      <div class="k-text">
        <div class="k-title">Статус кредита</div>
        <div class="k-desc">Сейчас по выбранному кредиту статус: ${a(c(t?.status||""))}</div>
      </div>
    </div>
    <div class="knowledge-card">
      <div class="k-icon">📅</div>
      <div class="k-text">
        <div class="k-title">Срок кредита</div>
        <div class="k-desc">Дата окончания: ${a(t?u(t.endDate):"не указана")}</div>
      </div>
    </div>
  `}function I(){if(!e.rightCol)return;const t=p(),s=n.loans.reduce((d,l)=>d+l.remainingAmount,0),i=n.loans.filter(d=>d.status.toLowerCase()==="active").length;e.rightCol.innerHTML=`
    <div class="cta-widget">
      <div class="box-header">
        <span class="box-title" style="font-size:14px;">Сводка по кредитам</span>
      </div>
      <div style="margin-top:16px;color:#64748b;font-size:13px;line-height:1.7;text-align:left;">
        <div><strong style="color:#1e293b;">Всего кредитов:</strong> ${n.loans.length}</div>
        <div><strong style="color:#1e293b;">Активных:</strong> ${i}</div>
        <div><strong style="color:#1e293b;">Остаток:</strong> ${a(o(s,t?.currency||"TJS"))}</div>
      </div>
      <button class="btn-new-loan" type="button">Новый кредит</button>
    </div>
    <div class="payments-widget">
      <div class="box-header" style="margin-bottom:20px;">
        <span class="box-title" style="font-size:14px;">Текущие данные</span>
      </div>
      ${t?`
        <div class="pay-item">
          <div class="pay-icon">💸</div>
          <div class="pay-info">
            <div class="pay-name">Ежемесячный платёж</div>
            <div class="pay-sub">${a(t.label)}</div>
          </div>
          <div class="pay-amt">${a(o(t.monthlyPayment,t.currency))}</div>
        </div>
        <div class="pay-item">
          <div class="pay-icon">🏦</div>
          <div class="pay-info">
            <div class="pay-name">Связанный счёт</div>
            <div class="pay-sub">${a(t.accountNumber||"Нет номера счёта")}</div>
          </div>
          <div class="pay-amt">${a(c(t.status))}</div>
        </div>
      `:`
        <div style="color:#64748b;font-size:14px;line-height:1.7;">Реальных платежей по кредитам пока нет.</div>
      `}
    </div>
    <div class="offers-widget">
      <div class="box-header" style="margin-bottom:20px;">
        <span class="box-title" style="font-size:14px;">Без мок-данных</span>
      </div>
      <div class="offer-item">
        <div class="o-icon">✅</div>
        <div class="o-info">
          <div class="o-name">Только реальные кредиты</div>
          <div class="o-desc">Фейковые ипотека, автокредит и предложения удалены.</div>
        </div>
      </div>
      <div class="offer-item">
        <div class="o-icon" style="background:#dcfce7;">🔄</div>
        <div class="o-info">
          <div class="o-name">Страница обновляется из API</div>
          <div class="o-desc">Если появится новый кредит, он сразу отобразится здесь.</div>
        </div>
      </div>
    </div>
  `,e.rightCol.querySelector(".btn-new-loan")?.addEventListener("click",()=>{v("Новая заявка на кредит будет подключена к реальному API.")})}function q(t){e.creditsOverview&&(e.creditsOverview.innerHTML=""),e.middleList&&(e.middleList.innerHTML=""),e.rightCol&&(e.rightCol.innerHTML=""),e.knowledgeSection&&(e.knowledgeSection.innerHTML=""),e.mainFocusBox&&(e.mainFocusBox.innerHTML=`
      <div class="box-header">
        <span class="box-title">Не удалось загрузить кредиты</span>
      </div>
      <div style="color:#64748b;font-size:14px;line-height:1.7;">
        ${a(t?.message||"Попробуйте обновить страницу.")}
      </div>
    `)}document.addEventListener("DOMContentLoaded",$);
