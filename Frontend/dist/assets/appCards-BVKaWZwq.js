import"./modulepreload-polyfill-B5Qt9EMX.js";import{i as f,g,a as m,s as b,f as r,b as y}from"./common-BnoPv7Ge.js";let n=[],o=[],a=null;const t={profileName:document.querySelector(".user-name"),cardsList:document.getElementById("cardsList"),operationsListMiddle:document.querySelector(".middle-col .ops-list"),operationsListWidget:document.querySelector(".mini-ops-box div:last-child"),btnTransfer:document.getElementById("btnGoToTransfer")};async function h(){if(!f()){window.location.href="login.html";return}const e=g();t.profileName&&(t.profileName.textContent=e.fullName||"Иван Иванов"),await $(),x()}async function $(){try{const[e,i]=await Promise.all([m("/api/cards/my?page=1&pageSize=20",{auth:!0}),m("/api/transaction/my?page=1&pageSize=20",{auth:!0})]);n=e.items||[],o=i.items||[],n.length===0&&(n=[{id:"c1",type:"Physical",label:"Основная карта",balance:5230,cardNumber:"4169 7385 **** 2467",color:"blue",icon:"💳"},{id:"c2",type:"Physical",label:"Долларовая",balance:970.2,cardNumber:"4165 7288 **** 7942",color:"green",icon:"💵",currency:"USD"},{id:"c3",type:"Virtual",label:"Накопительная",balance:24500,cardNumber:"20.8% к 24.10.2024",color:"yellow",icon:"🐷"},{id:"c4",type:"Virtual",label:"Целевая",balance:127560,cardNumber:"План: Новая машина",color:"purple",icon:"🎯",target:2e5}]),o.length===0&&(o=[{id:"t1",description:"Продуктовый",amount:-124.3,category:"Кат. имидж",createdAt:"2024-07-01T12:00:00",icon:"📦"},{id:"t2",description:"Мария П.",amount:700,category:"Взаимовыру",createdAt:"2024-07-01T14:30:00",isAvatar:!0},{id:"t3",description:"Кинотеатр",amount:-62,category:"Развлечение",createdAt:"2024-06-08T20:00:00",icon:"🎬"},{id:"t4",description:"Ростелеком",amount:-100,category:"За услуги",createdAt:"2024-10-09T09:00:00",icon:"☁️"}]),p(),L(),n.length>0&&v(n[0].id)}catch(e){console.error("Failed to load cards data",e),b("Ошибка загрузки данных")}}function p(){t.cardsList&&(t.cardsList.innerHTML="",n.forEach(e=>{const i=document.createElement("div");i.className=`manage-card ${e.color||"blue"}`;const s=e.currency==="USD"?`$${r(e.balance,"")}`:`${r(e.balance,"")} с.`,c=e.target?` <span style="font-size:12px; opacity:0.6;">из ${r(e.target,"")} с.</span>`:"";i.innerHTML=`
      <div class="manage-card-top">
         <div class="card-icon-sq">${e.icon||"💳"}</div>
         <div class="card-switch" style="${e.id===a?.id?"":"background:#e2e8f0;"}"></div>
      </div>
      <div>
         <div class="manage-card-label">${e.label}</div>
         <div class="manage-card-bal">${s}${c}</div>
         <div class="manage-card-num">${e.cardNumber}</div>
      </div>
    `,i.onclick=()=>v(e.id),t.cardsList.appendChild(i)}))}function v(e){if(a=n.find(d=>d.id===e),!a)return;p();const i=document.querySelector(".visual-card"),s=document.querySelector(".v-card-name"),c=document.querySelector(".v-card-name + div"),l=document.querySelector(".v-card-balance"),u=document.querySelector(".v-card-number");if(s&&(s.textContent=a.label),c&&(c.textContent=a.cardNumber),l&&(l.textContent=a.currency==="USD"?`$${r(a.balance,"")}`:`${r(a.balance,"")} с.`),u&&(u.textContent="IBAN TJSOMON1041673357821"),i){const d={blue:"linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",green:"linear-gradient(135deg, #34d399 0%, #059669 100%)",yellow:"linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",purple:"linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)"};i.style.background=d[a.color]||d.blue}}function L(){t.operationsListMiddle&&(t.operationsListMiddle.innerHTML='<div class="box-title">Последние операции</div>',o.forEach(e=>{t.operationsListMiddle.innerHTML+=`
        <div class="op-item">
           ${e.isAvatar?`<img src="https://i.pravatar.cc/100?u=${e.id}" class="avatar-sm" style="width:44px; height:44px; border-radius:50%;">`:`<div class="op-icon">${e.icon}</div>`}
           <div class="op-info">
              <div class="op-name">${e.description}</div>
              <div class="op-memo">${e.category}</div>
           </div>
           <div class="op-amt-col">
              <div class="op-amt ${e.amount<0?"neg":"pos"}">${e.amount<0?"":"+"}${r(e.amount,"")} с.</div>
              <div class="op-date">${y(e.createdAt)}</div>
           </div>
        </div>
      `})),t.operationsListWidget&&(t.operationsListWidget.innerHTML="",o.slice(0,4).forEach(e=>{t.operationsListWidget.innerHTML+=`
        <div style="display:flex; align-items:center; gap:12px;">
           ${e.isAvatar?`<img src="https://i.pravatar.cc/100?u=${e.id}" style="width:32px; height:32px; border-radius:50%;">`:`<div style="width:32px; height:32px; border-radius:50%; background:#f8fafc; display:grid; place-items:center; font-size:14px;">${e.icon}</div>`}
           <div style="flex:1">
              <div style="font-size:12px; font-weight:700;">${e.description}</div>
              <div style="font-size:10px; color:#94a3b8;">${e.category}</div>
           </div>
           <div style="font-size:12px; font-weight:800; color: ${e.amount>0?"#10b981":"#1e293b"};">
              ${e.amount>0?"+":""}${r(e.amount,"")} с.
           </div>
        </div>
      `}))}function x(){t.btnTransfer&&(t.btnTransfer.onclick=()=>{window.location.href="transfers.html"}),window.addEventListener("error",()=>{})}document.addEventListener("DOMContentLoaded",h);
