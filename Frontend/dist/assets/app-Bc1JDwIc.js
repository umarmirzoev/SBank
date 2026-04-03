import"./modulepreload-polyfill-B5Qt9EMX.js";import{g as r,c as u,s as a,f as m}from"./common-B9vdsGd4.js";const g=document.getElementById("userName"),v=document.getElementById("userAvatar"),y=document.getElementById("totalBalance"),p=document.getElementById("bonusLabel"),B=document.getElementById("accountPanel"),i=document.getElementById("operationsList"),f=document.getElementById("logoutButton"),E=document.getElementById("addCardButton"),b=document.getElementById("verifyButton"),e=r();e?.token||(window.location.href="login.html");g.textContent=e?.fullName||e?.FullName||"Клиент";v.textContent=(e?.fullName||e?.FullName||"К").trim().charAt(0).toUpperCase();f?.addEventListener("click",()=>{u(),window.location.href="login.html"});E?.addEventListener("click",()=>{a("Сначала откройте карту через backend API, затем она появится здесь.")});b?.addEventListener("click",()=>{a("Верификация уже отправлена после регистрации.")});function h(o,t){{B.innerHTML='<div class="empty-note"><strong>Счёт пока не создан.</strong><br>После регистрации он появится автоматически.</div>';return}}function L(o){if(!o.length){i.innerHTML=`
      <div class="empty-note">
        <strong>Ещё нет операций.</strong><br>
        Выполните первую операцию, и она появится в истории.
      </div>
    `;return}i.innerHTML=o.slice(0,5).map((t,s)=>{const n=Number(t.amount||0),d=t.description||t.type||"Операция",c=t.createdAt,l=n>=0?"income":"";return`
      <div class="op-item">
        <div class="op-icon ${s%3===0?"blue":s%3===1?"green":"cyan"}">${n>=0?"+":"−"}</div>
        <div>
          <div class="op-title">${d}</div>
          <div class="op-sub">${c?new Date(c).toLocaleString("ru-RU",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"Без даты"}</div>
        </div>
        <div class="op-amount ${l}">${n>=0?"+":""}${m(n,t.currency||"TJS")}</div>
      </div>
    `}).join("")}function C(){y.textContent="0.00 c.",p.textContent="0.00 бонусов",h(),L([])}C();
