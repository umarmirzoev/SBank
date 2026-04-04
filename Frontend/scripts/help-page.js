import { apiRequest, formatDate, getSession, isAuthenticated, showToast, unwrapResponse } from "./common.js";

const T = {
  user: "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c",
  noTickets: "\u0423 \u0432\u0430\u0441 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u043e\u0431\u0440\u0430\u0449\u0435\u043d\u0438\u0439. \u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u043f\u0435\u0440\u0432\u044b\u0439 \u0442\u0438\u043a\u0435\u0442 \u0447\u0435\u0440\u0435\u0437 \u0444\u043e\u0440\u043c\u0443 \u0441\u043f\u0440\u0430\u0432\u0430.",
  selectTicket: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0438\u043a\u0435\u0442",
  selectTicketHint: "\u0421\u043f\u0440\u0430\u0432\u0430 \u0431\u0443\u0434\u0435\u0442 \u0440\u0435\u0430\u043b\u044c\u043d\u0430\u044f \u043f\u0435\u0440\u0435\u043f\u0438\u0441\u043a\u0430 \u0441 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u043e\u0439.",
  noMessages: "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439 \u0432 \u044d\u0442\u043e\u043c \u0442\u0438\u043a\u0435\u0442\u0435 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.",
  me: "\u0412\u044b",
  support: "\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430",
  openTicketSuccess: "\u0422\u0438\u043a\u0435\u0442 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0437\u0434\u0430\u043d",
  openTicketError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0437\u0434\u0430\u0442\u044c \u0442\u0438\u043a\u0435\u0442",
  sendMessageSuccess: "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e",
  sendMessageError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435",
  loadHelpError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0440\u0430\u0437\u0434\u0435\u043b \u043f\u043e\u043c\u043e\u0449\u0438",
  searchPlaceholder: "\u041d\u0435\u0442 \u0441\u043e\u0432\u043f\u0430\u0434\u0435\u043d\u0438\u0439 \u043f\u043e \u043f\u043e\u0438\u0441\u043a\u0443.",
  faq1q: "\u041a\u0430\u043a \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043f\u0435\u0440\u0435\u0432\u043e\u0434 \u043f\u043e \u043d\u043e\u043c\u0435\u0440\u0443 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430?",
  faq1a: "\u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u0440\u0430\u0437\u0434\u0435\u043b \u043f\u0435\u0440\u0435\u0432\u043e\u0434\u043e\u0432, \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u0430\u0440\u0438\u0430\u043d\u0442 \u043f\u043e \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0443 \u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 +992 \u0438 9 \u0446\u0438\u0444\u0440.",
  faq2q: "\u0413\u0434\u0435 \u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0438\u0441\u0442\u043e\u0440\u0438\u044e \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u0439?",
  faq2a: "\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044f \u0438\u0437 \u0440\u0435\u0430\u043b\u044c\u043d\u044b\u0445 \u043f\u0435\u0440\u0435\u0432\u043e\u0434\u043e\u0432 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u0418\u0441\u0442\u043e\u0440\u0438\u044f.",
  faq3q: "\u041a\u0430\u043a \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0441\u0432\u043e\u0438 \u0434\u0430\u043d\u043d\u044b\u0435?",
  faq3a: "\u0412 \u0440\u0430\u0437\u0434\u0435\u043b\u0435 \u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u043c\u043e\u0436\u043d\u043e \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0442\u0435\u043b\u0435\u0444\u043e\u043d, \u0438\u043c\u044f, \u0444\u0430\u043c\u0438\u043b\u0438\u044e \u0438 \u0430\u0434\u0440\u0435\u0441.",
  faq4q: "\u041a\u0430\u043a \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u043d\u043e\u0432\u043e\u0435 \u043e\u0431\u0440\u0430\u0449\u0435\u043d\u0438\u0435?",
  faq4a: "\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u0444\u043e\u0440\u043c\u0443 \u0441\u043f\u0440\u0430\u0432\u0430, \u0438 \u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u0441\u043e\u0437\u0434\u0430\u0441\u0442 \u0440\u0435\u0430\u043b\u044c\u043d\u044b\u0439 support ticket \u0432 backend."
};

const state = { user: null, notifications: [], tickets: [], selectedTicketId: null, messages: new Map() };

const el = {
  headerAvatar: document.getElementById("headerAvatar"),
  headerName: document.getElementById("headerName"),
  notifCount: document.getElementById("notifCount"),
  ticketSearch: document.getElementById("ticketSearch"),
  openCount: document.getElementById("openCount"),
  ticketCount: document.getElementById("ticketCount"),
  messageCount: document.getElementById("messageCount"),
  ticketList: document.getElementById("ticketList"),
  conversationTitle: document.getElementById("conversationTitle"),
  conversationMeta: document.getElementById("conversationMeta"),
  conversationStatus: document.getElementById("conversationStatus"),
  messageList: document.getElementById("messageList"),
  messageForm: document.getElementById("messageForm"),
  messageText: document.getElementById("messageText"),
  ticketForm: document.getElementById("ticketForm"),
  subject: document.getElementById("subject"),
  category: document.getElementById("category"),
  priority: document.getElementById("priority"),
  description: document.getElementById("description"),
  summaryUser: document.getElementById("summaryUser"),
  summaryEmail: document.getElementById("summaryEmail"),
  summaryLastTicket: document.getElementById("summaryLastTicket"),
  summaryStatus: document.getElementById("summaryStatus"),
  faqList: document.getElementById("faqList")
};

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function initials(name) {
  return String(name || "SB").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "SB";
}

