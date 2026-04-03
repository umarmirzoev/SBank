import{i as w,g as k,a as L,s as b,f as m,b as I}from"./common-CrXjZbhM.js";let y=[],T=[],i=null,f="week";const e={accountsList:document.getElementById("accountsList"),profileName:document.getElementById("profileName"),detailTitle:document.getElementById("detailTitle"),selectedAccLabel:document.getElementById("selectedAccLabel"),selectedAccNumber:document.getElementById("selectedAccNumber"),selectedAccBalance:document.getElementById("selectedAccBalance"),selectedAccTrend:document.getElementById("selectedAccTrend"),selectedAccIban:document.getElementById("selectedAccIban"),balanceSecondary:document.getElementById("balanceSecondary"),miniBars:document.getElementById("miniBars"),operationsListMiddle:document.getElementById("operationsListMiddle"),operationsListWidget:document.getElementById("operationsListWidget"),transferActionBtn:document.getElementById("transferActionBtn"),periodButtons:Array.from(document.querySelectorAll(".date-controls .date-btn")).slice(0,3),statLabels:document.querySelectorAll(".bottom-bar .stat-label"),statValues:document.querySelectorAll(".bottom-bar .stat-val"),statPrimaryValue:document.querySelector(".bottom-bar .income-sum"),statLineFill:document.querySelector(".stat-line-fill")};async function H(){if(!w()){window.location.href="login.html";return}const t=k();e.profileName&&(e.profileName.textContent=t.fullName||"Пользователь"),q(),await W(),V()}function q(){const t=[{key:"day",text:"День"},{key:"week",text:"Неделя"},{key:"month",text:"Месяц"}];e.periodButtons.forEach((n,c)=>{const o=t[c];o&&(n.dataset.period=o.key,n.textContent=o.text,n.classList.toggle("active",o.key===f))})}async function W(){try{const[t,n]=await Promise.all([L("/api/accounts/my?page=1&pageSize=20",{auth:!0}),L("/api/transfers/my?page=1&pageSize=50",{auth:!0})]);y=t.items||t.Items||[],T=n.items||n.Items||[],F(),y.length>0?x(y[0].id||y[0].Id):B("У вас пока нет реальных счетов.")}catch(t){console.error("Failed to load accounts page",t),b("Ошибка загрузки счетов"),B(t.message||"Не удалось загрузить реальные данные.")}}function F(){if(!e.accountsList)return;if(y.length===0){e.accountsList.innerHTML=`
      <div class="empty-state" style="grid-column: span 4;">
        У вас пока нет реальных счетов.
      </div>
    `;return}const t=["blue","teal","yellow","green"],n=["💳","🏦","💼","📈"];e.accountsList.innerHTML=y.map((c,o)=>{const s=c.id||c.Id,r=c.type||c.Type||"Account",d=c.currency||c.Currency||"TJS",g=Number(c.balance??c.Balance??0),l=c.accountNumber||c.AccountNumber||"Без номера",p=c.status||c.Status||"Active",u=t[o%t.length],A=n[o%n.length];return`
      <div class="acc-card ${u}" data-account-id="${s}">
        <div class="card-top">
          <div class="card-icon-box" style="font-size:20px;">${A}</div>
          <div class="card-check">${p==="Active"?"✓":"!"}</div>
        </div>
        <div>
          <div class="card-label">${a(r)}</div>
          <div class="card-balance">${a(m(g,d))}</div>
          <div class="card-number">${a(l)}</div>
          <div class="card-sub">${a(p)}</div>
        </div>
      </div>
    `}).join(""),e.accountsList.querySelectorAll(".acc-card").forEach(c=>{c.addEventListener("click",()=>{x(c.dataset.accountId)})})}function x(t){if(i=y.find(d=>String(d.id||d.Id)===String(t)),!i)return;const n=i.type||i.Type||"Счёт",c=i.accountNumber||i.AccountNumber||"Без номера",o=i.iban||i.Iban||"",s=i.currency||i.Currency||"TJS",r=Number(i.balance??i.Balance??0);e.detailTitle&&(e.detailTitle.textContent="Детали счёта"),e.selectedAccLabel&&(e.selectedAccLabel.textContent=n),e.selectedAccNumber&&(e.selectedAccNumber.textContent=c),e.selectedAccBalance&&(e.selectedAccBalance.textContent=m(r,s)),e.selectedAccIban&&(e.selectedAccIban.textContent=o?`IBAN ${o}`:"IBAN не указан"),e.selectedAccTrend&&(e.selectedAccTrend.textContent=N()),e.balanceSecondary&&(e.balanceSecondary.textContent=`${m(r,s)} доступно`),P(r),$(),M()}function P(t){if(!e.miniBars)return;const n=e.miniBars.querySelectorAll(".mini-bar"),c=Number(t||0),o=Math.max(1,Math.round(c)||1);n.forEach((s,r)=>{const d=18+(o+r*17)%70;s.style.height=`${d}%`,s.classList.toggle("active",r===n.length-1)})}function $(){e.operationsListMiddle&&(e.operationsListMiddle.innerHTML=""),e.operationsListWidget&&(e.operationsListWidget.innerHTML="");const t=S().sort((n,c)=>new Date(c.createdAt||c.CreatedAt||0)-new Date(n.createdAt||n.CreatedAt||0));if(t.length===0){const n=`<div class="empty-state">По этому счёту нет реальных операций за ${v()}.</div>`;e.operationsListMiddle&&(e.operationsListMiddle.innerHTML=n),e.operationsListWidget&&(e.operationsListWidget.innerHTML=n);return}t.forEach((n,c)=>{e.operationsListMiddle&&(e.operationsListMiddle.innerHTML+=h(n,!0)),e.operationsListWidget&&c<4&&(e.operationsListWidget.innerHTML+=h(n,!1))})}function S(){const t=String(i?.id||i?.Id||""),n=D();return T.filter(c=>{const o=new Date(c.createdAt||c.CreatedAt||0).getTime();if(Number.isNaN(o)||o<n)return!1;const s=String(c.fromAccountId||c.FromAccountId||""),r=String(c.toAccountId||c.ToAccountId||"");return s===t||r===t})}function D(){const t=Date.now(),n=1440*60*1e3;return f==="day"?t-n:f==="month"?t-30*n:t-7*n}function h(t,n){const c=Number(t.amount??t.Amount??0),o=t.currency||t.Currency||"TJS",s=t.description||t.Description||"Операция",r=t.createdAt||t.CreatedAt,d=t.toAccountNumber||t.ToAccountNumber||"",g=t.fromAccountNumber||t.FromAccountNumber||"",l=String(i?.id||i?.Id||""),p=String(t.fromAccountId||t.FromAccountId||""),u=l&&l===p,A=u?"-":"+",C=u?"minus":"plus",E=u?`Получатель: ${d||"Счёт"}`:`Отправитель: ${g||"Счёт"}`;return n?`
      <div class="op-card" style="margin-bottom:8px;">
        <div class="avatar-sm" style="display:grid;place-items:center;background:#eff6ff;color:#2563eb;font-weight:800;">${u?"↑":"↓"}</div>
        <div class="op-info">
          <div class="op-name">${a(s)}</div>
          <div class="op-sub">${a(E)}</div>
        </div>
        <div class="op-amount-side">
          <div class="op-amt ${C}">
            ${A}${a(m(Math.abs(c),o))}
          </div>
          <div class="op-time">${a(I(r))}</div>
        </div>
      </div>
    `:`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
       <div style="width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:#eff6ff;color:#2563eb;font-weight:800;">${u?"↑":"↓"}</div>
       <div style="flex:1">
          <div style="font-size:12px; font-weight:700;">${a(s)}</div>
          <div style="font-size:10px; color:#94a3b8;">${a(I(r))}</div>
       </div>
       <div style="font-size:12px; font-weight:800; color: ${u?"#1e293b":"#10b981"}">
          ${A}${a(m(Math.abs(c),o))}
       </div>
    </div>
  `}function M(){const t=S(),n=String(i?.id||i?.Id||""),c=i?.currency||i?.Currency||"TJS";let o=0,s=0;t.forEach(l=>{const p=Math.abs(Number(l.amount??l.Amount??0));String(l.fromAccountId||l.FromAccountId||"")===n?s+=p:o+=p});const r=o+s,d=Number(i?.balance??i?.Balance??0),g=d>0?Math.min(100,Math.round(r/d*100)):0;e.statLabels[0]&&(e.statLabels[0].textContent=`Оборот за ${v()}`),e.statPrimaryValue&&(e.statPrimaryValue.textContent=m(r,c)),e.statLabels[1]&&(e.statLabels[1].textContent=`Входящие за ${v()}`),e.statValues[1]&&(e.statValues[1].textContent=m(o,c)),e.statLabels[2]&&(e.statLabels[2].textContent=`Исходящие за ${v()}`),e.statValues[2]&&(e.statValues[2].textContent=m(s,c)),e.statLineFill&&(e.statLineFill.style.width=`${g}%`)}function B(t){const n=t||"Реальные данные пока недоступны.";e.accountsList&&(e.accountsList.innerHTML=`
      <div class="empty-state" style="grid-column: span 4;">
        ${a(n)}
      </div>
    `),e.operationsListMiddle&&(e.operationsListMiddle.innerHTML=`<div class="empty-state">${a(n)}</div>`),e.operationsListWidget&&(e.operationsListWidget.innerHTML=`<div class="empty-state">${a(n)}</div>`)}function N(){return f==="day"?"За день":f==="month"?"За месяц":"За неделю"}function v(){return f==="day"?"день":f==="month"?"месяц":"неделю"}function V(){e.periodButtons.forEach(t=>{t.addEventListener("click",()=>{f=t.dataset.period||"week",e.periodButtons.forEach(n=>n.classList.toggle("active",n===t)),i&&(e.selectedAccTrend&&(e.selectedAccTrend.textContent=N()),$(),M())})}),e.transferActionBtn&&(e.transferActionBtn.onclick=()=>{if(!i){b("Сначала выберите счёт");return}const t=i.id||i.Id;window.location.href=`transfers.html?from=${t}`}),document.querySelectorAll(".copy-icon").forEach(t=>{t.onclick=()=>{const n=t.dataset.copy,o=document.getElementById(n)?.textContent?.trim();if(!o){b("Нечего копировать");return}navigator.clipboard.writeText(o).then(()=>{b("Скопировано в буфер обмена")})}})}function a(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}document.addEventListener("DOMContentLoaded",H);
