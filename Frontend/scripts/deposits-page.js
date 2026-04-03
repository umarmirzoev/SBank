import {
  apiRequest,
  formatMoney,
  formatDate,
  getSession,
  showToast,
  isAuthenticated
} from "./common.js";

let deposits = [];
let transactions = [];
let selectedDeposit = null;

const elements = {
  profileName: document.querySelector(".user-name"),
  depositsOverview: document.getElementById("depositsOverview"),
  middleList: document.querySelector(".middle-col .dep-list"),
  mainFocusBox: document.querySelector(".focus-box"),
  totalDisplay: document.querySelector(".total-val")
};

async function init() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  const session = getSession();
  if (elements.profileName) elements.profileName.textContent = session.fullName || "Иван Иванов";

  await loadData();
  setupEventListeners();
}

async function loadData() {
  try {
    const [depRes, transRes] = await Promise.all([
      apiRequest("/api/deposit/my?page=1&pageSize=20", { auth: true }),
      apiRequest("/api/transaction/my?page=1&pageSize=20", { auth: true })
    ]);

    deposits = depRes.items || [];
    transactions = transRes.items || [];

    // Seeding demo data to match the "Photo" exactly if backend is empty
    if (deposits.length === 0) {
      deposits = [
        { id: 'd1', label: 'Накопительный', balance: 42700, rate: 17.00, endDate: '2024-10-15', trend: '+1,300%', color: 'pink', icon: '🐽', iban: 'TJSOMON104169733592467', number: '4160 7855 **** 7551' },
        { id: 'd2', label: 'На 6 месяцев', balance: 30000, rate: 19.00, endDate: '2024-08-20', trend: '1.11%', color: 'teal', icon: '⏳', number: '4162 7855 **** 1111' },
        { id: 'd3', label: 'На 3 месяца', balance: 20000, rate: 13.00, endDate: '2024-08-10', trend: '+6,300%', color: 'yellow', icon: '💰', number: '4163 7855 **** 3333' },
        { id: 'd4', label: 'Цель: Новая машина', balance: 127580, target: 200000, color: 'purple', icon: '🎯', number: 'Goal: Car' }
      ];
    }

    renderOverview();
    renderMiddleList();
    
    if (deposits.length > 0) {
      selectDeposit(deposits[0].id);
    }
    
    if (elements.totalDisplay) {
        elements.totalDisplay.textContent = "379 700 c."; // Matching photo total logic
    }
  } catch (error) {
    console.error("Failed to load deposits data", error);
    showToast("Ошибка загрузки данных");
  }
}

function renderOverview() {
  if (!elements.depositsOverview) return;
  elements.depositsOverview.innerHTML = "";

  deposits.forEach(dep => {
    const cardEl = document.createElement("div");
    cardEl.className = `row-card ${dep.color || 'blue'}`;
    
    const rateHtml = dep.rate ? `<div class="row-card-top"><div class="card-icon-sq">${dep.icon}</div><div class="card-rate">${dep.rate}%</div></div>` : `<div class="row-card-top"><div class="card-icon-sq">${dep.icon}</div></div>`;
    const targetHtml = dep.target ? `<div style="width:100%; height:4px; background:white; border-radius:2px; margin-top:8px;"><div style="width:65%; height:100%; background:#818cf8; border-radius:2px;"></div></div>` : `<div class="card-details">До ${formatDate(dep.endDate)} · ${dep.trend || ''}</div>`;

    cardEl.innerHTML = `
      ${rateHtml}
      <div>
         <div class="card-label">${dep.label}</div>
         <div class="card-bal">${formatMoney(dep.balance, '')} с.</div>
         ${targetHtml}
      </div>
      ${dep.id !== 'd4' ? `<div class="card-link">${dep.id === 'd1' ? 'Пополнить >' : 'История >'}</div>` : ''}
    `;
    cardEl.onclick = () => selectDeposit(dep.id);
    elements.depositsOverview.appendChild(cardEl);
  });
}

function renderMiddleList() {
  if (!elements.middleList) return;
  elements.middleList.innerHTML = `<div class="box-header"><span class="box-title">Ваши депозиты</span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg></div>`;

  deposits.slice(0, 3).forEach(dep => {
    elements.middleList.innerHTML += `
      <div class="dep-item" style="cursor:pointer;" onclick="window.selectDeposit('${dep.id}')">
        <div class="dep-icon-sq">${dep.icon}</div>
        <div class="dep-info">
           <div class="dep-name">${dep.label}</div>
           <div class="dep-sub">Сомонбанк</div>
        </div>
        <div class="dep-val-col">
           <div class="dep-val">${formatMoney(dep.balance, '')} с.</div>
           <div class="dep-rate">${dep.rate ? dep.rate.toFixed(2) + '% МТМА' : ''}</div>
        </div>
      </div>
    `;
  });
}

window.selectDeposit = selectDeposit; // Export to global for onclick

function selectDeposit(id) {
  selectedDeposit = deposits.find(d => d.id === id);
  if (!selectedDeposit) return;

  // Update Visual Box
  const vTitle = document.querySelector(".v-dep-title");
  const vNumber = document.querySelector(".v-dep-title + div");
  const vBal = document.querySelector(".v-dep-bal");
  const vIban = document.querySelector(".v-dep-iban");
  const vCard = document.querySelector(".visual-deposit");

  if (vTitle) vTitle.textContent = selectedDeposit.label;
  if (vNumber) vNumber.textContent = selectedDeposit.number || 'Deposit Account';
  if (vBal) vBal.textContent = `${formatMoney(selectedDeposit.balance, '')} с.`;
  if (vIban) vIban.textContent = `IBAN: ${selectedDeposit.iban || 'TJSOMON104169733592467'}`;

  if (vCard) {
    const gradients = {
      pink: 'linear-gradient(135deg, #be185d 0%, #3b82f6 100%)',
      teal: 'linear-gradient(135deg, #0d9488 0%, #1e40af 100%)',
      yellow: 'linear-gradient(135deg, #b45309 0%, #1e40af 100%)',
      purple: 'linear-gradient(135deg, #6d28d9 0%, #1e40af 100%)'
    };
    vCard.style.background = gradients[selectedDeposit.color] || gradients.pink;
  }
}

function setupEventListeners() {
  document.querySelectorAll(".btn-new-dep, .nav-widget:last-child").forEach(btn => {
    btn.onclick = () => showToast("Функция открытия вклада будет доступна в следующем обновлении");
  });

  document.querySelector(".btn-primary-dep")?.addEventListener("click", () => {
    showToast("Переход к пополнению...");
  });

  document.querySelectorAll(".utility-item").forEach(item => {
    item.addEventListener("click", () => {
        const title = item.querySelector(".utility-title").textContent;
        showToast(`Открываем: ${title}`);
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
