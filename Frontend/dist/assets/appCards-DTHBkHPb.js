import"./modulepreload-polyfill-B5Qt9EMX.js";import{i as b,g as y,a as m,s as h,f as l,b as x}from"./common-CrXjZbhM.js";const o={accounts:[],cards:[],transactions:[],selectedCardId:null},e={profileName:document.querySelector(".user-name"),profileAvatar:document.querySelector(".user-avatar"),cardsList:document.getElementById("cardsList"),pageTitle:document.querySelector(".page-title-row h1"),pageSubtitle:document.querySelector(".page-title-row p"),recommendationBar:document.querySelector(".date-pill"),primaryBox:document.querySelector(".primary-card-box"),operationsListMiddle:document.querySelector(".middle-col .ops-list"),functionsBox:document.querySelector(".middle-col .functions-box"),rightCol:document.querySelector(".right-col"),summaryFooter:document.querySelector(".summary-footer"),btnTransfer:document.getElementById("btnGoToTransfer")};function a(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function $(t){return String(t||"").replace(/\D/g,"").replace(/(\d{4})(?=\d)/g,"$1 ").trim()}function C(t){return String(t||"").startsWith("4")?"VISA":"CARD"}function S(t){const s=[{className:"blue",gradient:"linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",icon:"💳",accent:"#2563eb"},{className:"green",gradient:"linear-gradient(135deg, #34d399 0%, #059669 100%)",icon:"💠",accent:"#059669"},{className:"yellow",gradient:"linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",icon:"✨",accent:"#d97706"},{className:"purple",gradient:"linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)",icon:"🛡️",accent:"#4f46e5"}];return s[t%s.length]}function N(t,s){return String(t.type||t.Type||"").toLowerCase()==="virtual"?`Виртуальная карта ${s+1}`:o.cards.length===1?"Основная карта":`Карта ${s+1}`}function T(){const t=y()?.fullName||"Пользователь";if(e.profileName&&(e.profileName.textContent=t),e.profileAvatar){const s=t.split(" ").filter(Boolean).slice(0,2).map(i=>i[0]?.toUpperCase()||"").join("")||"SB",n=document.createElement("div");n.className="user-avatar",n.textContent=s,n.style.display="grid",n.style.placeItems="center",n.style.background="linear-gradient(135deg, #2563eb, #16a34a)",n.style.color="#fff",n.style.fontWeight="800",e.profileAvatar.replaceWith(n)}}async function L(){if(!b()){window.location.href="login.html";return}T(),I(),await A()}function I(){e.btnTransfer&&e.btnTransfer.addEventListener("click",()=>{window.location.href="app-transfers.html"})}async function A(){try{const[t,s,n]=await Promise.all([m("/api/accounts/my?page=1&pageSize=50",{auth:!0}),m("/api/cards/my?page=1&pageSize=50",{auth:!0}),m("/api/transfers/my?page=1&pageSize=50",{auth:!0})]);o.accounts=t.items||t.Items||[],o.cards=(s.items||s.Items||[]).map((i,r)=>{const c=S(r),d=o.accounts.find(f=>(f.id||f.Id)===(i.accountId||i.AccountId)),v=i.fullCardNumber||i.FullCardNumber||i.cardNumber||i.CardNumber||"";return{...i,uiIndex:r,theme:c,label:N(i,r),brand:C(v),fullNumber:v,formattedNumber:$(v),maskedNumber:i.maskedNumber||i.MaskedNumber||"",cvv:i.cvv||i.Cvv||"---",expiryDate:i.expiryDate||i.ExpiryDate||"--/--",holderName:i.cardHolderName||i.CardHolderName||"SOMONIBANK CLIENT",balance:Number(d?.balance??d?.Balance??0),currency:d?.currency||d?.Currency||"TJS",accountId:i.accountId||i.AccountId,accountNumber:d?.accountNumber||d?.AccountNumber||"",iban:d?.iban||d?.Iban||""}}),o.transactions=n.items||n.Items||[],o.selectedCardId=o.cards[0]?.id||o.cards[0]?.Id||null,g()}catch(t){console.error(t),h("Не удалось загрузить карты"),E(t)}}function g(){e.pageTitle&&(e.pageTitle.textContent="Карты"),e.pageSubtitle&&(e.pageSubtitle.textContent="Здесь показываются только ваши реальные карты без мок-данных."),w(),M(),B(),z(),H(),q(),k()}function w(){if(!e.recommendationBar)return;const t=o.cards.filter(i=>String(i.type||i.Type||"").toLowerCase()==="physical").length,s=o.cards.length-t,n=o.cards.length?"Рекомендуем держать основную карту для переводов и отдельную карту для онлайн-оплат.":"После выпуска карты здесь появятся рекомендации по её использованию.";e.recommendationBar.innerHTML=`
    <button class="date-btn active" type="button">Всего карт: ${o.cards.length}</button>
    <button class="date-btn" type="button">Физические: ${t}</button>
    <button class="date-btn" type="button">Виртуальные: ${s}</button>
    <button class="date-btn" type="button" style="max-width:420px;white-space:normal;text-align:left;line-height:1.3;">${a(n)}</button>
  `}function M(){if(e.cardsList){if(!o.cards.length){e.cardsList.innerHTML=`
      <div class="manage-card blue" style="grid-column:1 / -1;cursor:default;">
        <div class="manage-card-top">
          <div class="card-icon-sq">💳</div>
        </div>
        <div>
          <div class="manage-card-label">У вас пока нет карт</div>
          <div class="manage-card-bal">Когда карта появится на главной странице, она появится и здесь.</div>
        </div>
      </div>
    `;return}e.cardsList.innerHTML=o.cards.map(t=>{const s=t.id||t.Id,n=s===o.selectedCardId;return`
      <div class="manage-card ${t.theme.className}" data-card-id="${s}">
        <div class="manage-card-top">
          <div class="card-icon-sq">${t.theme.icon}</div>
          <div class="card-switch" style="${n?"":"background:#e2e8f0;"}"></div>
        </div>
        <div>
          <div class="manage-card-label">${a(t.label)}</div>
          <div class="manage-card-bal">${a(l(t.balance,t.currency))}</div>
          <div class="manage-card-num">${a(t.formattedNumber||t.maskedNumber)}</div>
        </div>
      </div>
    `}).join(""),e.cardsList.querySelectorAll("[data-card-id]").forEach(t=>{t.addEventListener("click",()=>{o.selectedCardId=t.dataset.cardId,g()})})}}function u(){return o.cards.find(t=>String(t.id||t.Id)===String(o.selectedCardId))||null}function B(){if(!e.primaryBox)return;const t=u();if(!t){e.primaryBox.innerHTML=`
      <div class="box-title">Карты не найдены</div>
      <div style="color:#64748b;font-size:14px;line-height:1.6;">
        Здесь появится информация по карте: номер, срок действия и CVV.
      </div>
    `;return}const s=p(t),n=s.filter(c=>String(c.direction)==="out").reduce((c,d)=>c+d.amount,0),i=s.filter(c=>String(c.direction)==="in").reduce((c,d)=>c+d.amount,0);e.primaryBox.innerHTML=`
    <div class="box-header">
      <span class="box-title">${a(t.label)}</span>
      <span style="font-size:12px;font-weight:800;color:${t.theme.accent};">${a(t.brand)}</span>
    </div>
    <div class="visual-card" style="background:${t.theme.gradient};">
      <div class="v-card-top">
        <div>
          <div class="v-card-chip"></div>
          <div class="v-card-name">${a(t.holderName)}</div>
          <div style="font-size:12px;opacity:0.9;">${a(t.formattedNumber)}</div>
        </div>
        <div>
          <div class="v-card-balance">${a(l(t.balance,t.currency))}</div>
          <div class="v-card-trend">${a(t.status||t.Status||"Active")}</div>
        </div>
      </div>
      <div class="v-card-bottom">
        <div class="v-card-number">${a(t.expiryDate)} · CVV ${a(t.cvv)}</div>
        <div class="v-card-brand">${a(t.brand)}</div>
      </div>
    </div>
    <div class="iban-display">
      <span>${a(t.accountNumber||"Счёт не найден")}</span>
      <span>${a(t.iban||"IBAN недоступен")}</span>
    </div>
    <div class="limits-section">
      <div class="limit-row">
        <span>Номер карты</span>
        <span class="limit-val">${a(t.formattedNumber)}</span>
      </div>
      <div class="limit-row">
        <span>Срок действия</span>
        <span class="limit-val">${a(t.expiryDate)}</span>
      </div>
      <div class="limit-row">
        <span>CVV</span>
        <span class="limit-val">${a(t.cvv)}</span>
      </div>
      <div class="limit-row">
        <span>Статус</span>
        <span class="limit-val">${a(t.status||t.Status||"Active")}</span>
      </div>
    </div>
    <button class="btn-transfer" id="btnGoToTransfer">
      Перевести
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <div style="margin-top:auto;">
      <div class="box-title" style="font-size:15px; margin-bottom:12px;">Сводка по карте</div>
      <div style="display:flex; align-items:baseline; gap:8px; flex-wrap:wrap;">
        <span style="font-size:20px; font-weight:900; color:#16a34a;">+ ${a(l(i,t.currency))}</span>
        <span style="font-size:20px; font-weight:900; color:#cbd5e1;">|</span>
        <span style="font-size:16px; font-weight:800; color:#1e293b;">- ${a(l(n,t.currency))}</span>
      </div>
      <div style="margin-top:14px;color:#64748b;font-size:13px;line-height:1.6;">
        Карта привязана к счёту ${a(t.accountNumber||"без счёта")} и показывает реальные данные без демо-вставок.
      </div>
    </div>
  `;const r=document.getElementById("btnGoToTransfer");r&&r.addEventListener("click",()=>{window.location.href="app-transfers.html"})}function p(t){return o.transactions.filter(s=>{const n=s.fromAccountId||s.FromAccountId,i=s.toAccountId||s.ToAccountId;return String(n)===String(t.accountId)||String(i)===String(t.accountId)}).map(s=>{const n=s.fromAccountId||s.FromAccountId,i=String(n)===String(t.accountId);return{raw:s,direction:i?"out":"in",amount:Number(s.amount??s.Amount??0)}})}function z(){if(!e.operationsListMiddle)return;const t=u(),s=t?p(t).slice(0,6):[];if(!s.length){e.operationsListMiddle.innerHTML=`
      <div class="box-title">Последние операции</div>
      <div class="op-item">
        <div class="op-icon">ℹ️</div>
        <div class="op-info">
          <div class="op-name">Операций пока нет</div>
          <div class="op-memo">После перевода или пополнения здесь появится реальная история по этой карте.</div>
        </div>
      </div>
    `;return}e.operationsListMiddle.innerHTML=`
    <div class="box-title">Последние операции</div>
    ${s.map(({raw:n,direction:i})=>{const r=Number(n.amount??n.Amount??0),c=n.currency||n.Currency||"TJS",d=n.description||n.Description||(i==="out"?"Перевод с карты":"Зачисление на карту"),v=i==="out"?n.toAccountNumber||n.ToAccountNumber||"Получатель":n.fromAccountNumber||n.FromAccountNumber||"Отправитель";return`
        <div class="op-item">
          <div class="op-icon">${i==="out"?"↗":"↙"}</div>
          <div class="op-info">
            <div class="op-name">${a(d)}</div>
            <div class="op-memo">${a(v)}</div>
          </div>
          <div class="op-amt-col">
            <div class="op-amt ${i==="in"?"pos":"neg"}">${i==="in"?"+":"-"} ${a(l(r,c))}</div>
            <div class="op-date">${a(x(n.createdAt||n.CreatedAt))}</div>
          </div>
        </div>
      `}).join("")}
  `}function H(){if(!e.functionsBox)return;const t=u();if(!t){e.functionsBox.innerHTML="";return}e.functionsBox.innerHTML=`
    <div class="box-title" style="margin-bottom:16px;">Данные карты</div>
    <div class="func-row">
      <div class="func-icon">💳</div>
      <div class="func-text">Полный номер карты</div>
      <div class="func-val" style="color:#1e293b;">${a(t.formattedNumber)}</div>
    </div>
    <div class="func-row">
      <div class="func-icon">📅</div>
      <div class="func-text">Срок действия</div>
      <div class="func-val" style="color:#1e293b;">${a(t.expiryDate)}</div>
    </div>
    <div class="func-row">
      <div class="func-icon">🔐</div>
      <div class="func-text">CVV</div>
      <div class="func-val" style="color:#1e293b;">${a(t.cvv)}</div>
    </div>
    <div class="func-row">
      <div class="func-icon">🏦</div>
      <div class="func-text">Привязанный счёт</div>
      <div class="func-val" style="color:#1e293b;">${a(t.accountNumber||"Нет данных")}</div>
    </div>
  `}function q(){if(!e.rightCol)return;const t=u(),s=o.cards.filter(r=>String(r.status||r.Status).toLowerCase()==="active").length,n=o.cards.reduce((r,c)=>r+Number(c.balance||0),0),i=o.cards.slice(0,4);e.rightCol.innerHTML=`
    <div class="insight-box">
      <div class="box-title" style="font-size:14px; margin-bottom:16px;">Рекомендуем для этой карты</div>
      <div class="insight-card">
        <div class="insight-icon">🛡️</div>
        <div class="insight-text">
          <div class="insight-name">Основная карта для переводов</div>
          <div class="insight-desc">Используйте ${a(t?.label||"эту карту")} для быстрых переводов и контроля баланса.</div>
        </div>
      </div>
      <div class="insight-card">
        <div class="insight-icon">📲</div>
        <div class="insight-text">
          <div class="insight-name">Проверяйте историю операций</div>
          <div class="insight-desc">После каждого перевода запись сразу появится в истории и SMS-уведомлении.</div>
        </div>
      </div>
    </div>
    <div class="mini-ops-box">
      <div class="box-title" style="font-size:14px; margin-bottom:16px;">Все ваши карты</div>
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${i.length?i.map(r=>`
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:32px; height:32px; border-radius:50%; background:#eff6ff; display:grid; place-items:center; font-size:14px;">${r.theme.icon}</div>
            <div style="flex:1">
              <div style="font-size:12px; font-weight:700;">${a(r.label)}</div>
              <div style="font-size:10px; color:#94a3b8;">${a(r.formattedNumber)}</div>
            </div>
            <div style="font-size:12px; font-weight:800; color:#1e293b;">
              ${a(l(r.balance,r.currency))}
            </div>
          </div>
        `).join(""):'<div style="color:#64748b;font-size:14px;">Карты пока не найдены.</div>'}
      </div>
    </div>
    <div class="insight-box">
      <div class="box-title" style="font-size:14px; margin-bottom:16px;">Сводка</div>
      <div class="limits-card" style="margin-top:0;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="font-size:18px;">💳</div>
          <div style="flex:1">
            <div style="font-size:12px; font-weight:800;">Активные карты</div>
            <div style="font-size:10px; color:#94a3b8;">Без мок-данных</div>
          </div>
          <div style="font-size:12px; font-weight:800;">${s}</div>
        </div>
        <div class="limit-progress-bar">
          <div class="limit-fill" style="width:${o.cards.length?Math.max(20,s/o.cards.length*100):0}%;"></div>
        </div>
      </div>
      <div style="margin-top:16px;color:#64748b;font-size:13px;line-height:1.6;">
        Общий баланс по картам: <strong style="color:#1e293b;">${a(l(n,"TJS"))}</strong>
      </div>
    </div>
  `}function k(){if(!e.summaryFooter)return;const t=u(),s=t?p(t):[],n=s.filter(c=>c.direction==="out").reduce((c,d)=>c+d.amount,0),i=s.filter(c=>c.direction==="in").reduce((c,d)=>c+d.amount,0),r=t?.balance?Math.min(100,Math.max(10,Number(t.balance))):10;e.summaryFooter.innerHTML=`
    <div class="footer-stat">
      <span class="footer-label">Поступления</span>
      <span class="footer-val">+ ${a(l(i,t?.currency||"TJS"))}</span>
    </div>
    <div class="footer-progress-track">
      <div class="footer-progress-fill" style="width:${r}%;"></div>
    </div>
    <div class="footer-stat" style="text-align: right;">
      <span class="footer-label">Списания</span>
      <span class="footer-val">- ${a(l(n,t?.currency||"TJS"))}</span>
    </div>
  `}function E(t){e.primaryBox&&(e.primaryBox.innerHTML=`
    <div class="box-title">Не удалось загрузить страницу карт</div>
    <div style="margin-top:12px;color:#64748b;font-size:14px;line-height:1.6;">
      ${a(t?.message||"Попробуйте обновить страницу.")}
    </div>
  `,e.cardsList&&(e.cardsList.innerHTML=""),e.operationsListMiddle&&(e.operationsListMiddle.innerHTML=""),e.functionsBox&&(e.functionsBox.innerHTML=""),e.rightCol&&(e.rightCol.innerHTML=""),e.summaryFooter&&(e.summaryFooter.innerHTML=""))}document.addEventListener("DOMContentLoaded",L);
