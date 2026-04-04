import { apiRequest, formatDate, formatMoney, getSession, isAuthenticated, showToast, unwrapResponse } from "./common.js";

const T = {
  user: "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c",
  emailMissing: "Email \u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d",
  phoneMissing: "\u0422\u0435\u043b\u0435\u0444\u043e\u043d \u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d",
  registeredAt: "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f",
  accountActive: "\u0410\u043a\u043a\u0430\u0443\u043d\u0442 \u0430\u043a\u0442\u0438\u0432\u0435\u043d",
  accountBlocked: "\u0410\u043a\u043a\u0430\u0443\u043d\u0442 \u0437\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d",
  noNotifications: "\u0423 \u0432\u0430\u0441 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0439.",
  none: "\u041d\u0435\u0442",
  identityTitle: "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u043b\u0438\u0447\u043d\u043e\u0441\u0442\u0438",
  identityApproved: "\u0412\u0430\u0448 KYC \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d.",
  identityStatusPrefix: "\u0422\u0435\u043a\u0443\u0449\u0438\u0439 \u0441\u0442\u0430\u0442\u0443\u0441 KYC: ",
  phoneTitle: "\u041f\u0440\u0438\u0432\u044f\u0437\u0430\u043d\u043d\u044b\u0439 \u043d\u043e\u043c\u0435\u0440 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430",
  phoneBoundPrefix: "\u041d\u043e\u043c\u0435\u0440 ",
  phoneBoundSuffix: " \u043f\u0440\u0438\u0432\u044f\u0437\u0430\u043d \u043a \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0443.",
  phoneNotSet: "\u0422\u0435\u043b\u0435\u0444\u043e\u043d \u0432 \u043f\u0440\u043e\u0444\u0438\u043b\u0435 \u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d.",
  smsTitle: "SMS \u0438 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f",
  smsOn: "\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f \u0443\u0436\u0435 \u043f\u0440\u0438\u0445\u043e\u0434\u044f\u0442 \u0432 \u0430\u043a\u043a\u0430\u0443\u043d\u0442 \u043f\u043e\u0441\u043b\u0435 \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u0439.",
  smsOff: "\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0439, \u043d\u043e \u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u0433\u043e\u0442\u043e\u0432\u0430 \u0438\u0445 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c.",
  noActivity: "\u041f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0432\u043e\u0439 \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u0438 \u0437\u0434\u0435\u0441\u044c \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f \u0438\u0441\u0442\u043e\u0440\u0438\u044f \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0445 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439.",
  transfer: "\u041f\u0435\u0440\u0435\u0432\u043e\u0434",
  account: "\u0421\u0447\u0451\u0442",
  passport: "\u041f\u0430\u0441\u043f\u043e\u0440\u0442",
  notSpecified: "\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d",
  kycStatus: "KYC \u0441\u0442\u0430\u0442\u0443\u0441",
  address: "\u0410\u0434\u0440\u0435\u0441",
  sentForReview: "\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e \u043d\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0443",
  noRecentTransfers: "\u041d\u0435\u0434\u0430\u0432\u043d\u0438\u0445 \u043f\u0435\u0440\u0435\u0432\u043e\u0434\u043e\u0432 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.",
  noSessionUser: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0438\u0442\u044c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f \u0432 \u0441\u0435\u0441\u0441\u0438\u0438.",
  profileNotLoaded: "\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u0435\u0449\u0451 \u043d\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d",
  profileUpdated: "\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d",
  profileSaveError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043f\u0440\u043e\u0444\u0438\u043b\u044c",
  notificationsRead: "\u0412\u0441\u0435 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f \u043e\u0442\u043c\u0435\u0447\u0435\u043d\u044b \u043a\u0430\u043a \u043f\u0440\u043e\u0447\u0438\u0442\u0430\u043d\u043d\u044b\u0435",
  notificationsReadError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f",
  dataUpdated: "\u0414\u0430\u043d\u043d\u044b\u0435 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u044b",
  dataUpdateError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0434\u0430\u043d\u043d\u044b\u0435",
  settingsLoadError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438"
};

