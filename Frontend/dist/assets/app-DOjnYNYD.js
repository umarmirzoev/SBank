import"./modulepreload-polyfill-B5Qt9EMX.js";import{g as N,c as B,s as g,a as i,f as l}from"./common-BDs07PHf.js";const h=document.getElementById("userName"),C=document.getElementById("userAvatar"),p=document.getElementById("totalBalance"),y=document.getElementById("bonusLabel"),d=document.getElementById("accountPanel"),v=document.getElementById("operationsList"),$=document.getElementById("logoutButton"),f=document.getElementById("addCardButton"),L=document.getElementById("verifyButton"),m=N();m?.token||(window.location.href="login.html");h.textContent=m?.fullName||"Клиент";C.textContent=(m?.fullName||"К").trim().charAt(0).toUpperCase();$?.addEventListener("click",()=>{B(),window.location.href="login.html"});f?.addEventListener("click",()=>{g("Сначала откройте карту через backend API, затем она появится здесь.")});L?.addEventListener("click",()=>{g("Верификация уже отправлена после регистрации.")});function u(a){return a?.items||a?.Items||[]}function I(a,e){const c=a[0],n=e[0];if(!c){d.innerHTML='<div class="empty-note"><strong>Счёт пока не создан.</strong><br>После регистрации он появится автоматически.</div>';return}if(!n){d.innerHTML=`
      <div class="account-wrap">
        <div class="bank-card-visual">
          <div class="chip"></div>
          <div class="num">0000 0000 0000 0000</div>
          <div class="holder">КАРТА ЕЩЁ НЕ ВЫПУЩЕНА</div>
        </div>
        <div class="account-main">
          <strong>${c.type} счёт • ${c.accountNumber.slice(-4)}</strong>
          <div class="account-sub">Основной счёт</div>
          <div class="account-balance">${l(c.balance,c.currency)}</div>
          <div class="account-delta">+0.00 c. • Сегодня</div>
        </div>
        <div class="account-actions">
          <button type="button">Пополнить</button>
          <button type="button">Перевести</button>
        </div>
      </div>
    `;return}d.innerHTML=`
    <div class="account-wrap">
      <div class="bank-card-visual">
        <div class="chip"></div>
        <div class="num">${n.cardNumber}</div>
        <div class="holder">${n.cardHolderName||"SOMONIBANK CLIENT"}</div>
      </div>
      <div class="account-main">
        <strong>${n.type} • ${String(n.cardNumber||"").slice(-4)}</strong>
        <div class="account-sub">Основная карта</div>
        <div class="account-balance">${l(c.balance,c.currency)}</div>
        <div class="account-delta">+0.00 c. • Сегодня</div>
      </div>
      <div class="account-actions">
        <button type="button">Пополнить</button>
        <button type="button">Перевести</button>
        <button type="button">Ещё</button>
      </div>
    </div>
  `}function E(a){if(!a.length){v.innerHTML=`
      <div class="empty-note">
        <strong>Операций пока нет.</strong><br>
        История останется пустой, пока вы не сделаете первую транзакцию.
      </div>
    `;return}v.innerHTML=a.slice(0,5).map((e,c)=>{const n=Number(e.amount||e.Amount||0),r=e.description||e.Description||e.type||e.Type||"Операция",o=e.createdAt||e.CreatedAt,s=n>=0?"income":"";return`
      <div class="op-item">
        <div class="op-icon ${c%3===0?"blue":c%3===1?"green":"cyan"}">${n>=0?"+":"−"}</div>
        <div>
          <div class="op-title">${r}</div>
          <div class="op-sub">${o?new Date(o).toLocaleString("ru-RU",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"Без даты"}</div>
        </div>
        <div class="op-amount ${s}">${n>=0?"+":""}${l(n,e.currency||e.Currency||"TJS")}</div>
      </div>
    `}).join("")}async function T(){try{const[a,e,c]=await Promise.all([i("/api/accounts/my?page=1&pageSize=10",{auth:!0}),i("/api/cards/my?page=1&pageSize=10",{auth:!0}),i("/api/transactions/recent",{auth:!0})]),n=u(a),r=u(e),o=u(c),s=n.reduce((t,b)=>t+Number(b.balance||b.Balance||0),0);p.textContent=`${s.toFixed(2)} c.`,y.textContent=`${(s*.0288).toFixed(2)} бонусов`,I(n.map(t=>({accountNumber:t.accountNumber||t.AccountNumber,type:t.type||t.Type,currency:t.currency||t.Currency,balance:Number(t.balance||t.Balance||0)})),r.map(t=>({cardNumber:t.cardNumber||t.CardNumber||t.maskedNumber||t.MaskedNumber,cardHolderName:t.cardHolderName||t.CardHolderName,type:t.type||t.Type}))),E(o)}catch(a){p.textContent="0.00 c.",y.textContent="0.00 бонусов",d.innerHTML=`<div class="empty-note"><strong>Не удалось загрузить кабинет.</strong><br>${a.message||"Попробуйте войти ещё раз."}</div>`,v.innerHTML=""}}T();
