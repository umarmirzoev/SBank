import{i as x,g as S,a as y,s as w,f as m,b as v}from"./common-CbAfz2AF.js";const l={accounts:[],transactions:[]},o={profileName:document.querySelector(".user-name"),userProfile:document.querySelector(".user-profile"),title:document.querySelector(".page-title-row h1"),subtitle:document.querySelector(".page-title-row p"),topFilterBar:document.querySelector(".top-filter-bar"),secondaryFilter:document.querySelector(".secondary-filter"),listCol:document.querySelector(".list-col"),analysisSidebar:document.querySelector(".analysis-sidebar")};async function $(){if(!x()){window.location.href="login.html";return}C(),I(),await T()}function C(){const s=S()?.fullName||"Пользователь";o.profileName&&(o.profileName.textContent=s);const n=o.userProfile?.querySelector(".user-avatar");if(n){const r=s.split(" ").filter(Boolean).slice(0,2).map(c=>c[0]?.toUpperCase()||"").join("")||"SB",t=document.createElement("div");t.className="user-avatar",t.textContent=r,t.style.display="grid",t.style.placeItems="center",t.style.background="linear-gradient(135deg, #2563eb, #16a34a)",t.style.color="#fff",t.style.fontWeight="800",n.replaceWith(t)}}function I(){if(o.title&&(o.title.textContent="История переводов"),o.subtitle&&(o.subtitle.textContent="Здесь показываются ваши реальные переводы и зачисления без мок-данных."),o.topFilterBar&&(o.topFilterBar.innerHTML=`
      <div class="date-range-pill">
        Реальные операции
      </div>
    `),o.secondaryFilter){o.secondaryFilter.innerHTML=`
      <button class="sec-btn active" type="button">Все переводы</button>
      <button class="sec-btn" type="button" data-filter="outgoing">Исходящие</button>
      <button class="sec-btn" type="button" data-filter="incoming">Входящие</button>
    `,o.secondaryFilter.querySelectorAll("[data-filter]").forEach(s=>{s.addEventListener("click",()=>{o.secondaryFilter.querySelectorAll(".sec-btn").forEach(n=>n.classList.remove("active")),s.classList.add("active"),f(s.dataset.filter||"all")})});const e=o.secondaryFilter.querySelector(".sec-btn");e&&e.addEventListener("click",()=>{o.secondaryFilter.querySelectorAll(".sec-btn").forEach(s=>s.classList.remove("active")),e.classList.add("active"),f("all")})}}async function T(){try{const[e,s]=await Promise.all([y("/api/accounts/my?page=1&pageSize=20",{auth:!0}),y("/api/transfers/my?page=1&pageSize=50",{auth:!0})]);l.accounts=e.items||e.Items||[],l.transactions=s.items||s.Items||[],f("all"),L()}catch(e){console.error(e),o.listCol&&(o.listCol.innerHTML=`
        <div class="analysis-box">
          <div class="box-title">Не удалось загрузить историю</div>
          <p style="margin-top:12px;color:#64748b;font-size:14px;">${a(e.message||"Попробуйте обновить страницу.")}</p>
        </div>
      `),o.analysisSidebar&&(o.analysisSidebar.innerHTML=""),w("История переводов пока недоступна")}}function f(e){if(!o.listCol)return;const s=new Set(l.accounts.map(t=>t.id||t.Id)),n=l.transactions.filter(t=>{const c=t.fromAccountId||t.FromAccountId,i=c&&s.has(c);return e==="outgoing"?!!i:e==="incoming"?!i:!0});if(n.length===0){o.listCol.innerHTML=`
      <div class="analysis-box">
        <div class="box-title">Операций пока нет</div>
        <p style="margin-top:12px;color:#64748b;font-size:14px;">После первого перевода история появится здесь автоматически.</p>
      </div>
    `;return}const r=new Map;n.forEach(t=>{const i=new Date(t.createdAt||t.CreatedAt||Date.now()).toDateString();r.has(i)||r.set(i,[]),r.get(i).push(t)}),o.listCol.innerHTML=Array.from(r.entries()).map(([t,c])=>N(t,c,s)).join("")}function N(e,s,n){const t=new Date(e).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});return`
    <div class="date-group">
      <div class="date-header">
        <div class="date-label">${a(z(t))}</div>
        <div class="date-subtext">${s.length} операций</div>
      </div>
      ${s.map(c=>F(c,n)).join("")}
    </div>
  `}function F(e,s){const n=e.fromAccountId||e.FromAccountId,r=e.toAccountNumber||e.ToAccountNumber||"Неизвестно",t=e.fromAccountNumber||e.FromAccountNumber||"Неизвестно",c=e.description||e.Description||"Перевод",i=e.createdAt||e.CreatedAt,d=Number(e.amount??e.Amount??0),b=e.currency||e.Currency||"TJS",u=n&&s.has(n),p=u?r:t,g=u?"-":"+",A=u?"":"pos",h=u?`Перевод на ${p}`:`Зачисление от ${p}`;return`
    <div class="history-item">
      <div class="hist-icon" style="background:${u?"#eff6ff":"#dcfce7"};color:${u?"#2563eb":"#16a34a"};font-weight:900;">${u?"↗":"↙"}</div>
      <div>
        <div class="hist-title">${a(h)}</div>
        <div class="hist-desc">${a(c)}</div>
      </div>
      <div class="hist-amt ${A}">${g} ${a(m(d,b))}</div>
      <div class="hist-status">успешно</div>
      <div class="hist-time">${a(v(i))}</div>
    </div>
  `}function L(){if(!o.analysisSidebar)return;const e=new Set(l.accounts.map(i=>i.id||i.Id)),s=l.transactions.filter(i=>e.has(i.fromAccountId||i.FromAccountId)),n=l.transactions.filter(i=>!e.has(i.fromAccountId||i.FromAccountId)),r=s.reduce((i,d)=>i+Number(d.amount??d.Amount??0),0),t=n.reduce((i,d)=>i+Number(d.amount??d.Amount??0),0),c=l.transactions[0];o.analysisSidebar.innerHTML=`
    <div class="analysis-box">
      <div class="box-header-row">
        <span class="box-title">Сводка</span>
      </div>
      <div class="summary-bars">
        <div style="font-size:12px;font-weight:800;color:#64748b;display:flex;justify-content:space-between;">
          <span>Исходящие</span>
          <span>${a(m(r,"TJS"))}</span>
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
      ${c?q(c,e):'<div style="color:#64748b;font-size:14px;">Операций пока нет.</div>'}
    </div>
    <div class="analysis-box">
      <div class="box-header-row">
        <span class="box-title">SMS</span>
      </div>
      <div style="color:#64748b;font-size:14px;line-height:1.6;">
        После успешного перевода отправляется SMS с датой, временем, суммой и получателем.
      </div>
    </div>
  `}function q(e,s){const n=e.fromAccountId||e.FromAccountId,r=n&&s.has(n),t=r?e.toAccountNumber||e.ToAccountNumber||"Неизвестно":e.fromAccountNumber||e.FromAccountNumber||"Неизвестно";return`
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:15px;font-weight:800;color:#0f172a;">${r?"Исходящий перевод":"Входящий перевод"}</div>
      <div style="font-size:14px;color:#64748b;">${a(t)}</div>
      <div style="font-size:22px;font-weight:900;color:${r?"#2563eb":"#16a34a"};">
        ${r?"-":"+"} ${a(m(e.amount??e.Amount??0,e.currency||e.Currency||"TJS"))}
      </div>
      <div style="font-size:12px;color:#94a3b8;">${a(v(e.createdAt||e.CreatedAt))}</div>
    </div>
  `}function a(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function z(e){return e&&e.charAt(0).toUpperCase()+e.slice(1)}document.addEventListener("DOMContentLoaded",$);
