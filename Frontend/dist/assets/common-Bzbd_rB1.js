(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function a(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=a(s);fetch(s.href,i)}})();const m="sbank-session";let n,c=null;function y(e){try{return JSON.parse(e)}catch{return null}}function d(){return y(localStorage.getItem(m)||"null")}function w(){return!!d()?.token}function S(e){localStorage.setItem(m,JSON.stringify(e)),window.dispatchEvent(new CustomEvent("sbank:session-changed",{detail:e}))}function h(e=!1){localStorage.removeItem(m),window.dispatchEvent(new CustomEvent("sbank:session-changed",{detail:null})),e&&u("Вы вышли из аккаунта.")}function N(e,t){if(!e)return t;if(Array.isArray(e.Description)&&e.Description.length>0)return e.Description.join(" ");if(e.title)return e.detail?`${e.title} ${e.detail}`:e.title;if(e.errors){const a=Object.values(e.errors).flat();if(a.length>0)return a.join(" ")}return typeof e=="string"?e:t}async function f(e,t={}){const{method:a="GET",body:r,auth:s=!1,headers:i={}}=t,o=d(),l=await fetch(e,{method:a,headers:{"Content-Type":"application/json",...s&&o?.token?{Authorization:`Bearer ${o.token}`}:{},...i},body:r===void 0?void 0:JSON.stringify(r)}),b=(l.headers.get("content-type")||"").includes("application/json")?await l.json():await l.text();if(!l.ok)throw l.status===401&&h(),new Error(N(b,`Ошибка запроса: ${l.status}`));return b}function g(e){return e&&typeof e=="object"&&"StatusCode"in e?{data:e.Data,messages:Array.isArray(e.Description)?e.Description:[],statusCode:e.StatusCode}:{data:e,messages:[],statusCode:200}}function L(e,t=""){const a=Number(e||0),r=a.toLocaleString("ru-RU",{minimumFractionDigits:a%1===0?0:2,maximumFractionDigits:2});return t?`${r} ${t}`:r}function x(e){return e?new Date(e).toLocaleString("ru-RU",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"Не указано"}function u(e){const t=document.getElementById("toast");t&&(t.textContent=e,t.classList.add("show"),clearTimeout(u.timer),u.timer=setTimeout(()=>t.classList.remove("show"),2200))}function q(){if(n)return n;n=document.createElement("div"),n.className="sb-modal-backdrop",n.hidden=!0,n.innerHTML=`
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
  `,document.body.appendChild(n),n.addEventListener("click",r=>{(r.target===n||r.target.closest("[data-auth-close]"))&&p()});const e=n.querySelectorAll("[data-auth-form]"),t=n.querySelectorAll("[data-auth-tab]"),a=n.querySelector("[data-auth-message]");return t.forEach(r=>{r.addEventListener("click",()=>{const s=r.dataset.authTab;t.forEach(i=>i.classList.toggle("active",i===r)),e.forEach(i=>{i.hidden=i.dataset.authForm!==s}),a.className="sb-message info",a.textContent=s==="login"?"Введите email и пароль от backend-сервиса.":"Регистрация создаст нового пользователя через API /api/auth/register."})}),n.querySelector('[data-auth-form="login"]').addEventListener("submit",async r=>{r.preventDefault();const s=r.currentTarget,i=s.querySelector('button[type="submit"]');i.disabled=!0;try{const o=g(await f("/api/auth/login",{method:"POST",body:{email:s.email.value.trim(),password:s.password.value}}));S(o.data),a.className="sb-message success",a.textContent=o.messages[0]||"Вход выполнен.",u(`Здравствуйте, ${o.data.fullName||o.data.FullName||"пользователь"}!`),p(),c?.(d()),c=null}catch(o){a.className="sb-message error",a.textContent=o.message}finally{i.disabled=!1}}),n.querySelector('[data-auth-form="register"]').addEventListener("submit",async r=>{r.preventDefault();const s=r.currentTarget,i=s.querySelector('button[type="submit"]');i.disabled=!0;try{const o=g(await f("/api/auth/register",{method:"POST",body:{firstName:s.firstName.value.trim(),lastName:s.lastName.value.trim(),email:s.email.value.trim(),password:s.password.value,phone:s.phone.value.trim(),address:s.address.value.trim(),passportNumber:s.passportNumber.value.trim()}}));a.className="sb-message success",a.textContent=o.messages[0]||"Регистрация завершена. Теперь войдите.",n.querySelector('[data-auth-tab="login"]').click(),n.querySelector("#sb-login-email").value=s.email.value.trim(),s.reset()}catch(o){a.className="sb-message error",a.textContent=o.message}finally{i.disabled=!1}}),n}function v(e="login",t=null){const a=q();c=t,a.hidden=!1,a.querySelector(`[data-auth-tab="${e}"]`)?.click()}function p(){n&&(n.hidden=!0)}function A(e,t="login"){if(w()){e(d());return}v(t,e)}function C(){const e=document.querySelector(".header-right");if(!e||e.querySelector(".sb-auth-controls"))return;const t=document.createElement("div");t.className="sb-auth-controls",e.appendChild(t);function a(){const r=d();if(!r){t.innerHTML=`
        <button class="sb-ghost-btn" type="button" data-action="login">Войти</button>
        <a class="sb-btn" href="somonibank-app.html">Кабинет</a>
      `,t.querySelector('[data-action="login"]').addEventListener("click",()=>v("login"));return}t.innerHTML=`
      <span class="sb-auth-greeting">${r.fullName||r.FullName||"Пользователь"}</span>
      <a class="sb-ghost-btn" href="somonibank-app.html">Кабинет</a>
      <button class="sb-btn" type="button" data-action="logout">Выйти</button>
    `,t.querySelector('[data-action="logout"]').addEventListener("click",()=>h(!0))}a(),window.addEventListener("sbank:session-changed",a)}function T(e,t){return`<div class="sb-message ${e}">${t}</div>`}function k(e){const t=String(e||"").toLowerCase();return["active","completed","paid","success","read"].includes(t)?"success":["pending","reviewed","warning","new"].includes(t)?"warn":["blocked","closed","rejected","failed","forbidden"].includes(t)?"danger":""}export{T as a,f as b,x as c,k as d,L as f,C as m,v as o,A as r,u as s,g as u};
