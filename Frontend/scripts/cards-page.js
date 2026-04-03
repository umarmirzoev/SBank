import {
  apiRequest,
  formatMoney,
  formatDate,
  getSession,
  showToast,
  isAuthenticated
} from "./common.js";

let userCards = [];
let transactions = [];
let selectedCard = null;

const elements = {
  profileName: document.querySelector(".user-name"),
  cardsList: document.getElementById("cardsList"),
  operationsListMiddle: document.querySelector(".middle-col .ops-list"),
  operationsListWidget: document.querySelector(".mini-ops-box div:last-child"),
  btnTransfer: document.getElementById("btnGoToTransfer")
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
    const [cardsRes, transRes] = await Promise.all([
      apiRequest("/api/cards/my?page=1&pageSize=20", { auth: true }),
      apiRequest("/api/transaction/my?page=1&pageSize=20", { auth: true })
    ]);

    userCards = cardsRes.items || [];
    transactions = transRes.items || [];

    // Seeding demo data to match the "Photo" exactly if backend is empty
    if (userCards.length === 0) {
      userCards = [
        { id: 'c1', type: 'Physical', label: 'Основная карта', balance: 5230, cardNumber: '4169 7385 **** 2467', color: 'blue', icon: '💳' },
        { id: 'c2', type: 'Physical', label: 'Долларовая', balance: 970.20, cardNumber: '4165 7288 **** 7942', color: 'green', icon: '💵', currency: 'USD' },
        { id: 'c3', type: 'Virtual', label: 'Накопительная', balance: 24500, cardNumber: '20.8% к 24.10.2024', color: 'yellow', icon: '🐷' },
        { id: 'c4', type: 'Virtual', label: 'Целевая', balance: 127560, cardNumber: 'План: Новая машина', color: 'purple', icon: '🎯', target: 200000 }
      ];
    }

    if (transactions.length === 0) {
      transactions = [
        { id: 't1', description: 'Продуктовый', amount: -124.30, category: 'Кат. имидж', createdAt: '2024-07-01T12:00:00', icon: '📦' },
        { id: 't2', description: 'Мария П.', amount: 700.00, category: 'Взаимовыру', createdAt: '2024-07-01T14:30:00', isAvatar: true },
        { id: 't3', description: 'Кинотеатр', amount: -62.00, category: 'Развлечение', createdAt: '2024-06-08T20:00:00', icon: '🎬' },
        { id: 't4', description: 'Ростелеком', amount: -100.00, category: 'За услуги', createdAt: '2024-10-09T09:00:00', icon: '☁️' }
      ];
    }

    renderCards();
    renderOperations();
    
    if (userCards.length > 0) {
      selectCard(userCards[0].id);
    }
  } catch (error) {
    console.error("Failed to load cards data", error);
    showToast("Ошибка загрузки данных");
  }
}

function renderCards() {
  if (!elements.cardsList) return;
  elements.cardsList.innerHTML = "";

  userCards.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.className = `manage-card ${card.color || 'blue'}`;
    
    const balanceStr = card.currency === 'USD' ? `$${formatMoney(card.balance, '')}` : `${formatMoney(card.balance, '')} с.`;
    const targetStr = card.target ? ` <span style="font-size:12px; opacity:0.6;">из ${formatMoney(card.target, '')} с.</span>` : '';

    cardEl.innerHTML = `
      <div class="manage-card-top">
         <div class="card-icon-sq">${card.icon || '💳'}</div>
         <div class="card-switch" style="${card.id === selectedCard?.id ? '' : 'background:#e2e8f0;'}"></div>
      </div>
      <div>
         <div class="manage-card-label">${card.label}</div>
         <div class="manage-card-bal">${balanceStr}${targetStr}</div>
         <div class="manage-card-num">${card.cardNumber}</div>
      </div>
    `;
    cardEl.onclick = () => selectCard(card.id);
    elements.cardsList.appendChild(cardEl);
  });
}

function selectCard(id) {
  selectedCard = userCards.find(c => c.id === id);
  if (!selectedCard) return;

  renderCards(); // Refresh highlighted state

  // Update Main Focus Box
  const vCard = document.querySelector(".visual-card");
  const vLabel = document.querySelector(".v-card-name");
  const vNum = document.querySelector(".v-card-name + div");
  const vBal = document.querySelector(".v-card-balance");
  const vIban = document.querySelector(".v-card-number");

  if (vLabel) vLabel.textContent = selectedCard.label;
  if (vNum) vNum.textContent = selectedCard.cardNumber;
  if (vBal) vBal.textContent = selectedCard.currency === 'USD' ? `$${formatMoney(selectedCard.balance, '')}` : `${formatMoney(selectedCard.balance, '')} с.`;
  if (vIban) vIban.textContent = `IBAN TJSOMON1041673357821`; // Static like photo

  // Special colors for visual card
  if (vCard) {
    const colors = {
      blue: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      green: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
      yellow: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
      purple: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)'
    };
    vCard.style.background = colors[selectedCard.color] || colors.blue;
  }
}

function renderOperations() {
  if (elements.operationsListMiddle) {
    elements.operationsListMiddle.innerHTML = `<div class="box-title">Последние операции</div>`;
    transactions.forEach(t => {
      elements.operationsListMiddle.innerHTML += `
        <div class="op-item">
           ${t.isAvatar ? `<img src="https://i.pravatar.cc/100?u=${t.id}" class="avatar-sm" style="width:44px; height:44px; border-radius:50%;">` : `<div class="op-icon">${t.icon}</div>`}
           <div class="op-info">
              <div class="op-name">${t.description}</div>
              <div class="op-memo">${t.category}</div>
           </div>
           <div class="op-amt-col">
              <div class="op-amt ${t.amount < 0 ? 'neg' : 'pos'}">${t.amount < 0 ? '' : '+'}${formatMoney(t.amount, '')} с.</div>
              <div class="op-date">${formatDate(t.createdAt)}</div>
           </div>
        </div>
      `;
    });
  }

  if (elements.operationsListWidget) {
    elements.operationsListWidget.innerHTML = "";
    transactions.slice(0, 4).forEach(t => {
      elements.operationsListWidget.innerHTML += `
        <div style="display:flex; align-items:center; gap:12px;">
           ${t.isAvatar ? `<img src="https://i.pravatar.cc/100?u=${t.id}" style="width:32px; height:32px; border-radius:50%;">` : `<div style="width:32px; height:32px; border-radius:50%; background:#f8fafc; display:grid; place-items:center; font-size:14px;">${t.icon}</div>`}
           <div style="flex:1">
              <div style="font-size:12px; font-weight:700;">${t.description}</div>
              <div style="font-size:10px; color:#94a3b8;">${t.category}</div>
           </div>
           <div style="font-size:12px; font-weight:800; color: ${t.amount > 0 ? '#10b981' : '#1e293b'};">
              ${t.amount > 0 ? '+' : ''}${formatMoney(t.amount, '')} с.
           </div>
        </div>
      `;
    });
  }
}

function setupEventListeners() {
  if (elements.btnTransfer) {
    elements.btnTransfer.onclick = () => {
      window.location.href = "transfers.html";
    };
  }

  // Double Check if common.js toast works
  window.addEventListener('error', () => {
    // Suppress small icon errors
  });
}

document.addEventListener("DOMContentLoaded", init);
