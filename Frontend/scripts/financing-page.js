import {
  apiRequest,
  formatMoney,
  formatDate,
  getSession,
  showToast,
  isAuthenticated
} from "./common.js";

let credits = [];
let selectedCredit = null;

const elements = {
  profileName: document.querySelector(".user-name"),
  creditsOverview: document.getElementById("creditsOverview"),
  middleList: document.querySelector(".credit-list"),
  mainFocusBox: document.querySelector(".focus-box"),
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
    // In a real app, we'd fetch from /api/credits/my
    // seeding demo data to match the "Photo" exactly
    credits = [
      { 
        id: 'c1', 
        label: 'Ипотечный кредит', 
        balance: 523000, 
        rate: 18, 
        endDate: '2026-12-24', 
        total: 890000, 
        paid: 323000, 
        monthly: -7280, 
        nextDate: '2024-04-24', 
        color: 'blue', 
        icon: '🏠', 
        iban: 'TJSOMON104169733592467' 
      },
      { 
        id: 'c2', 
        label: 'Автокредит', 
        balance: 71200, 
        rate: 20, 
        endDate: '2026-03-15', 
        trend: '+4,990 с.', 
        color: 'green', 
        icon: '🚗', 
        iban: 'TJSOMON104169733591111' 
      },
      { 
        id: 'c3', 
        label: 'Потребительский кредит', 
        balance: 'Погашен досрочно', 
        rate: 25, 
        term: '9 месяцев', 
        color: 'yellow', 
        icon: '💵', 
        status: 'Погашен' 
      }
    ];

    renderOverview();
    renderMiddleList();
    
    if (credits.length > 0) {
      selectCredit(credits[0].id);
    }
  } catch (error) {
    console.error("Failed to load credits data", error);
    showToast("Ошибка загрузки данных");
  }
}

function renderOverview() {
  if (!elements.creditsOverview) return;
  elements.creditsOverview.innerHTML = "";

  credits.forEach(credit => {
    const cardEl = document.createElement("div");
    cardEl.className = `row-card ${credit.color || 'blue'}`;
    
    const balanceText = typeof credit.balance === 'number' ? `${formatMoney(credit.balance, '')} с.` : credit.balance;
    const detailText = credit.endDate ? `До ${formatDate(credit.endDate)} ${credit.trend || ''}` : `Срок: ${credit.term}`;
    const btnText = credit.status || 'Погасить >';

    cardEl.innerHTML = `
      <div class="row-card-top">
         <div class="card-icon-sq">${credit.icon}</div>
         <div class="card-rate">${credit.rate}%</div>
      </div>
      <div>
         <div class="card-label">${credit.label}</div>
         <div class="card-bal">${balanceText}</div>
         <div class="card-details">${detailText}</div>
      </div>
      <div class="card-btn">${btnText}</div>
    `;
    cardEl.onclick = () => selectCredit(credit.id);
    elements.creditsOverview.appendChild(cardEl);
  });
}

function renderMiddleList() {
  if (!elements.middleList) return;
  elements.middleList.innerHTML = `<div class="box-header"><span class="box-title">Ваши кредиты</span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg></div>`;

  credits.slice(0, 2).forEach(credit => {
    elements.middleList.innerHTML += `
      <div class="credit-item" style="cursor:pointer;" onclick="window.selectCredit('${credit.id}')">
        <div class="item-icon">${credit.icon}</div>
        <div class="item-info">
           <div class="item-name">${credit.label}</div>
           <div class="item-sub">Срок: ${credit.id === 'c1' ? '15 лет' : 'Свой автомобиль'}</div>
        </div>
        <div class="item-val-col">
           <div class="item-val">${formatMoney(credit.balance, '')} с.</div>
           <div class="item-date">${formatDate(credit.endDate)}, Сомони</div>
        </div>
      </div>
    `;
  });
}

window.selectCredit = selectCredit;

function selectCredit(id) {
  selectedCredit = credits.find(c => c.id === id);
  if (!selectedCredit || selectedCredit.id === 'c3') return;

  // Update Visual Box
  const vTitle = document.querySelector(".v-loan-title");
  const vIban = document.querySelector(".v-loan-title + div");
  const vBal = document.querySelector(".v-loan-bal");
  const vRateTrend = document.querySelector(".v-loan-trend");
  const vSummary = document.querySelector(".visual-loan > div:nth-child(2)");

  if (vTitle) vTitle.innerHTML = `${selectedCredit.icon} ${selectedCredit.label}`;
  if (vIban) vIban.textContent = `IBAN: ${selectedCredit.iban}`;
  if (vBal) vBal.textContent = `${formatMoney(selectedCredit.balance, '')} с.`;
  if (vRateTrend) vRateTrend.textContent = `+ ${selectedCredit.rate}%`;
  
  if (vSummary && selectedCredit.total) {
    vSummary.innerHTML = `+ ${formatMoney(selectedCredit.paid, '')} c. | сумма кредит ${formatMoney(selectedCredit.total, '')} c. <span style="float:right; color:#dcfce7;">+13.0% ⏱️ 220 с.</span>`;
  }

  // Update Stats
  const statVal = document.querySelector(".loan-stat-val");
  if (statVal && selectedCredit.monthly) {
    statVal.innerHTML = `${formatMoney(selectedCredit.monthly, '')} c. <span style="font-size:12px; color:#94a3b8; font-weight:700;">до ${formatDate(selectedCredit.nextDate)}</span>`;
  }
}

function setupEventListeners() {
  document.querySelectorAll(".btn-new-loan, .action-btn.primary").forEach(btn => {
    btn.onclick = () => showToast("Переход к оформлению/погашению...");
  });

  document.querySelectorAll(".knowledge-card, .offer-item").forEach(item => {
    item.addEventListener("click", () => {
        const title = item.querySelector(".k-title")?.textContent || item.querySelector(".o-name")?.textContent;
        showToast(`Открываем: ${title}`);
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