const state = { user: null, accounts: [], cards: [], notifications: [], transfers: [], kycStatus: null, kycProfile: null };

const el = {
  headerAvatar: document.getElementById("headerAvatar"),
  headerName: document.getElementById("headerName"),
  notifCount: document.getElementById("notifCount"),
  profileAvatar: document.getElementById("profileAvatar"),
  profileFullName: document.getElementById("profileFullName"),
  profileEmail: document.getElementById("profileEmail"),
  profilePhone: document.getElementById("profilePhone"),
  profileCreatedAt: document.getElementById("profileCreatedAt"),
  accountStatus: document.getElementById("accountStatus"),
  profileForm: document.getElementById("profileForm"),
  refreshProfile: document.getElementById("refreshProfile"),
  saveProfile: document.getElementById("saveProfile"),
  notificationsList: document.getElementById("notificationsList"),
  securityList: document.getElementById("securityList"),
  activityTimeline: document.getElementById("activityTimeline"),
  documentsList: document.getElementById("documentsList"),
  summaryBalance: document.getElementById("summaryBalance"),
  summaryAccounts: document.getElementById("summaryAccounts"),
  summaryCards: document.getElementById("summaryCards"),
  summaryPhone: document.getElementById("summaryPhone"),
  summaryEmail: document.getElementById("summaryEmail"),
  summaryKyc: document.getElementById("summaryKyc"),
  summaryNotification: document.getElementById("summaryNotification"),
  recentTransfers: document.getElementById("recentTransfers"),
  markAllNotifications: document.getElementById("markAllNotifications"),
  tabs: Array.from(document.querySelectorAll("[data-tab]")),
  panels: Array.from(document.querySelectorAll("[data-panel]"))
};

function initials(name) {
  return String(name || "SB").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "SB";
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function statusChip(isActive) {
  return isActive
    ? { text: T.accountActive, className: "status-chip success" }
    : { text: T.accountBlocked, className: "status-chip danger" };
}

function switchTab(tabName) {
  el.tabs.forEach((button) => button.classList.toggle("active", button.dataset.tab === tabName));
  el.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tabName));
}

function bindTabs() {
  el.tabs.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });
}

function fillProfile() {
  const user = state.user;
  if (!user || !el.profileForm) return;

  const fullName = `${user.firstName || user.FirstName || ""} ${user.lastName || user.LastName || ""}`.trim();
  const badge = initials(fullName);
  const chip = statusChip(Boolean(user.isActive ?? user.IsActive));

  el.headerAvatar.textContent = badge;
  el.profileAvatar.textContent = badge;
  el.headerName.textContent = fullName || T.user;
  el.profileFullName.textContent = fullName || T.user;
  el.profileEmail.textContent = user.email || user.Email || T.emailMissing;
  el.profilePhone.textContent = user.phone || user.Phone || T.phoneMissing;
  el.profileCreatedAt.textContent = `${T.registeredAt}: ${formatDate(user.createdAt || user.CreatedAt)}`;
  el.accountStatus.textContent = chip.text;
  el.accountStatus.className = chip.className;

  el.profileForm.firstName.value = user.firstName || user.FirstName || "";
  el.profileForm.lastName.value = user.lastName || user.LastName || "";
  el.profileForm.phone.value = user.phone || user.Phone || "";
  el.profileForm.email.value = user.email || user.Email || "";
  el.profileForm.passportNumber.value = user.passportNumber || user.PassportNumber || "";
  el.profileForm.role.value = user.role || user.Role || "";
  el.profileForm.address.value = user.address || user.Address || "";
}

function renderNotifications() {
  const items = state.notifications;
  const unreadCount = items.filter((item) => !(item.isRead ?? item.IsRead)).length;
  el.notifCount.textContent = String(unreadCount);
  el.summaryNotification.textContent = items[0]?.title || items[0]?.Title || T.none;

  if (!items.length) {
    el.notificationsList.innerHTML = `<div class="empty-state">${T.noNotifications}</div>`;
    return;
  }

  el.notificationsList.innerHTML = items.map((item) => {
    const title = item.title || item.Title || T.none;
    const message = item.message || item.Message || "";
    const type = item.type || item.Type || "System";
    const isRead = item.isRead ?? item.IsRead;
    return `
      <div class="alert-item">
        <div class="alert-icon">${isRead ? "✓" : "!"}</div>
        <div class="alert-copy">
          <h4>${escapeHtml(title)}</h4>
          <p>${escapeHtml(message)}</p>
          <p style="margin-top:6px;"><strong>${escapeHtml(type)}</strong> • ${escapeHtml(formatDate(item.createdAt || item.CreatedAt))}</p>
        </div>
      </div>
    `;
  }).join("");
}

