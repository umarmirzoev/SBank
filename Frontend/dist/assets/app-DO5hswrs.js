import"./modulepreload-polyfill-B5Qt9EMX.js";import{g as $,s as m,f as p,i as B,a as l,b as L}from"./common-BnoPv7Ge.js";const b=document.querySelectorAll(".user-name")[0],v=document.querySelector(".user-avatar"),S=document.querySelector(".hero-bal"),h=document.querySelector(".hero-bonus span"),N=document.querySelector(".v-num"),g=document.querySelector(".v-holder"),x=document.querySelector("[data-card-expiry]"),C=document.querySelector(".card-type-name"),E=document.querySelector(".card-stats-bal"),q=document.querySelector(".card-stats-delta"),u=document.querySelector(".op-list"),A=document.querySelector(".right-sidebar"),D=$(),t={balance:0,cardBalance:0,cardNumber:"823553923814",holderName:"UMARJON TEST",expiryDate:"04/29",cardTail:"3814",operations:[]};function M(e){return String(e||"").replace(/(\d{4})(?=\d)/g,"$1 ").trim()}function k(){if(!D)return;const e=D.fullName||"Umarjon Test";b&&(b.textContent=e),v&&(v.textContent=e.split(" ").filter(Boolean).slice(0,2).map(r=>r[0]?.toUpperCase()||"").join(""))}function H(){document.querySelectorAll(".hero-shield, .hero-coins-visual, .hero-card-mock").forEach(e=>{e.style.display="none"}),document.querySelectorAll(".promo-banner, .security-widget").forEach(e=>{e.remove()}),document.querySelectorAll("button, .pop-card, .svc-box").forEach(e=>{e.addEventListener("click",()=>{const r=e.innerText||e.querySelector(".pop-label")?.innerText||"Действие";m(`Функция "${r.trim()}" в разработке`)})}),document.querySelectorAll(".nav-item a").forEach(e=>{e.getAttribute("href")==="#"&&e.addEventListener("click",r=>{r.preventDefault(),m("Эта страница скоро появится!")})})}function y(){const e=p(t.balance,"TJS"),r=p(t.cardBalance,"TJS"),a=M(t.cardNumber);S&&(S.textContent=e),h&&(h.textContent="Доступно для оплаты и переводов"),N&&(N.textContent=a),g&&(g.textContent=t.holderName),x&&(x.textContent=t.expiryDate),C&&(C.textContent=`Visa Classic •• ${t.cardTail}`),E&&(E.textContent=r),q&&(q.textContent="Баланс карты"),I(),P(e)}function I(){if(u){if(!t.operations.length){u.innerHTML=`
            <div class="empty-state">
                Здесь будут показываться только реальные операции по вашей карте.
            </div>
        `;return}u.innerHTML=t.operations.map(e=>{const r=Number(e.amount??e.Amount??0),a=e.currency||e.Currency||"TJS",n=!e.fromAccountId&&e.toAccountId?!0:r>=0,i=n?"pos":"",d=n?"+":"-",o=e.description||e.Description||"Перевод",c=e.toAccountNumber||e.ToAccountNumber||e.fromAccountNumber||e.FromAccountNumber||"Счёт";return`
            <div class="op-item">
                <div class="op-icon-cl">${n?"↓":"↑"}</div>
                <div class="op-text">
                    <div class="op-name">${o}</div>
                    <div class="op-memo">${c} • ${L(e.createdAt||e.CreatedAt)}</div>
                </div>
                <div class="op-amount ${i}">${d}${p(Math.abs(r),a)}</div>
            </div>
        `}).join("")}}function P(e){if(!A)return;const r=document.querySelector("[data-card-summary]");r&&r.remove();const a=document.createElement("div");a.className="sidebar-box",a.dataset.cardSummary="true",a.innerHTML=`
        <div class="section-title-row">
            <span class="section-title" style="font-size:14px;">Данные карты</span>
        </div>
        <div class="empty-state">
            <div><strong>Номер:</strong> ${t.cardNumber}</div>
            <div style="margin-top:8px;"><strong>Срок:</strong> ${t.expiryDate}</div>
            <div style="margin-top:8px;"><strong>Общий баланс:</strong> ${e}</div>
        </div>
    `,A.appendChild(a)}async function w(){if(!B()){y();return}try{const[e,r,a]=await Promise.all([l("/api/accounts/my?page=1&pageSize=20",{auth:!0}),l("/api/cards/my?page=1&pageSize=20",{auth:!0}),l("/api/transfers/my?page=1&pageSize=5",{auth:!0})]),n=e.items||e.Items||[],i=r.items||r.Items||[],d=a.items||a.Items||[];t.balance=n.reduce((f,s)=>f+Number(s.balance??s.Balance??0),0);const o=i[0],c=n[0];if(o){const s=(o.maskedNumber||o.MaskedNumber||"").replace(/\D/g,"");s.length>=4&&(t.cardTail=s.slice(-4)),t.cardNumber=o.cardNumber||o.CardNumber||t.cardNumber,t.holderName=o.cardHolderName||o.CardHolderName||t.holderName,t.expiryDate=o.expiryDate||o.ExpiryDate||t.expiryDate}c?t.cardBalance=Number(c.balance??c.Balance??0):t.cardBalance=t.balance,t.operations=d}catch(e){console.error(e),m("Не удалось обновить главный экран")}y()}function T(){k(),H(),y(),w()}document.addEventListener("DOMContentLoaded",T);T();
