import { apiRequest, showToast, formatMoney, requireAuth } from './common.js';

document.addEventListener('DOMContentLoaded', () => {
    requireAuth(initTransfersPage);
});

async function initTransfersPage(session) {
  const optionsGrid = document.getElementById('optionsGrid');
  const formTitle = document.getElementById('formTitle');
  const transferForm = document.getElementById('transferForm');
  const fromSelect = document.getElementById('fromAccountSelect');
  const toInput = document.getElementById('toAccountInput');
  const amountInput = document.getElementById('amountInput');
  const descInput = document.getElementById('descInput');
  
  const sumAmount = document.getElementById('summaryAmount');
  const sumFee = document.getElementById('summaryFee');
  const sumTotal = document.getElementById('summaryTotal');
  const submitBtn = document.getElementById('submitBtn');

  // Hardcode options UI visually
  const transferOptions = [
    {
      id: 'card',
      title: 'На карту',
      subtitle: 'По номеру банковской карты',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
      active: true
    },
    {
      id: 'phone',
      title: 'По номеру телефона',
      subtitle: 'Телефон получателя',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>'
    },
    {
      id: 'requisites',
      title: 'По реквизитам',
      subtitle: 'По номеру счета, БИК, ИНН',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'
    }
  ];

  function renderOptions() {
    optionsGrid.innerHTML = transferOptions.map(opt => `
      <div class="t-option ${opt.active ? 'active' : ''}" data-id="${opt.id}">
        <div class="t-icon">${opt.icon}</div>
        <strong>${opt.title}</strong>
        <span>${opt.subtitle}</span>
      </div>
    `).join('');

    optionsGrid.querySelectorAll('.t-option').forEach(el => {
      el.addEventListener('click', () => {
        transferOptions.forEach(o => o.active = false);
        const selected = transferOptions.find(o => o.id === el.dataset.id);
        if (selected) selected.active = true;
        renderOptions();
        formTitle.textContent = selected.title;
        
        // simple anim
        transferForm.style.opacity = '0';
        transferForm.style.transform = 'translateY(10px)';
        setTimeout(() => {
          transferForm.style.opacity = '1';
          transferForm.style.transform = 'translateY(0)';
          transferForm.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }, 50);
      });
    });
  }

  renderOptions();

  // Load User Accounts & Seed if Empty
  async function loadAccounts() {
    try {
      let accountsData = await apiRequest('/api/account/my');
      
      // Auto-Seed Logic: "Создай мне карту и на моем счета был 100 сомон"
      if (!accountsData || !accountsData.items || accountsData.items.length === 0) {
        showToast('Создаем тестовый счет и карту со 100 сомони...');
        // 1. Create account
        const newAcc = await apiRequest('/api/account/open', {
          method: 'POST',
          body: { type: 'Current', currency: 'TJS' }
        });
        const accId = newAcc.data.id;
        
        // 2. Add 100 Somoni
        await apiRequest('/api/transaction/deposit', {
          method: 'POST',
          body: { accountId: accId, amount: 100, description: 'Приветственный бонус' }
        });
        
        // 3. Create Card 
        await apiRequest('/api/card/create', {
          method: 'POST',
          body: { accountId: accId, cardHolderName: 'MY CARD', type: 'Physical' }
        });
        
        // reload
        accountsData = await apiRequest('/api/account/my');
      }

      fromSelect.innerHTML = '';
      if (accountsData && accountsData.items && accountsData.items.length > 0) {
        accountsData.items.forEach(acc => {
          const opt = document.createElement('option');
          opt.value = acc.id;
          opt.textContent = `Счёт ${acc.accountNumber} • ${formatMoney(acc.balance, acc.currency)}`;
          fromSelect.appendChild(opt);
        });
      } else {
         fromSelect.innerHTML = '<option value="">Нет счетов</option>';
      }
    } catch (e) {
      console.error(e);
      showToast('Ошибка загрузки счетов');
    }
  }

  await loadAccounts();

  // Dynamic fee calculation
  function updateSummary() {
    const amount = parseFloat(amountInput.value) || 0;
    // Let's assume 1% fee for simplicity, or 0 if same bank
    const fee = amount * 0.01; 
    const total = amount + fee;
    
    sumAmount.textContent = formatMoney(amount, 'с.');
    sumFee.textContent = formatMoney(fee, 'с.');
    sumTotal.textContent = formatMoney(total, 'с.');
    submitBtn.textContent = `Перевести ${formatMoney(total, 'с.')}`;
  }

  amountInput.addEventListener('input', updateSummary);
  updateSummary(); // init

  // Card Number 12-digits formatting
  toInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 12);
    // Format as 4 4 4 (12 digits)
    val = val.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = val;
  });

  // Handle Form Submission
  transferForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const accountId = fromSelect.value;
    const toAccount = toInput.value.replace(/\s/g, ''); // Unformat
    const amount = parseFloat(amountInput.value);
    const desc = descInput.value;

    if (!accountId) {
      showToast('Выберите счет списания'); return;
    }
    if (toAccount.length < 12) {
      showToast('Номер получателя должен быть 12 цифр'); return;
    }
    if (amount <= 0) {
      showToast('Сумма должна быть больше 0'); return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = 'Обработка... <svg width="20" height="20" style="vertical-align:-4px; margin-left:8px; animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>';
    submitBtn.disabled = true;

    try {
      const resp = await apiRequest('/api/transaction/transfer', {
         method: 'POST',
         body: {
            fromAccountId: accountId,
            toAccountNumber: toAccount,
            amount: amount,
            description: desc || 'Перевод с карты'
         }
      });
      
      showToast('Перевод успешно выполнен!');
      // reload balances
      await loadAccounts();
      amountInput.value = '100';
      updateSummary();
      toInput.value = '';
      descInput.value = '';
    } catch (err) {
      showToast(err.message || 'Ошибка перевода');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });

  // Animation for loading icon
  if (!document.getElementById('spinStyle')) {
    const style = document.createElement('style');
    style.id = 'spinStyle';
    style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
}