function renderSecurity() {
  const user = state.user;
  const kycStatus = state.kycStatus?.status || state.kycStatus?.Status || "NotSubmitted";
  const phone = user?.phone || user?.Phone;

  const cards = [
    { icon: "✓", title: T.identityTitle, text: kycStatus === "Approved" ? T.identityApproved : `${T.identityStatusPrefix}${kycStatus}.` },
    { icon: "☎", title: T.phoneTitle, text: phone ? `${T.phoneBoundPrefix}${phone}${T.phoneBoundSuffix}` : T.phoneNotSet },
    { icon: "🔔", title: T.smsTitle, text: state.notifications.length ? T.smsOn : T.smsOff }
  ];

  el.securityList.innerHTML = cards.map((item) => `
    <div class="alert-item">
      <div class="alert-icon">${item.icon}</div>
      <div class="alert-copy">
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.text)}</p>
      </div>
    </div>
  `).join("");

  if (!state.transfers.length) {
    el.activityTimeline.innerHTML = `<div class="empty-state">${T.noActivity}</div>`;
    return;
  }

  el.activityTimeline.innerHTML = state.transfers.slice(0, 4).map((transfer) => {
    const account = transfer.toAccountNumber || transfer.ToAccountNumber || transfer.fromAccountNumber || transfer.FromAccountNumber || T.account;
    return `
      <div class="timeline-item">
        <div class="timeline-icon">↔</div>
        <div class="timeline-copy">
          <h4>${escapeHtml(transfer.description || transfer.Description || T.transfer)}</h4>
          <p>${escapeHtml(account)} • ${escapeHtml(formatDate(transfer.createdAt || transfer.CreatedAt))}</p>
        </div>
      </div>
    `;
  }).join("");
}

function renderDocuments() {
  const user = state.user;
  const profile = state.kycProfile;
  const kycStatus = state.kycStatus?.status || state.kycStatus?.Status || "NotSubmitted";
  const docs = [
    { icon: "ID", title: T.passport, text: user?.passportNumber || user?.PassportNumber || T.notSpecified },
    { icon: "K", title: T.kycStatus, text: kycStatus },
    { icon: "A", title: T.address, text: profile?.address || profile?.Address || user?.address || user?.Address || T.notSpecified }
  ];

  if (profile?.submittedAt || profile?.SubmittedAt) {
    docs.push({ icon: "D", title: T.sentForReview, text: formatDate(profile.submittedAt || profile.SubmittedAt) });
  }

  el.documentsList.innerHTML = docs.map((item) => `
    <div class="doc-item">
      <div class="doc-icon">${item.icon}</div>
      <div class="doc-copy">
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.text)}</p>
      </div>
    </div>
  `).join("");
}

function renderSummary() {
  const balance = state.accounts.reduce((sum, account) => sum + Number(account.balance ?? account.Balance ?? 0), 0);
  const kycStatus = state.kycStatus?.status || state.kycStatus?.Status || "NotSubmitted";
  const user = state.user;

  el.summaryBalance.textContent = formatMoney(balance, "TJS");
  el.summaryAccounts.textContent = String(state.accounts.length);
  el.summaryCards.textContent = String(state.cards.length);
  el.summaryPhone.textContent = user?.phone || user?.Phone || "-";
  el.summaryEmail.textContent = user?.email || user?.Email || "-";
  el.summaryKyc.textContent = kycStatus;

  if (!state.transfers.length) {
    el.recentTransfers.innerHTML = `<div class="empty-state">${T.noRecentTransfers}</div>`;
    return;
  }

  el.recentTransfers.innerHTML = state.transfers.slice(0, 4).map((transfer) => {
    const amount = Number(transfer.amount ?? transfer.Amount ?? 0);
    const currency = transfer.currency || transfer.Currency || "TJS";
    return `
      <div class="timeline-item">
        <div class="timeline-icon">${amount >= 0 ? "+" : "-"}</div>
        <div class="timeline-copy">
          <h4>${escapeHtml(transfer.description || transfer.Description || T.transfer)}</h4>
          <p>${escapeHtml(formatMoney(Math.abs(amount), currency))} • ${escapeHtml(formatDate(transfer.createdAt || transfer.CreatedAt))}</p>
        </div>
      </div>
    `;
  }).join("");
}

