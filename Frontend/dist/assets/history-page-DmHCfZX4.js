import{i as x,g as S,a as p,s as A,b,f as m}from"./common-B0I44Mcg.js";const l={accounts:[],transfers:[],billPayments:[],historyItems:[]},o={profileName:document.querySelector(".user-name"),userProfile:document.querySelector(".user-profile"),title:document.querySelector(".page-title-row h1"),subtitle:document.querySelector(".page-title-row p"),topFilterBar:document.querySelector(".top-filter-bar"),secondaryFilter:document.querySelector(".secondary-filter"),listCol:document.querySelector(".list-col"),analysisSidebar:document.querySelector(".analysis-sidebar")};async function $(){if(!x()){window.location.href="login.html";return}w(),I(),await N()}function w(){const i=S()?.fullName||"Пользователь";o.profileName&&(o.profileName.textContent=i);const n=o.userProfile?.querySelector(".user-avatar");if(n){const t=i.split(" ").filter(Boolean).slice(0,2).map(r=>r[0]?.toUpperCase()||"").join("")||"SB",s=document.createElement("div");s.className="user-avatar",s.textContent=t,s.style.display="grid",s.style.placeItems="center",s.style.background="linear-gradient(135deg, #2563eb, #16a34a)",s.style.color="#fff",s.style.fontWeight="800",n.replaceWith(s)}}function I(){if(o.title&&(o.title.textContent="История операций"),o.subtitle&&(o.subtitle.textContent="Здесь показываются реальные переводы и платежи, включая мобильную связь."),o.topFilterBar&&(o.topFilterBar.innerHTML=`
      <div class="date-range-pill">
        Реальные операции
      </div>
    `),o.secondaryFilter){o.secondaryFilter.innerHTML=`
      <button class="sec-btn active" type="button">Все операции</button>
      <button class="sec-btn" type="button" data-filter="outgoing">Исходящие</button>
      <button class="sec-btn" type="button" data-filter="incoming">Входящие</button>
    `,o.secondaryFilter.querySelectorAll("[data-filter]").forEach(i=>{i.addEventListener("click",()=>{o.secondaryFilter.querySelectorAll(".sec-btn").forEach(n=>n.classList.remove("active")),i.classList.add("active"),y(i.dataset.filter||"all")})});const e=o.secondaryFilter.querySelector(".sec-btn");e&&e.addEventListener("click",()=>{o.secondaryFilter.querySelectorAll(".sec-btn").forEach(i=>i.classList.remove("active")),e.classList.add("active"),y("all")})}}async function N(){try{const[e,i,n]=await Promise.all([p("/api/accounts/my?page=1&pageSize=20",{auth:!0}),p("/api/transfers/my?page=1&pageSize=50",{auth:!0}),p("/api/BillPayment/my?page=1&pageSize=50",{auth:!0})]);l.accounts=e.items||e.Items||[],l.transfers=i.items||i.Items||[],l.billPayments=n.items||n.Items||[],l.historyItems=L(),y("all"),D()}catch(e){console.error(e),o.listCol&&(o.listCol.innerHTML=`
        <div class="analysis-box">
          <div class="box-title">Не удалось загрузить историю</div>
          <p style="margin-top:12px;color:#64748b;font-size:14px;">${a(e.message||"Попробуйте обновить страницу.")}</p>
        </div>
      `),o.analysisSidebar&&(o.analysisSidebar.innerHTML=""),A("История операций пока недоступна")}}function L(){const e=new Set(l.accounts.map(t=>String(t.id||t.Id))),i=l.transfers.map(t=>{const s=String(t.fromAccountId||t.FromAccountId||""),r=!!(s&&e.has(s)),c=t.toAccountNumber||t.ToAccountNumber||"Неизвестно",u=t.fromAccountNumber||t.FromAccountNumber||"Неизвестно",d=t.createdAt||t.CreatedAt,v=Number(t.amount??t.Amount??0),g=t.currency||t.Currency||"TJS",f=r?c:u,h=r?`Перевод на ${f}`:`Зачисление от ${f}`;return{kind:"transfer",direction:r?"outgoing":"incoming",title:h,subtitle:t.description||t.Description||"Перевод",amount:v,currency:g,createdAt:d,status:"успешно",timeLabel:b(d),counterparty:f,sortableDate:new Date(d||Date.now()).getTime()}}),n=l.billPayments.map(t=>{const s=t.createdAt||t.CreatedAt,r=Number(t.amount??t.Amount??0),c=t.currency||t.Currency||"TJS",u=t.accountNumber||t.AccountNumber||"Неизвестно",d=t.providerName||t.ProviderName||"Оператор";return{kind:"bill-payment",direction:"outgoing",title:`${d} ${u}`,subtitle:"Пополнение мобильной связи",amount:r,currency:c,createdAt:s,status:"успешно",timeLabel:b(s),counterparty:u,providerName:d,phone:u,sortableDate:new Date(s||Date.now()).getTime()}});return[...i,...n].sort((t,s)=>s.sortableDate-t.sortableDate)}function y(e){if(!o.listCol)return;const i=l.historyItems.filter(t=>e==="outgoing"?t.direction==="outgoing":e==="incoming"?t.direction==="incoming":!0);if(!i.length){o.listCol.innerHTML=`
      <div class="analysis-box">
        <div class="box-title">Операций пока нет</div>
        <p style="margin-top:12px;color:#64748b;font-size:14px;">После первого перевода или платежа история появится здесь автоматически.</p>
      </div>
    `;return}const n=new Map;i.forEach(t=>{const r=new Date(t.createdAt||Date.now()).toDateString();n.has(r)||n.set(r,[]),n.get(r).push(t)}),o.listCol.innerHTML=Array.from(n.entries()).map(([t,s])=>C(t,s)).join("")}function C(e,i){const t=new Date(e).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});return`
    <div class="date-group">
      <div class="date-header">
        <div class="date-label">${a(z(t))}</div>
        <div class="date-subtext">${i.length} операций</div>
      </div>
      ${i.map(s=>T(s)).join("")}
    </div>
  `}function T(e){const i=e.direction==="outgoing",n=i?"-":"+",t=i?"":"pos",s=e.kind==="bill-payment"?"☎":i?"↗":"↙",r=e.kind==="bill-payment"?"#ede9fe":i?"#eff6ff":"#dcfce7",c=e.kind==="bill-payment"?"#7c3aed":i?"#2563eb":"#16a34a";return`
    <div class="history-item">
      <div class="hist-icon" style="background:${r};color:${c};font-weight:900;">${s}</div>
      <div>
        <div class="hist-title">${a(e.title)}</div>
        <div class="hist-desc">${a(e.subtitle)}</div>
      </div>
      <div class="hist-amt ${t}">${n} ${a(m(e.amount,e.currency))}</div>
      <div class="hist-status">${a(e.status)}</div>
      <div class="hist-time">${a(e.timeLabel)}</div>
    </div>
  `}function D(){if(!o.analysisSidebar)return;const e=l.historyItems.filter(r=>r.direction==="outgoing"),i=l.historyItems.filter(r=>r.direction==="incoming"),n=e.reduce((r,c)=>r+Number(c.amount||0),0),t=i.reduce((r,c)=>r+Number(c.amount||0),0),s=l.historyItems[0];o.analysisSidebar.innerHTML=`
    <div class="analysis-box">
      <div class="box-header-row">
        <span class="box-title">Сводка</span>
      </div>
      <div class="summary-bars">
        <div style="font-size:12px;font-weight:800;color:#64748b;display:flex;justify-content:space-between;">
          <span>Исходящие</span>
          <span>${a(m(n,"TJS"))}</span>
        </div>
        <div class="sum-bar"><div class="sum-bar-fill" style="width:100%;background:#2563eb;"></div></div>
        <div style="font-size:12px;font-weight:800;color:#64748b;display:flex;justify-content:space-between;margin-top:12px;">
          <span>Входящие</span>
          <span>${a(m(t,"TJS"))}</span>
        </div>
        <div class="sum-bar"><div class="sum-bar-fill" style="width:100%;background:#16a34a;"></div></div>
      </div>
    </div>
    <div class="analysis-box">
      <div class="box-header-row">
        <span class="box-title">Последняя операция</span>
      </div>
      ${s?q(s):'<div style="color:#64748b;font-size:14px;">Операций пока нет.</div>'}
    </div>
    <div class="analysis-box">
      <div class="box-header-row">
        <span class="box-title">Чек</span>
      </div>
      <div style="color:#64748b;font-size:14px;line-height:1.6;">
        В истории сохраняются номер, сумма, оператор и точное время платежа.
      </div>
    </div>
  `}function q(e){const i=e.direction==="outgoing",n=e.kind==="bill-payment"?"Платеж мобильной связи":i?"Исходящий перевод":"Входящий перевод",t=e.kind==="bill-payment"?`${e.providerName} • ${e.phone}`:e.counterparty;return`
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:15px;font-weight:800;color:#0f172a;">${a(n)}</div>
      <div style="font-size:14px;color:#64748b;">${a(t)}</div>
      <div style="font-size:22px;font-weight:900;color:${i?"#2563eb":"#16a34a"};">
        ${i?"-":"+"} ${a(m(e.amount,e.currency))}
      </div>
      <div style="font-size:12px;color:#94a3b8;">${a(e.timeLabel)}</div>
    </div>
  `}function a(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function z(e){return e&&e.charAt(0).toUpperCase()+e.slice(1)}document.addEventListener("DOMContentLoaded",$);
