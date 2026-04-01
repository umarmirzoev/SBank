import { showToast, checkAuth, API_BASE_URL } from "./common.js";

// Transfer types configuration matching the UI design
const TRANSFER_TYPES = {
  europe: {
    title: 'Переводы в Европу',
    description: 'Отправляйте деньги в 35 стран Европы без комиссии. Поддерживаются SEPA переводы, Swift и прямые переводы на карты Visa и Mastercard европейских банков.',
    features: ['0% комиссия', 'До 35 стран', 'Мгновенные переводы', 'Курс без наценки'],
    apiEndpoint: '/api/international-transfers/europe',
    icon: '€',
    color: '#1a6eff'
  },
  usa: {
    title: 'Переводы в США',
    description: 'Быстрые и безопасные переводы в США на банковские счета чековые и сберегательные, а также на дебетовые карты американских банков.',
    features: ['ACH переводы', 'Wire Transfer', 'До 1 рабочего дня', 'Полное отслеживание'],
    apiEndpoint: '/api/international-transfers/usa',
    icon: '$',
    color: '#1a6eff'
  },
  china: {
    title: 'Переводы в Китай',
    description: 'Прямые переводы на Alipay и WeChat Pay без комиссии. Получатель получит деньги в течение нескольких минут.',
    features: ['0% комиссия', 'Alipay & WeChat', 'Мгновенно', 'По телефону получателя'],
    apiEndpoint: '/api/international-transfers/china',
    icon: '¥',
    color: '#1a6eff'
  },
  unionpay: {
    title: 'UnionPay переводы',
    description: 'Международные переводы на карты UnionPay в более чем 180 странах мира. Выгодный курс и низкая комиссия.',
    features: ['180+ стран', 'Карты UnionPay', 'До 10 минут', 'Комиссия от 1%'],
    apiEndpoint: '/api/international-transfers',
    icon: 'Union',
    color: '#1a6eff'
  },
  mastercard: {
    title: 'Mastercard переводы',
    description: 'Отправляйте деньги напрямую на карты Mastercard по всему миру. Поддерживается MoneySend технология.',
    features: ['180+ стран', 'Mastercard MoneySend', 'Мгновенно', 'По номеру карты'],
    apiEndpoint: '/api/international-transfers',
    icon: 'MC',
    color: '#EB001B'
  },
  visa: {
    title: 'Visa переводы',
    description: 'Международные переводы за рубеж на карты Visa. 180+ стран мира доступны для выгодных переводов.',
    features: ['180+ стран', 'Карты Visa', 'Быстро и безопасно', 'Конкурентный курс'],
    apiEndpoint: '/api/international-transfers',
    icon: 'Visa',
    color: '#1a1f71'
  },
  domestic: {
    title: 'Переводы по Таджикистану',
    description: 'Ваши близкие получат деньги на карту Visa, Mastercard и национальные банки Таджикистана в два счёта.',
    features: ['По всему Таджикистану', 'На любые карты', 'Мгновенно', 'Низкая комиссия'],
    apiEndpoint: '/api/transfers/domestic',
    icon: 'TJ',
    color: '#10b981'
  },
  westernunion: {
    title: 'Western Union',
    description: 'Из любой точки мира в другую — деньги окажутся на счёту мгновенно. Более 190 стран и 500 000 пунктов выдачи.',
    features: ['190+ стран', '500 000+ пунктов', 'Мгновенно', 'Надёжно'],
    apiEndpoint: '/api/international-transfers/western-union',
    icon: 'WU',
    color: '#ffd700'
  },
  vatan: {
    title: 'Переводы через «Ватан»',
    description: 'Быстрая отправка денег по стране без открытия счёта. Удобный способ перевода для всей семьи.',
    features: ['Без открытия счёта', 'По всему Таджикистану', 'Быстро', 'Доступные тарифы'],
    apiEndpoint: '/api/transfers/vatan',
    icon: 'Vatan',
    color: '#3b82f6'
  },
  swift: {
    title: 'SWIFT переводы',
    description: 'Доступны все уголки мира. Деньги достанут получателя в целости и сохранности через банковскую сеть SWIFT.',
    features: ['Весь мир', 'Банковская сеть', 'Безопасно', 'Отслеживание'],
    apiEndpoint: '/api/international-transfers/swift',
    icon: 'SWIFT',
    color: '#1e40af'
  }
};

// Modal state
let currentTransferType = null;

/**
 * Initialize transfers page
 */
export function initTransfersPage() {
  setupEventListeners();
  setupIntersectionObserver();
  setupAnimations();
  updateAuthState();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Modal close on backdrop click
  const modal = document.getElementById('transferModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeTransferModal();
      }
    });
  }

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTransferModal();
    }
  });

  // Card click handlers
  document.querySelectorAll('.sb-transfer-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking the button directly
      if (e.target.closest('.sb-card-btn')) {
        e.stopPropagation();
        const type = card.dataset.type;
        openTransferModal(type);
      }
    });
  });
}

