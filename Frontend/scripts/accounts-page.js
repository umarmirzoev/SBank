import {
  apiRequest,
  formatMoney,
  formatDate,
  getSession,
  showToast,
  isAuthenticated
} from "./common.js";

let accounts = [];
let savingsGoals = [];
let transactions = [];
let selectedAccount = null;

const elements = {
  accountsList: document.getElementById("accountsList"),
  profileName: document.getElementById("profileName"),
  detailTitle: document.getElementById("detailTitle"),
  selectedAccLabel: document.getElementById("selectedAccLabel"),
  selectedAccNumber: document.getElementById("selectedAccNumber"),
  selectedAccBalance: document.getElementById("selectedAccBalance"),
  selectedAccTrend: document.getElementById("selectedAccTrend"),
  selectedAccIban: document.getElementById("selectedAccIban"),
  balanceSecondary: document.getElementById("balanceSecondary"),
  miniBars: document.getElementById("miniBars"),
  operationsListMiddle: document.getElementById("operationsListMiddle"),
  operationsListWidget: document.getElementById("operationsListWidget"),
  transferActionBtn: document.getElementById("transferActionBtn")
};

async function init() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  const session = getSession();
  elements.profileName.textContent = session.fullName || "Иван Иванов";

  await loadData();
  setupEventListeners();
}

async function loadData() {
  try {
    const [accRes, goalRes, transRes] = await Promise.all([
      apiRequest("/api/accounts/my?page=1&pageSize=20", { auth: true }),
      apiRequest("/api/SavingsGoal/my?page=1&pageSize=20", { auth: true }),
      apiRequest("/api/transaction/my?page=1&pageSize=20", { auth: true })
    ]);

    accounts = accRes.items || [];
    savingsGoals = goalRes.items || [];
    transactions = transRes.items || [];

    // Seeding demo data to match the "Photo" exactly if backend is empty
    if (accounts.length === 0) {
      accounts = [
        { id: '1', type: 'Current', currency: 'TJS', balance: 5230, accountNumber: '4166 7385 **** 2467', iban: 'TJSOMON104167332467' },
        { id: '2', type: 'Savings', currency: 'USD', balance: 970.20, accountNumber: '4165 7885 **** 7942', iban: 'USDOMON992123456789' }
      ];
    }
    if (savingsGoals.length === 0) {
      savingsGoals = [
        { id: 'g1', name: 'Накопительный', currentAmount: 24500, targetAmount: 100000, deadline: '2024-10-24' },
        { id: 'g2', name: 'Целевой', currentAmount: 127500, targetAmount: 200000, description: 'План: Новая машина' }
      ];
    }
    if (transactions.length === 0) {
      transactions = [
        { id: 't1', type: 'Transfer', amount: 700000, description: 'Мария П.', createdAt: new Date().toISOString() },
        { id: 't2', type: 'Payment', amount: -75, description: 'Коммунальные', createdAt: new Date().toISOString() },
        { id: 't3', type: 'Transfer', amount: -1000, description: 'Артем И.', createdAt: new Date().toISOString() },
        { id: 't4', type: 'Withdrawal', amount: -164.50, description: 'Продуктовый магазин', createdAt: new Date().toISOString() }
      ];
    }

    renderTopCards();
    
    // Select first account by default
    if (accounts.length > 0) {
      selectAccount(accounts[0].id);
    }
    
    renderOperations();
  } catch (error) {
    console.error("Failed to load data", error);
    showToast("Ошибка загрузки данных");
  }
}

function renderTopCards() {
  elements.accountsList.innerHTML = "";
  
  const cardConfigs = [
    { type: 'Current', color: 'blue', icon: '💳', label: 'Текущий' },
    { type: 'Savings', color: 'teal', icon: '💵', label: 'Долларовый' },
    { type: 'Goal', color: 'yellow', icon: '🐷', label: 'Накопительный' },
    { type: 'Target', color: 'green', icon: '🎯', label: 'Целевой' }
  ];

  cardConfigs.forEach(cfg => {
    let data = null;
    if (cfg.type === 'Current') data = accounts.find(a => a.type === 'Current') || accounts[0];
    else if (cfg.type === 'Savings') data = accounts.find(a => a.currency === 'USD') || accounts[1];
    else if (cfg.type === 'Goal') data = savingsGoals[0];
    else if (cfg.type === 'Target') data = savingsGoals[1];

    const card = document.createElement("div");
    card.className = `acc-card ${cfg.color}`;
    
    const balance = data ? (data.balance ?? data.currentAmount) : 0;
    const currency = data?.currency === 'USD' ? '$' : 'с.';
    const sub = data?.accountNumber ? data.accountNumber : (data?.targetAmount ? `${Math.round((data.currentAmount/data.targetAmount)*100)}% до ${data.deadline || 'цели'}` : 'План: Новая машина');

    card.innerHTML = `
      <div class="card-top">
        <div class="card-icon-box" style="font-size:20px;">${cfg.icon}</div>
        <div class="card-check">✓</div>
      </div>
      <div>
        <div class="card-label">${cfg.label}</div>
        <div class="card-balance">${currency === '$' ? '$' : ''}${formatMoney(balance, '')} ${currency === '$' ? '' : 'с.'}</div>
        <div class="card-number">${sub}</div>
      </div>
    `;
    card.onclick = () => data && selectAccount(data.id);
    elements.accountsList.appendChild(card);
  });
}