function unwrapSettled(result) {
  if (result.status !== "fulfilled") return null;
  const payload = unwrapResponse(result.value);
  return payload?.data ?? result.value?.data ?? result.value?.Data ?? result.value;
}

function statusClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("open")) return "open";
  if (normalized.includes("progress")) return "inprogress";
  if (normalized.includes("closed")) return "closed";
  return "open";
}

function priorityClass(priority) {
  const normalized = String(priority || "").toLowerCase();
  if (normalized.includes("high")) return "high";
  if (normalized.includes("medium")) return "medium";
  return "low";
}

function faqItems() {
  return [
    { q: T.faq1q, a: T.faq1a },
    { q: T.faq2q, a: T.faq2a },
    { q: T.faq3q, a: T.faq3a },
    { q: T.faq4q, a: T.faq4a }
  ];
}

function renderFaq() {
  el.faqList.innerHTML = faqItems().map((item) => `
    <div class="faq-item">
      <div class="ticket-title">${escapeHtml(item.q)}</div>
      <div class="ticket-meta" style="margin-top:8px;">${escapeHtml(item.a)}</div>
    </div>
  `).join("");
}

function renderUser() {
  const user = state.user;
  if (!user) return;
  const name = `${user.firstName || user.FirstName || ""} ${user.lastName || user.LastName || ""}`.trim() || T.user;
  const badge = initials(name);
  el.headerAvatar.textContent = badge;
  el.headerName.textContent = name;
  el.summaryUser.textContent = name;
  el.summaryEmail.textContent = user.email || user.Email || "-";
}

function renderStats() {
  const openTickets = state.tickets.filter((ticket) => !String(ticket.status || ticket.Status || "").toLowerCase().includes("closed"));
  const totalMessages = Array.from(state.messages.values()).reduce((sum, list) => sum + list.length, 0);
  el.openCount.textContent = String(openTickets.length);
  el.ticketCount.textContent = String(state.tickets.length);
  el.messageCount.textContent = String(totalMessages);
  const unread = state.notifications.filter((item) => !(item.isRead ?? item.IsRead)).length;
  el.notifCount.textContent = String(unread);
}

function filteredTickets() {
  const search = String(el.ticketSearch.value || "").trim().toLowerCase();
  if (!search) return state.tickets;
  return state.tickets.filter((ticket) => {
    const hay = [ticket.subject, ticket.Subject, ticket.category, ticket.Category, ticket.description, ticket.Description].join(" ").toLowerCase();
    return hay.includes(search);
  });
}

function renderTickets() {
  const items = filteredTickets();
  if (!items.length) {
    el.ticketList.innerHTML = `<div class="empty-state">${state.tickets.length ? T.searchPlaceholder : T.noTickets}</div>`;
    return;
  }

  el.ticketList.innerHTML = items.map((ticket) => {
    const id = ticket.id || ticket.Id;
    const isActive = state.selectedTicketId === id;
    const status = ticket.status || ticket.Status || "Open";
    const priority = ticket.priority || ticket.Priority || "Low";
    const cls = statusClass(status);
    const pcls = priorityClass(priority);
    return `
      <div class="ticket-item ${isActive ? "active" : ""}" data-ticket-id="${id}">
        <div class="ticket-head">
          <div class="ticket-title">${escapeHtml(ticket.subject || ticket.Subject || T.none)}</div>
          <div class="chip ${cls}">${escapeHtml(status)}</div>
        </div>
        <div class="ticket-meta">${escapeHtml(ticket.category || ticket.Category || "Support")} • ${escapeHtml(formatDate(ticket.updatedAt || ticket.UpdatedAt || ticket.createdAt || ticket.CreatedAt))}</div>
        <div class="ticket-meta" style="margin-top:8px;">${escapeHtml(ticket.description || ticket.Description || "")}</div>
        <div style="margin-top:10px;"><span class="chip ${pcls}">${escapeHtml(priority)}</span></div>
      </div>
    `;
  }).join("");

  el.ticketList.querySelectorAll("[data-ticket-id]").forEach((node) => {
    node.addEventListener("click", () => selectTicket(node.dataset.ticketId));
  });
}

async function loadMessages(ticketId) {
  if (state.messages.has(ticketId)) return;
  const payload = await apiRequest(`/api/support/tickets/${ticketId}/messages?page=1&pageSize=100`, { auth: true });
  state.messages.set(ticketId, payload.items || payload.Items || []);
}

