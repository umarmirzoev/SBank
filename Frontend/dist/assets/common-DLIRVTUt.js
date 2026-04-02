const m="sbank-session";let r,b=null;function E(e){try{return JSON.parse(e)}catch{return null}}function d(){return E(localStorage.getItem(m)||"null")}function A(){return!!d()?.token}function q(e){localStorage.setItem(m,JSON.stringify(e)),window.dispatchEvent(new CustomEvent("sbank:session-changed",{detail:e}))}function v(e=!1){localStorage.removeItem(m),window.dispatchEvent(new CustomEvent("sbank:session-changed",{detail:null})),e&&c("Вы вышли из аккаунта.")}function k(e,t){if(!e)return t;if(Array.isArray(e.Description)&&e.Description.length>0)return e.Description.join(" ");if(e.title)return e.detail?`${e.title} ${e.detail}`:e.title;if(e.errors){const s=Object.values(e.errors).flat();if(s.length>0)return s.join(" ")}return typeof e=="string"?e:t}async function g(e,t={}){const{method:s="GET",body:a,auth:i=!1,headers:n={}}=t,o=d(),u=await fetch((S=>{const l=String(S||"").trim();if(!l||/^https?:\/\//i.test(l))return l;const w=String(T||"").replace(/\/$/,""),N=l.startsWith("/")?l:`/${l}`;return`${w}${N}`})(e),{method:s,headers:{"Content-Type":"application/json",...i&&o?.token?{Authorization:`Bearer ${o.token}`}:{},...n},body:a===void 0?void 0:JSON.stringify(a)}),f=(u.headers.get("content-type")||"").includes("application/json")?await u.json():await u.text();if(!u.ok)throw u.status===401&&v(),new Error(k(f,`Ошибка запроса: ${u.status}`));return f}function p(e){return e&&typeof e=="object"&&"StatusCode"in e?{data:e.Data,messages:Array.isArray(e.Description)?e.Description:[],statusCode:e.StatusCode}:{data:e,messages:[],statusCode:200}}function D(e,t=""){const s=Number(e||0),a=s.toLocaleString("ru-RU",{minimumFractionDigits:s%1===0?0:2,maximumFractionDigits:2});return t?`${a} ${t}`:a}function B(e){return e?new Date(e).toLocaleString("ru-RU",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"Не указано"}function c(e){const t=document.getElementById("toast");t&&(t.textContent=e,t.classList.add("show"),clearTimeout(c.timer),c.timer=setTimeout(()=>t.classList.remove("show"),2200))}function L(){if(r)return r;r=document.createElement("div"),r.className="sb-modal-backdrop",r.hidden=!0,r.innerHTML=`
    <div class="sb-modal" role="dialog" aria-modal="true" aria-labelledby="sb-auth-title">
      <div class="sb-modal-head">
        <div>
          <h2 class="sb-modal-title" id="sb-auth-title">Вход в SomoniBank</h2>
          <p class="sb-modal-subtitle">Авторизуйтесь, чтобы открыть личный кабинет и работать с данными из backend API.</p>
        </div>
        <button class="sb-ghost-btn sb-modal-close" type="button" data-auth-close>&times;</button>
      </div>
      <div class="sb-tab-row">
        <button class="sb-tab-btn active" type="button" data-auth-tab="login">Вход</button>
        <button class="sb-tab-btn" type="button" data-auth-tab="register">Регистрация</button>
      </div>
      <div class="sb-stack">
        <div class="sb-message info" data-auth-message>Введите email и пароль от backend-сервиса.</div>
        <form data-auth-form="login">
          <div class="sb-form-grid">
            <div class="sb-field sb-field-full">
              <label for="sb-login-email">Email</label>
              <input id="sb-login-email" name="email" type="email" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-login-password">Пароль</label>
              <input id="sb-login-password" name="password" type="password" required>
            </div>
          </div>
          <div class="sb-cta" style="margin-top:18px;">
            <button class="sb-btn" type="submit">Войти</button>
          </div>
        </form>
        <form data-auth-form="register" hidden>
          <div class="sb-form-grid">
            <div class="sb-field">
              <label for="sb-register-firstName">Имя</label>
              <input id="sb-register-firstName" name="firstName" type="text" required>
            </div>
            <div class="sb-field">
              <label for="sb-register-lastName">Фамилия</label>
              <input id="sb-register-lastName" name="lastName" type="text" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-register-email">Email</label>
              <input id="sb-register-email" name="email" type="email" required>
            </div>
            <div class="sb-field">
              <label for="sb-register-phone">Телефон</label>
              <input id="sb-register-phone" name="phone" type="text" placeholder="+992..." required>
            </div>
            <div class="sb-field">
              <label for="sb-register-passportNumber">Паспорт</label>
              <input id="sb-register-passportNumber" name="passportNumber" type="text" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-register-address">Адрес</label>
              <input id="sb-register-address" name="address" type="text" required>
            </div>
            <div class="sb-field sb-field-full">
              <label for="sb-register-password">Пароль</label>
              <input id="sb-register-password" name="password" type="password" minlength="6" required>
            </div>
          </div>
          <div class="sb-cta" style="margin-top:18px;">
            <button class="sb-btn" type="submit">Создать аккаунт</button>
          </div>
        </form>
      </div>
    </div>
  `,document.body.appendChild(r),r.addEventListener("click",a=>{(a.target===r||a.target.closest("[data-auth-close]"))&&h()});const e=r.querySelectorAll("[data-auth-form]"),t=r.querySelectorAll("[data-auth-tab]"),s=r.querySelector("[data-auth-message]");return t.forEach(a=>{a.addEventListener("click",()=>{const i=a.dataset.authTab;t.forEach(n=>n.classList.toggle("active",n===a)),e.forEach(n=>{n.hidden=n.dataset.authForm!==i}),s.className="sb-message info",s.textContent=i==="login"?"Введите email и пароль от backend-сервиса.":"Регистрация создаст нового пользователя через API /api/auth/register."})}),r.querySelector('[data-auth-form="login"]').addEventListener("submit",async a=>{a.preventDefault();const i=a.currentTarget,n=i.querySelector('button[type="submit"]');n.disabled=!0;try{const o=p(await g("/api/auth/login",{method:"POST",body:{email:i.email.value.trim(),password:i.password.value}}));q(o.data),s.className="sb-message success",s.textContent=o.messages[0]||"Вход выполнен.",c(`Здравствуйте, ${o.data.fullName||o.data.FullName||"пользователь"}!`),h(),b?.(d()),b=null}catch(o){s.className="sb-message error",s.textContent=o.message}finally{n.disabled=!1}}),r.querySelector('[data-auth-form="register"]').addEventListener("submit",async a=>{a.preventDefault();const i=a.currentTarget,n=i.querySelector('button[type="submit"]');n.disabled=!0;try{const o=p(await g("/api/auth/register",{method:"POST",body:{firstName:i.firstName.value.trim(),lastName:i.lastName.value.trim(),email:i.email.value.trim(),password:i.password.value,phone:i.phone.value.trim(),address:i.address.value.trim(),passportNumber:i.passportNumber.value.trim()}}));s.className="sb-message success",s.textContent=o.messages[0]||"Регистрация завершена. Теперь войдите.",r.querySelector('[data-auth-tab="login"]').click(),r.querySelector("#sb-login-email").value=i.email.value.trim(),i.reset()}catch(o){s.className="sb-message error",s.textContent=o.message}finally{n.disabled=!1}}),r}function y(e="login",t=null){const s=L();b=t,s.hidden=!1,s.querySelector(`[data-auth-tab="${e}"]`)?.click()}function h(){r&&(r.hidden=!0)}function I(e,t="login"){if(A()){e(d());return}y(t,e)}function _(){const e=document.querySelector(".header-right");if(!e||e.querySelector(".sb-auth-controls"))return;const t=document.createElement("div");t.className="sb-auth-controls",e.appendChild(t);function s(){const a=d();if(!a){t.innerHTML=`
        <button class="sb-ghost-btn" type="button" data-action="login">Войти</button>
        <a class="sb-btn" href="somonibank-app.html">Кабинет</a>
      `,t.querySelector('[data-action="login"]').addEventListener("click",()=>y("login"));return}t.innerHTML=`
      <span class="sb-auth-greeting">${a.fullName||a.FullName||"Пользователь"}</span>
      <a class="sb-ghost-btn" href="somonibank-app.html">Кабинет</a>
      <button class="sb-btn" type="button" data-action="logout">Выйти</button>
    `,t.querySelector('[data-action="logout"]').addEventListener("click",()=>v(!0))}s(),window.addEventListener("sbank:session-changed",s)}function P(e,t){return`<div class="sb-message ${e}">${t}</div>`}const x=`${location.protocol}//${location.hostname}:5142`,T=localStorage.getItem("sbank-api-base-url")||window.SBANK_API_BASE_URL||x;export{T as A,g as a,B as b,P as c,D as f,d as g,_ as m,y as o,I as r,c as s,p as u};
