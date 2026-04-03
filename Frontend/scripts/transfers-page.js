document.addEventListener('DOMContentLoaded', () => {
  const optionsGrid = document.getElementById('optionsGrid');
  const formTitle = document.getElementById('formTitle');
  const transferForm = document.getElementById('transferForm');
  const toastStatus = document.getElementById('toastStatus');

  const transferOptions = [
    {
      id: 'card',
      title: 'На карту',
      subtitle: 'По номеру банковской карты',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
      active: true
    },
    {
      id: 'card2',
      title: 'На карту',
      subtitle: 'По номеру банковской карты',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>'
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
    },
    {
      id: 'account',
      title: 'По номеру счёта, БИК, ИНН',
      subtitle: '',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' // Fallback icon
    },
    {
      id: 'int',
      title: 'Международный перевод',
      subtitle: 'По номеру счета за границей',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
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

    const optionEls = optionsGrid.querySelectorAll('.t-option');
    optionEls.forEach(el => {
      el.addEventListener('click', () => {
        transferOptions.forEach(o => o.active = false);
        const selected = transferOptions.find(o => o.id === el.dataset.id);
        if (selected) selected.active = true;
        
        renderOptions();
        
        // Update Form Title
        formTitle.textContent = selected.title;
        // Basic animation feeling
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

  transferForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = transferForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    
    btn.innerHTML = 'Обработка... <svg width="20" height="20" style="vertical-align:-4px; margin-left:8px; animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>';
    btn.style.pointerEvents = 'none';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.pointerEvents = 'auto';
      showToast('Перевод успешно выполнен!');
    }, 1200);
  });

  function showToast(message) {
    if(!toastStatus) return;
    toastStatus.textContent = message;
    toastStatus.classList.add('show');
    setTimeout(() => {
      toastStatus.classList.remove('show');
    }, 3000);
  }

  // Animation for loading icon
  const style = document.createElement('style');
  style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
});
