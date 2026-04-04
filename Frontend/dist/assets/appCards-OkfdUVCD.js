import{i as M,g as T,s as f,u as S,a as m,f as u,b as B}from"./common-CmFqHCKi.js";const N="sbank-card-products",w="issueCard",C=1e3,g={"visa-gold":{key:"visa-gold",title:"Visa Gold",brand:"VISA",recommendation:"Подходит для ежедневных оплат, переводов и хранения основного баланса.",theme:{className:"yellow",gradient:"linear-gradient(135deg, #f6d365 0%, #d4a017 55%, #b7791f 100%)",icon:"💳",accent:"#b7791f"}},"mastercard-platinum":{key:"mastercard-platinum",title:"Mastercard Platinum",brand:"MASTERCARD",recommendation:"Удобна как отдельная карта для крупных оплат, поездок и онлайн-покупок.",theme:{className:"blue",gradient:"linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #38bdf8 100%)",icon:"🏦",accent:"#1d4ed8"}},milli:{key:"milli",title:"Карта «Милли»",brand:"МИЛЛИ",recommendation:"Хороший вариант для местных оплат и как отдельная карта для повседневных расходов.",theme:{className:"green",gradient:"linear-gradient(135deg, #f8fafc 0%, #e7e5e4 45%, #d6d3d1 100%)",icon:"🪙",accent:"#8b6914"}}},$=[{className:"blue",gradient:"linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",icon:"💳",accent:"#2563eb"},{className:"green",gradient:"linear-gradient(135deg, #34d399 0%, #059669 100%)",icon:"💠",accent:"#059669"},{className:"yellow",gradient:"linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",icon:"✨",accent:"#d97706"},{className:"purple",gradient:"linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)",icon:"🛡️",accent:"#4f46e5"}],o={accounts:[],cards:[],transactions:[],selectedCardId:null,lastIssuedCardId:null},a={profileName:document.querySelector(".user-name"),profileAvatar:document.querySelector(".user-avatar"),cardsList:document.getElementById("cardsList"),pageTitle:document.querySelector(".page-title-row h1"),pageSubtitle:document.querySelector(".page-title-row p"),recommendationBar:document.querySelector(".date-pill"),primaryBox:document.querySelector(".primary-card-box"),operationsListMiddle:document.querySelector(".middle-col .ops-list"),functionsBox:document.querySelector(".middle-col .functions-box"),rightCol:document.querySelector(".right-col"),summaryFooter:document.querySelector(".summary-footer"),btnTransfer:document.getElementById("btnGoToTransfer")};function s(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function E(t){return String(t||"").replace(/\D/g,"").replace(/(\d{4})(?=\d)/g,"$1 ").trim()}function y(){try{const t=JSON.parse(localStorage.getItem(N)||"{}");return t&&typeof t=="object"?t:{}}catch{return{}}}function A(t){localStorage.setItem(N,JSON.stringify(t))}function z(t){if(!t)return;const e=y();delete e[String(t)],A(e)}function I(t,e){if(!t||!e||!g[e])return;const i=y();i[String(t)]=e,A(i)}function k(t){const e=y()[String(t)];return g[e]||null}function H(t){return $[t%$.length]}function P(t,e){return e?.theme||H(t)}function R(t,e){if(e?.brand)return e.brand;const i=String(t||"");return i.startsWith("4")?"VISA":/^5[1-5]/.test(i)||/^2(2[2-9]|[3-6]\d|7[01])/.test(i)?"MASTERCARD":"CARD"}function D(t,e,i){return i?.title?i.title:String(t.type||t.Type||"").toLowerCase()==="virtual"?`Виртуальная карта ${e+1}`:o.cards.length===1?"Основная карта":`Карта ${e+1}`}function O(){const e=new URLSearchParams(window.location.search).get(w);return e&&g[e]?g[e]:null}function q(){const t=new URL(window.location.href);t.searchParams.delete(w),window.history.replaceState({},"",t.pathname+t.search+t.hash)}function F(t){return String(t||"SomoniBank Client").trim().replace(/\s+/g," ").toUpperCase().slice(0,100)||"SOMONIBANK CLIENT"}async function V(){const t=await m("/api/cards/my?page=1&pageSize=50",{auth:!0}),e=t.items||t.Items||[];for(const i of e){const n=i.id||i.Id;n&&(await m(`/api/cards/${n}`,{method:"DELETE",auth:!0}),z(n))}}async function _(){const t=O();if(!t)return;let e=null;try{f(`Оформляем ${t.title}...`),await V();const i=T(),n=F(i?.fullName),c=S(await m("/api/accounts/open",{method:"POST",auth:!0,body:{type:"Current",currency:"TJS"}})).data,r=c?.id||c?.Id;if(!r)throw new Error("Не удалось открыть счет для новой карты.");const l=S(await m("/api/cards/create",{method:"POST",auth:!0,body:{accountId:r,cardHolderName:n,type:"Physical"}})).data;e=l?.id||l?.Id||null,await m("/api/transactions/deposit",{method:"POST",auth:!0,body:{accountId:r,amount:C,description:`Стартовый баланс для карты ${t.title}`}}),e&&(I(e,t.key),o.lastIssuedCardId=String(e),o.selectedCardId=String(e)),f(`${t.title} оформлена. На счет зачислено ${C} TJS.`)}catch(i){e?(I(e,t.key),o.lastIssuedCardId=String(e),o.selectedCardId=String(e),f(`${t.title} создана, но пополнение счета не завершилось.`)):f(i?.message||"Не удалось оформить выбранную карту.")}finally{q()}}function J(){const t=T()?.fullName||"Пользователь";if(a.profileName&&(a.profileName.textContent=t),a.profileAvatar){const e=t.split(" ").filter(Boolean).slice(0,2).map(n=>n[0]?.toUpperCase()||"").join("")||"SB",i=document.createElement("div");i.className="user-avatar",i.textContent=e,i.style.display="grid",i.style.placeItems="center",i.style.background="linear-gradient(135deg, #2563eb, #16a34a)",i.style.color="#fff",i.style.fontWeight="800",a.profileAvatar.replaceWith(i)}}async function U(){if(!M()){window.location.href="login.html";return}J(),G(),await _(),await j()}function G(){a.btnTransfer&&a.btnTransfer.addEventListener("click",()=>{window.location.href="app-transfers.html"})}async function j(){try{const[t,e,i]=await Promise.all([m("/api/accounts/my?page=1&pageSize=50",{auth:!0}),m("/api/cards/my?page=1&pageSize=50",{auth:!0}),m("/api/transfers/my?page=1&pageSize=50",{auth:!0})]);o.accounts=t.items||t.Items||[],o.cards=(e.items||e.Items||[]).map((n,d)=>{const c=n.id||n.Id,r=k(c),v=P(d,r),l=o.accounts.find(x=>String(x.id||x.Id)===String(n.accountId||n.AccountId)),b=n.fullCardNumber||n.FullCardNumber||n.cardNumber||n.CardNumber||"";return{...n,uiIndex:d,theme:v,product:r,label:D(n,d,r),brand:R(b,r),fullNumber:b,formattedNumber:E(b),maskedNumber:n.maskedNumber||n.MaskedNumber||"",cvv:n.cvv||n.Cvv||"---",expiryDate:n.expiryDate||n.ExpiryDate||"--/--",holderName:n.cardHolderName||n.CardHolderName||"SOMONIBANK CLIENT",balance:Number(l?.balance??l?.Balance??0),currency:l?.currency||l?.Currency||"TJS",accountId:n.accountId||n.AccountId,accountNumber:l?.accountNumber||l?.AccountNumber||"",iban:l?.iban||l?.Iban||""}}),o.transactions=i.items||i.Items||[],o.selectedCardId=o.lastIssuedCardId||o.cards[0]?.id||o.cards[0]?.Id||null,L()}catch(t){console.error(t),f("Не удалось загрузить карты"),et(t)}}function L(){a.pageTitle&&(a.pageTitle.textContent="Карты"),a.pageSubtitle&&(a.pageSubtitle.textContent="Здесь показываются только ваши реальные карты, включая карты, оформленные с главной страницы."),W(),Y(),K(),Q(),X(),Z(),tt()}function W(){if(!a.recommendationBar)return;const t=p(),e=o.cards.filter(d=>String(d.type||d.Type||"").toLowerCase()==="physical").length,i=o.cards.length-e,n=t?.product?.recommendation||(o.cards.length?"Рекомендуем держать отдельную карту для повседневных расходов и отдельную для переводов.":"После выпуска карты здесь появятся рекомендации по ее использованию.");a.recommendationBar.innerHTML=`
    <button class="date-btn active" type="button">Всего карт: ${o.cards.length}</button>
    <button class="date-btn" type="button">Физические: ${e}</button>
    <button class="date-btn" type="button">Виртуальные: ${i}</button>
    <button class="date-btn" type="button" style="max-width:420px;white-space:normal;text-align:left;line-height:1.3;">${s(n)}</button>
  `}function Y(){if(a.cardsList){if(!o.cards.length){a.cardsList.innerHTML=`
      <div class="manage-card blue" style="grid-column:1 / -1;cursor:default;">
        <div class="manage-card-top">
          <div class="card-icon-sq">💳</div>
        </div>
        <div>
          <div class="manage-card-label">У вас пока нет карт</div>
          <div class="manage-card-bal">Когда карта появится на главной странице, она автоматически будет показана и здесь.</div>
        </div>
      </div>
    `;return}a.cardsList.innerHTML=o.cards.map(t=>{const e=String(t.id||t.Id),i=e===String(o.selectedCardId);return`
      <div class="manage-card ${t.theme.className}" data-card-id="${e}">
        <div class="manage-card-top">
          <div class="card-icon-sq">${t.theme.icon}</div>
          <div class="card-switch" style="${i?"":"background:#e2e8f0;"}"></div>
        </div>
        <div>
          <div class="manage-card-label">${s(t.label)}</div>
          <div class="manage-card-bal">${s(u(t.balance,t.currency))}</div>
          <div class="manage-card-num">${s(t.formattedNumber||t.maskedNumber)}</div>
        </div>
      </div>
    `}).join(""),a.cardsList.querySelectorAll("[data-card-id]").forEach(t=>{t.addEventListener("click",()=>{o.selectedCardId=t.dataset.cardId,L()})})}}function p(){return o.cards.find(t=>String(t.id||t.Id)===String(o.selectedCardId))||null}function K(){if(!a.primaryBox)return;const t=p();if(!t){a.primaryBox.innerHTML=`
      <div class="box-title">Карты не найдены</div>
      <div style="color:#64748b;font-size:14px;line-height:1.6;">
        Здесь появится информация по карте: номер, срок действия и CVV.
      </div>
    `;return}const e=h(t),i=e.filter(c=>c.direction==="out").reduce((c,r)=>c+r.amount,0),n=e.filter(c=>c.direction==="in").reduce((c,r)=>c+r.amount,0);a.primaryBox.innerHTML=`
    <div class="box-header">
      <span class="box-title">${s(t.label)}</span>
      <span style="font-size:12px;font-weight:800;color:${t.theme.accent};">${s(t.brand)}</span>
    </div>
    <div class="visual-card" style="background:${t.theme.gradient}; color:${t.product?.key==="milli"?"#1f2937":"#fff"};">
      <div class="v-card-top">
        <div>
          <div class="v-card-chip"></div>
          <div class="v-card-name">${s(t.holderName)}</div>
          <div style="font-size:12px;opacity:0.9;">${s(t.formattedNumber)}</div>
        </div>
        <div>
          <div class="v-card-balance">${s(u(t.balance,t.currency))}</div>
          <div class="v-card-trend">${s(t.status||t.Status||"Active")}</div>
        </div>
      </div>
      <div class="v-card-bottom">
        <div class="v-card-number">${s(t.expiryDate)} · CVV ${s(t.cvv)}</div>
        <div class="v-card-brand">${s(t.brand)}</div>
      </div>
    </div>
    <div class="iban-display">
      <span>${s(t.accountNumber||"Счет не найден")}</span>
      <span>${s(t.iban||"IBAN недоступен")}</span>
    </div>
    <div class="limits-section">
      <div class="limit-row">
        <span>Номер карты</span>
        <span class="limit-val">${s(t.formattedNumber)}</span>
      </div>
      <div class="limit-row">
        <span>Срок действия</span>
        <span class="limit-val">${s(t.expiryDate)}</span>
      </div>
      <div class="limit-row">
        <span>CVV</span>
        <span class="limit-val">${s(t.cvv)}</span>
      </div>
      <div class="limit-row">
        <span>Статус</span>
        <span class="limit-val">${s(t.status||t.Status||"Active")}</span>
      </div>
      <div class="limit-row">
        <span>Баланс счета</span>
        <span class="limit-val">${s(u(t.balance,t.currency))}</span>
      </div>
    </div>
    <button class="btn-transfer" id="btnGoToTransfer">
      Перевести
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <div style="margin-top:auto;">
      <div class="box-title" style="font-size:15px; margin-bottom:12px;">Сводка по карте</div>
      <div style="display:flex; align-items:baseline; gap:8px; flex-wrap:wrap;">
        <span style="font-size:20px; font-weight:900; color:#16a34a;">+ ${s(u(n,t.currency))}</span>
        <span style="font-size:20px; font-weight:900; color:#cbd5e1;">|</span>
        <span style="font-size:16px; font-weight:800; color:#1e293b;">- ${s(u(i,t.currency))}</span>
      </div>
      <div style="margin-top:14px;color:#64748b;font-size:13px;line-height:1.6;">
        Карта привязана к счету ${s(t.accountNumber||"без счета")} и показывает только реальные данные.
      </div>
    </div>
  `;const d=document.getElementById("btnGoToTransfer");d&&d.addEventListener("click",()=>{window.location.href="app-transfers.html"})}function h(t){return o.transactions.filter(e=>{const i=e.fromAccountId||e.FromAccountId,n=e.toAccountId||e.ToAccountId;return String(i)===String(t.accountId)||String(n)===String(t.accountId)}).map(e=>{const i=e.fromAccountId||e.FromAccountId,n=String(i)===String(t.accountId);return{raw:e,direction:n?"out":"in",amount:Number(e.amount??e.Amount??0)}})}function Q(){if(!a.operationsListMiddle)return;const t=p(),e=t?h(t).slice(0,6):[];if(!e.length){a.operationsListMiddle.innerHTML=`
      <div class="box-title">Последние операции</div>
      <div class="op-item">
        <div class="op-icon">ℹ️</div>
        <div class="op-info">
          <div class="op-name">Операций пока нет</div>
          <div class="op-memo">После перевода или пополнения здесь появится реальная история по этой карте.</div>
        </div>
      </div>
    `;return}a.operationsListMiddle.innerHTML=`
    <div class="box-title">Последние операции</div>
    ${e.map(({raw:i,direction:n})=>{const d=Number(i.amount??i.Amount??0),c=i.currency||i.Currency||"TJS",r=i.description||i.Description||(n==="out"?"Перевод с карты":"Зачисление на карту"),v=n==="out"?i.toAccountNumber||i.ToAccountNumber||"Получатель":i.fromAccountNumber||i.FromAccountNumber||"Отправитель";return`
        <div class="op-item">
          <div class="op-icon">${n==="out"?"↗":"↙"}</div>
          <div class="op-info">
            <div class="op-name">${s(r)}</div>
            <div class="op-memo">${s(v)}</div>
          </div>
          <div class="op-amt-col">
            <div class="op-amt ${n==="in"?"pos":"neg"}">${n==="in"?"+":"-"} ${s(u(d,c))}</div>
            <div class="op-date">${s(B(i.createdAt||i.CreatedAt))}</div>
          </div>
        </div>
      `}).join("")}
  `}function X(){if(!a.functionsBox)return;const t=p();if(!t){a.functionsBox.innerHTML="";return}a.functionsBox.innerHTML=`
    <div class="box-title" style="margin-bottom:16px;">Данные карты</div>
    <div class="func-row">
      <div class="func-icon">💳</div>
      <div class="func-text">Полный номер карты</div>
      <div class="func-val" style="color:#1e293b;">${s(t.formattedNumber)}</div>
    </div>
    <div class="func-row">
      <div class="func-icon">📅</div>
      <div class="func-text">Срок действия</div>
      <div class="func-val" style="color:#1e293b;">${s(t.expiryDate)}</div>
    </div>
    <div class="func-row">
      <div class="func-icon">🔐</div>
      <div class="func-text">CVV</div>
      <div class="func-val" style="color:#1e293b;">${s(t.cvv)}</div>
    </div>
    <div class="func-row">
      <div class="func-icon">🏦</div>
      <div class="func-text">Привязанный счет</div>
      <div class="func-val" style="color:#1e293b;">${s(t.accountNumber||"Нет данных")}</div>
    </div>
  `}function Z(){if(!a.rightCol)return;const t=p(),e=o.cards.filter(r=>String(r.status||r.Status).toLowerCase()==="active").length,i=o.cards.reduce((r,v)=>r+Number(v.balance||0),0),n=o.cards.slice(0,4),d=t?.product?.title||"Основная карта",c=t?.product?.recommendation||"Используйте эту карту для быстрых переводов и контроля баланса.";a.rightCol.innerHTML=`
    <div class="insight-box">
      <div class="box-title" style="font-size:14px; margin-bottom:16px;">Рекомендуем для этой карты</div>
      <div class="insight-card">
        <div class="insight-icon">${t?.theme?.icon||"💳"}</div>
        <div class="insight-text">
          <div class="insight-name">${s(d)}</div>
          <div class="insight-desc">${s(c)}</div>
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
        ${n.length?n.map(r=>`
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:32px; height:32px; border-radius:50%; background:#eff6ff; display:grid; place-items:center; font-size:14px;">${r.theme.icon}</div>
            <div style="flex:1">
              <div style="font-size:12px; font-weight:700;">${s(r.label)}</div>
              <div style="font-size:10px; color:#94a3b8;">${s(r.formattedNumber)}</div>
            </div>
            <div style="font-size:12px; font-weight:800; color:#1e293b;">
              ${s(u(r.balance,r.currency))}
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
            <div style="font-size:10px; color:#94a3b8;">Только реальные данные</div>
          </div>
          <div style="font-size:12px; font-weight:800;">${e}</div>
        </div>
        <div class="limit-progress-bar">
          <div class="limit-fill" style="width:${o.cards.length?Math.max(20,e/o.cards.length*100):0}%;"></div>
        </div>
      </div>
      <div style="margin-top:16px;color:#64748b;font-size:13px;line-height:1.6;">
        Общий баланс по картам: <strong style="color:#1e293b;">${s(u(i,"TJS"))}</strong>
      </div>
    </div>
  `}function tt(){if(!a.summaryFooter)return;const t=p(),e=t?h(t):[],i=e.filter(c=>c.direction==="out").reduce((c,r)=>c+r.amount,0),n=e.filter(c=>c.direction==="in").reduce((c,r)=>c+r.amount,0),d=t?.balance?Math.min(100,Math.max(10,Number(t.balance))):10;a.summaryFooter.innerHTML=`
    <div class="footer-stat">
      <span class="footer-label">Поступления</span>
      <span class="footer-val">+ ${s(u(n,t?.currency||"TJS"))}</span>
    </div>
    <div class="footer-progress-track">
      <div class="footer-progress-fill" style="width:${d}%;"></div>
    </div>
    <div class="footer-stat" style="text-align:right;">
      <span class="footer-label">Списания</span>
      <span class="footer-val">- ${s(u(i,t?.currency||"TJS"))}</span>
    </div>
  `}function et(t){a.primaryBox&&(a.primaryBox.innerHTML=`
    <div class="box-title">Не удалось загрузить страницу карт</div>
    <div style="margin-top:12px;color:#64748b;font-size:14px;line-height:1.6;">
      ${s(t?.message||"Попробуйте обновить страницу.")}
    </div>
  `,a.cardsList&&(a.cardsList.innerHTML=""),a.operationsListMiddle&&(a.operationsListMiddle.innerHTML=""),a.functionsBox&&(a.functionsBox.innerHTML=""),a.rightCol&&(a.rightCol.innerHTML=""),a.summaryFooter&&(a.summaryFooter.innerHTML=""))}document.addEventListener("DOMContentLoaded",U);
