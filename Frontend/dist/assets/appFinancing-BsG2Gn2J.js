import"./modulepreload-polyfill-B5Qt9EMX.js";import{f as a,b as r,i as b,g as y,s}from"./common-BnoPv7Ge.js";let o=[],t=null;const i={profileName:document.querySelector(".user-name"),creditsOverview:document.getElementById("creditsOverview"),middleList:document.querySelector(".credit-list"),mainFocusBox:document.querySelector(".focus-box")};async function $(){if(!b()){window.location.href="login.html";return}const e=y();i.profileName&&(i.profileName.textContent=e.fullName||"Иван Иванов"),await h(),x()}async function h(){try{o=[{id:"c1",label:"Ипотечный кредит",balance:523e3,rate:18,endDate:"2026-12-24",total:89e4,paid:323e3,monthly:-7280,nextDate:"2024-04-24",color:"blue",icon:"🏠",iban:"TJSOMON104169733592467"},{id:"c2",label:"Автокредит",balance:71200,rate:20,endDate:"2026-03-15",trend:"+4,990 с.",color:"green",icon:"🚗",iban:"TJSOMON104169733591111"},{id:"c3",label:"Потребительский кредит",balance:"Погашен досрочно",rate:25,term:"9 месяцев",color:"yellow",icon:"💵",status:"Погашен"}],w(),p(),o.length>0&&v(o[0].id)}catch(e){console.error("Failed to load credits data",e),s("Ошибка загрузки данных")}}function w(){i.creditsOverview&&(i.creditsOverview.innerHTML="",o.forEach(e=>{const n=document.createElement("div");n.className=`row-card ${e.color||"blue"}`;const l=typeof e.balance=="number"?`${a(e.balance,"")} с.`:e.balance,c=e.endDate?`До ${r(e.endDate)} ${e.trend||""}`:`Срок: ${e.term}`,d=e.status||"Погасить >";n.innerHTML=`
      <div class="row-card-top">
         <div class="card-icon-sq">${e.icon}</div>
         <div class="card-rate">${e.rate}%</div>
      </div>
      <div>
         <div class="card-label">${e.label}</div>
         <div class="card-bal">${l}</div>
         <div class="card-details">${c}</div>
      </div>
      <div class="card-btn">${d}</div>
    `,n.onclick=()=>v(e.id),i.creditsOverview.appendChild(n)}))}function p(){i.middleList&&(i.middleList.innerHTML='<div class="box-header"><span class="box-title">Ваши кредиты</span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg></div>',o.slice(0,2).forEach(e=>{i.middleList.innerHTML+=`
      <div class="credit-item" style="cursor:pointer;" onclick="window.selectCredit('${e.id}')">
        <div class="item-icon">${e.icon}</div>
        <div class="item-info">
           <div class="item-name">${e.label}</div>
           <div class="item-sub">Срок: ${e.id==="c1"?"15 лет":"Свой автомобиль"}</div>
        </div>
        <div class="item-val-col">
           <div class="item-val">${a(e.balance,"")} с.</div>
           <div class="item-date">${r(e.endDate)}, Сомони</div>
        </div>
      </div>
    `}))}window.selectCredit=v;function v(e){if(t=o.find(f=>f.id===e),!t||t.id==="c3")return;const n=document.querySelector(".v-loan-title"),l=document.querySelector(".v-loan-title + div"),c=document.querySelector(".v-loan-bal"),d=document.querySelector(".v-loan-trend"),m=document.querySelector(".visual-loan > div:nth-child(2)");n&&(n.innerHTML=`${t.icon} ${t.label}`),l&&(l.textContent=`IBAN: ${t.iban}`),c&&(c.textContent=`${a(t.balance,"")} с.`),d&&(d.textContent=`+ ${t.rate}%`),m&&t.total&&(m.innerHTML=`+ ${a(t.paid,"")} c. | сумма кредит ${a(t.total,"")} c. <span style="float:right; color:#dcfce7;">+13.0% ⏱️ 220 с.</span>`);const u=document.querySelector(".loan-stat-val");u&&t.monthly&&(u.innerHTML=`${a(t.monthly,"")} c. <span style="font-size:12px; color:#94a3b8; font-weight:700;">до ${r(t.nextDate)}</span>`)}function x(){document.querySelectorAll(".btn-new-loan, .action-btn.primary").forEach(e=>{e.onclick=()=>s("Переход к оформлению/погашению...")}),document.querySelectorAll(".knowledge-card, .offer-item").forEach(e=>{e.addEventListener("click",()=>{const n=e.querySelector(".k-title")?.textContent||e.querySelector(".o-name")?.textContent;s(`Открываем: ${n}`)})})}document.addEventListener("DOMContentLoaded",$);