function renderConversation() {
  const ticket = state.tickets.find((item) => String(item.id || item.Id) === String(state.selectedTicketId));
  if (!ticket) {
    el.conversationTitle.textContent = T.selectTicket;
    el.conversationMeta.textContent = T.selectTicketHint;
    el.conversationStatus.innerHTML = "";
    el.messageList.innerHTML = `<div class="empty-state">${T.noMessages}</div>`;
    el.messageForm.style.display = "none";
    el.summaryLastTicket.textContent = "-";
    el.summaryStatus.textContent = "-";
    return;
  }

  const status = ticket.status || ticket.Status || "Open";
  const messages = state.messages.get(String(ticket.id || ticket.Id)) || [];
  el.conversationTitle.textContent = ticket.subject || ticket.Subject || T.none;
  el.conversationMeta.textContent = `${ticket.category || ticket.Category || "Support"} • ${formatDate(ticket.updatedAt || ticket.UpdatedAt || ticket.createdAt || ticket.CreatedAt)}`;
  el.conversationStatus.innerHTML = `<span class="chip ${statusClass(status)}">${escapeHtml(status)}</span>`;
  el.summaryLastTicket.textContent = ticket.subject || ticket.Subject || T.none;
  el.summaryStatus.textContent = status;
  el.messageForm.style.display = String(status).toLowerCase().includes("closed") ? "none" : "flex";

  if (!messages.length) {
    el.messageList.innerHTML = `<div class="empty-state">${T.noMessages}</div>`;
    return;
  }

  el.messageList.innerHTML = messages.map((message) => {
    const isUser = Boolean(message.senderUserId || message.SenderUserId);
    return `
      <div class="message ${isUser ? "user" : ""}">
        <div class="message-meta">${isUser ? T.me : T.support} • ${escapeHtml(formatDate(message.sentAt || message.SentAt))}</div>
        <div>${escapeHtml(message.messageText || message.MessageText || "")}</div>
      </div>
    `;
  }).join("");
  el.messageList.scrollTop = el.messageList.scrollHeight;
}

async function selectTicket(ticketId) {
  state.selectedTicketId = ticketId;
  renderTickets();
  await loadMessages(ticketId);
  renderConversation();
  renderStats();
}

async function loadPageData() {
  const results = await Promise.allSettled([
    apiRequest("/api/user/me", { auth: true }),
    apiRequest("/api/notifications/my?page=1&pageSize=20", { auth: true }),
    apiRequest("/api/support/tickets/my?page=1&pageSize=50", { auth: true })
  ]);

  state.user = unwrapSettled(results[0]);
  state.notifications = results[1].status === "fulfilled" ? (results[1].value.items || results[1].value.Items || []) : [];
  state.tickets = results[2].status === "fulfilled" ? (results[2].value.items || results[2].value.Items || []) : [];
}

async function createTicket(event) {
  event.preventDefault();
  const body = {
    subject: el.subject.value.trim(),
    category: el.category.value,
    description: el.description.value.trim(),
    priority: el.priority.value
  };

  try {
    const response = await apiRequest("/api/support/tickets", { method: "POST", auth: true, body });
    const created = unwrapResponse(response).data ?? response.data ?? response.Data ?? response;
    state.tickets.unshift(created);
    state.messages.delete(String(created.id || created.Id));
    el.ticketForm.reset();
    el.category.value = "Support";
    el.priority.value = "Medium";
    renderTickets();
    await selectTicket(String(created.id || created.Id));
    renderStats();
    showToast(T.openTicketSuccess);
  } catch (error) {
    console.error(error);
    showToast(error.message || T.openTicketError);
  }
}

async function sendMessage(event) {
  event.preventDefault();
  if (!state.selectedTicketId) return;
  const text = el.messageText.value.trim();
  if (!text) return;

  try {
    const response = await apiRequest(`/api/support/tickets/${state.selectedTicketId}/messages`, {
      method: "POST",
      auth: true,
      body: { messageText: text }
    });
    const created = unwrapResponse(response).data ?? response.data ?? response.Data ?? response;
    const list = state.messages.get(String(state.selectedTicketId)) || [];
    list.push(created);
    state.messages.set(String(state.selectedTicketId), list);
    el.messageText.value = "";
    renderConversation();
    renderStats();
    showToast(T.sendMessageSuccess);
  } catch (error) {
    console.error(error);
    showToast(error.message || T.sendMessageError);
  }
}

function bindActions() {
  el.ticketSearch.addEventListener("input", renderTickets);
  el.ticketForm.addEventListener("submit", createTicket);
  el.messageForm.addEventListener("submit", sendMessage);
}

async function init() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  bindActions();
  renderFaq();

  try {
    await loadPageData();
    renderUser();
    renderStats();
    renderTickets();
    if (state.tickets.length) {
      await selectTicket(String(state.tickets[0].id || state.tickets[0].Id));
    } else {
      renderConversation();
    }
  } catch (error) {
    console.error(error);
    el.ticketList.innerHTML = `<div class="empty-state">${T.loadHelpError}</div>`;
    renderConversation();
    showToast(error.message || T.loadHelpError);
  }
}

document.addEventListener("DOMContentLoaded", init);