/**
 * Setup intersection observer for scroll animations
 */
function setupIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('sb-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.sb-transfer-card').forEach(card => {
    observer.observe(card);
  });
}

/**
 * Setup CSS animations
 */
function setupAnimations() {
  // Add will-change for performance
  document.querySelectorAll('.sb-transfer-card').forEach(card => {
    card.style.willChange = 'transform, box-shadow';
  });
}

/**
 * Update auth state in UI
 */
function updateAuthState() {
  const controls = document.getElementById('authControls');
  if (!controls) return;

  if (checkAuth()) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    controls.innerHTML = `
      <span class="sb-auth-greeting">Привет, ${user.firstName || 'Пользователь'}</span>
      <button class="sb-inline-btn" onclick="window.logout()">Выйти</button>
    `;
  } else {
    controls.innerHTML = `
      <button class="sb-ghost-btn" onclick="window.showLoginModal()">Войти</button>
    `;
  }
}

/**
 * Open transfer modal with type-specific content
 */
export function openTransferModal(type) {
  const data = TRANSFER_TYPES[type];
  if (!data) {
    console.error(`Unknown transfer type: ${type}`);
    return;
  }

  currentTransferType = type;

  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');
  const modal = document.getElementById('transferModal');

  if (titleEl) titleEl.textContent = data.title;
  
  if (bodyEl) {
    bodyEl.innerHTML = `
      <p style="color: #6b7c9b; margin-bottom: 16px;">${data.description}</p>
      <div style="background: #f7fbff; border-radius: 12px; padding: 16px;">
        <ul style="margin: 0; padding-left: 20px; color: #1a2b4c;">
          ${data.features.map(f => `<li style="margin-bottom: 8px; font-size: 14px;">${f}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Track analytics
  trackTransferClick(type);
}

/**
 * Close transfer modal
 */
export function closeTransferModal() {
  const modal = document.getElementById('transferModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  currentTransferType = null;
}

/**
 * Start transfer process - calls backend API
 */
export async function startTransfer() {
  if (!currentTransferType) return;
  
  const data = TRANSFER_TYPES[currentTransferType];
  
  if (!checkAuth()) {
    showToast('Необходимо войти в систему', 'error');
    closeTransferModal();
    // Redirect to login
    setTimeout(() => {
      window.location.href = '/login.html?redirect=transfers';
    }, 1500);
    return;
  }

  const btn = document.getElementById('modalActionBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="sb-loading"></span> Загрузка...';
  }

  try {
    showToast('Загрузка информации о переводе...', 'info');
    
    // Call backend API
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${data.apiEndpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Сессия истекла. Пожалуйста, войдите снова.', 'error');
        setTimeout(() => {
          window.location.href = '/login.html?redirect=transfers';
        }, 1500);
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    showToast('Данные загружены успешно!', 'success');
    
    // Store transfer info and redirect to form
    sessionStorage.setItem('transferType', currentTransferType);
    sessionStorage.setItem('transferData', JSON.stringify(result));
    
    // Redirect to transfer form
    setTimeout(() => {
      window.location.href = `/transfer-form.html?type=${currentTransferType}`;
    }, 500);

  } catch (error) {
    console.error('Transfer API error:', error);
    showToast('Ошибка соединения. Проверьте интернет.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Перейти к переводу';
    }
  }
}

/**
 * Track transfer click for analytics
 */
function trackTransferClick(type) {
  // Send analytics to backend
  const event = {
    event: 'transfer_selected',
    type: type,
    timestamp: new Date().toISOString(),
    userId: localStorage.getItem('userId') || 'anonymous'
  };
  
  // Could send to analytics endpoint
  console.log('Analytics:', event);
}

/**
 * Get exchange rates for specific transfer type
 */
export async function getExchangeRates(type) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/exchange-rates?type=${type}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch rates');
    
    return await response.json();
  } catch (error) {
    console.error('Exchange rates error:', error);
    return null;
  }
}

/**
 * Calculate transfer fee
 */
export function calculateFee(amount, type) {
  const feeRates = {
    europe: 0,      // 0% commission
    usa: 0.015,     // 1.5%
    china: 0,       // 0% commission
    unionpay: 0.01, // 1%
    mastercard: 0.015 // 1.5%
  };
  
  const rate = feeRates[type] || 0.02;
  return Math.round(amount * rate * 100) / 100;
}

// Make functions available globally for onclick handlers
window.openTransferModal = openTransferModal;
window.closeTransferModal = closeTransferModal;
window.startTransfer = startTransfer;
window.getExchangeRates = getExchangeRates;
window.calculateFee = calculateFee;

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTransfersPage);
} else {
  initTransfersPage();
}