function selectAccount(id) {
  selectedAccount = accounts.find(a => a.id === id) || savingsGoals.find(g => g.id === id);
  if (!selectedAccount) return;

  // Visual highlights
  document.querySelectorAll(".acc-card").forEach(c => c.style.border = "none");
  // Find card and highlight? No, the photo doesn't show a borders for active card, it just updates the detail view.

  elements.detailTitle.textContent = selectedAccount.type === 'Current' ? 'Текущий счёт' : 'Детали счёта';
  elements.selectedAccLabel.textContent = selectedAccount.name || (selectedAccount.type === 'Current' ? 'Основной счёт' : (selectedAccount.currency === 'USD' ? 'Валютный счёт' : 'Цель'));
  elements.selectedAccNumber.textContent = selectedAccount.accountNumber || '4169 7385 **** 2467';
  
  const currency = selectedAccount.currency === 'USD' ? '$' : 'с.';
  const balance = selectedAccount.balance ?? selectedAccount.currentAmount;
  elements.selectedAccBalance.textContent = `${currency === '$' ? '$' : ''}${formatMoney(balance, '')} ${currency === '$' ? '' : 'с.'}`;
  elements.selectedAccIban.textContent = `IBAN ${selectedAccount.iban || 'TJSOMON104167332467'}`;
  
  elements.selectedAccTrend.textContent = '+ 3,36%'; // Static like in photo
  elements.balanceSecondary.textContent = '+ 520,00 с.'; // Static like in photo

  updateMiniBars();
}

function updateMiniBars() {
  const bars = elements.miniBars.querySelectorAll(".mini-bar");
  bars.forEach(bar => {
    const h = Math.floor(Math.random() * 70) + 10;
    bar.style.height = `${h}%`;
    bar.classList.remove("active");
  });
  bars[Math.floor(Math.random() * bars.length)].classList.add("active");
}

function renderOperations() {
  // Clear previous
  elements.operationsListMiddle.innerHTML = "";
  elements.operationsListWidget.innerHTML = "";

  transactions.forEach((t, i) => {
    const item = renderOpItem(t, true);
    elements.operationsListMiddle.innerHTML += item;
    
    if (i < 4) {
      const widgetItem = renderOpItem(t, false);
      elements.operationsListWidget.innerHTML += widgetItem;
    }
  });
}

function renderOpItem(t, isFull) {
  const isPlus = t.amount > 0;
  const avatar = `https://i.pravatar.cc/100?u=${t.id}`;
  
  if (isFull) {
    return `
      <div class="op-card" style="margin-bottom:8px;">
        <img src="${avatar}" class="avatar-sm" alt="U">
        <div class="op-info">
          <div class="op-name">${t.description || t.type}</div>
          <div class="op-sub">${t.accountNumber || (isPlus ? 'Пополнение' : 'Перевод')}</div>
        </div>
        <div class="op-amount-side">
          <div class="op-amt ${isPlus ? 'plus' : 'minus'}">
            ${isPlus ? '+' : ''}${formatMoney(t.amount, '')}
          </div>
          <div class="op-time">${formatDate(t.createdAt)}</div>
        </div>
      </div>
    `;
  } else {
    // Smaller widget style
    return `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
         <img src="${avatar}" style="width:32px; height:32px; border-radius:50%;" alt="U">
         <div style="flex:1">
            <div style="font-size:12px; font-weight:700;">${t.description || t.type}</div>
            <div style="font-size:10px; color:#94a3b8;">${formatDate(t.createdAt)}</div>
         </div>
         <div style="font-size:12px; font-weight:800; color: ${isPlus ? '#10b981' : '#1e293b'}">
            ${isPlus ? '+' : ''}${formatMoney(t.amount, '')}
         </div>
      </div>
    `;
  }
}

function setupEventListeners() {
  elements.transferActionBtn.onclick = () => {
    if (!selectedAccount) return;
    window.location.href = `transfers.html?from=${selectedAccount.id}&type=${(selectedAccount.type || 'card').toLowerCase()}`;
  };

  document.querySelectorAll(".copy-icon").forEach(btn => {
    btn.onclick = () => {
      const targetId = btn.dataset.copy;
      const text = document.getElementById(targetId).textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast("Скопировано в буфер обмена");
      });
    };
  });
}

document.addEventListener("DOMContentLoaded", init);