function unwrapSettled(result) {
  if (result.status !== "fulfilled") return null;
  const payload = unwrapResponse(result.value);
  return payload?.data ?? result.value?.data ?? result.value?.Data ?? result.value;
}

async function loadData() {
  const session = getSession();
  const userId = session?.userId || session?.UserId;
  if (!userId) throw new Error(T.noSessionUser);

  const results = await Promise.allSettled([
    apiRequest("/api/user/me", { auth: true }),
    apiRequest("/api/accounts/my?page=1&pageSize=50", { auth: true }),
    apiRequest("/api/cards/my?page=1&pageSize=50", { auth: true }),
    apiRequest("/api/notifications/my?page=1&pageSize=20", { auth: true }),
    apiRequest("/api/transfers/my?page=1&pageSize=10", { auth: true }),
    apiRequest("/api/kyc/my-status", { auth: true }),
    apiRequest("/api/kyc/my-profile", { auth: true })
  ]);

  state.user = unwrapSettled(results[0]);
  state.accounts = results[1].status === "fulfilled" ? (results[1].value.items || results[1].value.Items || []) : [];
  state.cards = results[2].status === "fulfilled" ? (results[2].value.items || results[2].value.Items || []) : [];
  state.notifications = results[3].status === "fulfilled" ? (results[3].value.items || results[3].value.Items || []) : [];
  state.transfers = results[4].status === "fulfilled" ? (results[4].value.items || results[4].value.Items || []) : [];
  state.kycStatus = unwrapSettled(results[5]);
  state.kycProfile = unwrapSettled(results[6]);
}

async function refreshPage() {
  await loadData();
  fillProfile();
  renderNotifications();
  renderSecurity();
  renderDocuments();
  renderSummary();
}

async function saveProfile(event) {
  event.preventDefault();
  if (!state.user) {
    showToast(T.profileNotLoaded);
    return;
  }

  const id = state.user.id || state.user.Id;
  const body = {
    id,
    firstName: el.profileForm.firstName.value.trim(),
    lastName: el.profileForm.lastName.value.trim(),
    phone: el.profileForm.phone.value.trim(),
    address: el.profileForm.address.value.trim()
  };

  el.saveProfile.disabled = true;
  try {
    await apiRequest(`/api/user/${id}`, { method: "PUT", auth: true, body });
    showToast(T.profileUpdated);
    await refreshPage();
  } catch (error) {
    console.error(error);
    showToast(error.message || T.profileSaveError);
  } finally {
    el.saveProfile.disabled = false;
  }
}

async function readAllNotifications() {
  try {
    await apiRequest("/api/notifications/read-all", { method: "PATCH", auth: true });
    await refreshPage();
    showToast(T.notificationsRead);
  } catch (error) {
    console.error(error);
    showToast(error.message || T.notificationsReadError);
  }
}

function bindActions() {
  el.profileForm?.addEventListener("submit", saveProfile);
  el.refreshProfile?.addEventListener("click", async () => {
    try {
      await refreshPage();
      showToast(T.dataUpdated);
    } catch (error) {
      console.error(error);
      showToast(error.message || T.dataUpdateError);
    }
  });
  el.markAllNotifications?.addEventListener("click", readAllNotifications);
}

async function init() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  bindTabs();
  bindActions();

  try {
    await refreshPage();
  } catch (error) {
    console.error(error);
    showToast(error.message || T.settingsLoadError);
  }
}

document.addEventListener("DOMContentLoaded", init);
