import { state, subscribe, openModal, setActiveTab } from './storeState.js';
import { renderHeader, bindHeaderEvents } from './components/header.js';
import { renderSidebar, bindSidebarEvents } from './components/sidebar.js';
import { renderModal, bindModalEvents } from './components/modal.js';
import { renderDashboardView, bindDashboardEvents } from './views/dashboardView.js';
import { renderPosView, bindPosEvents } from './views/posView.js';
import { renderInventoryView, bindInventoryEvents } from './views/inventoryView.js';
import { renderBranchesView, bindBranchesEvents } from './views/branchesView.js';
import { renderReportsView, bindReportsEvents } from './views/reportsView.js';
import { renderProfileView } from './views/profileView.js';
import { renderStaffView, bindStaffEvents } from './views/staffView.js';
import { renderSettingsView } from './views/settingsView.js';

function renderApp() {
  const appContainer = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');

  if (!appContainer) return;

  // Render View Content based on state.activeTab
  let viewHtml = '';
  switch (state.activeTab) {
    case 'dashboard':
      viewHtml = renderDashboardView();
      break;
    case 'pos':
      viewHtml = renderPosView();
      break;
    case 'inventory':
      viewHtml = renderInventoryView();
      break;
    case 'branches':
      viewHtml = renderBranchesView();
      break;
    case 'reports':
      viewHtml = renderReportsView();
      break;
    case 'staff':
      viewHtml = renderStaffView();
      break;
    case 'profile':
      viewHtml = renderProfileView();
      break;
    case 'settings':
      viewHtml = renderSettingsView();
      break;
    default:
      viewHtml = renderDashboardView();
  }

  // Combine Layout
  appContainer.innerHTML = `
    <div class="flex flex-col w-full h-full">
      ${renderHeader()}
      <div class="flex flex-1 overflow-hidden">
        ${renderSidebar()}
        <main class="flex-1 flex flex-col overflow-hidden relative">
          ${viewHtml}
        </main>
      </div>
    </div>
  `;

  // Render Modal Overlay
  if (modalRoot) {
    modalRoot.innerHTML = renderModal();
  }

  // Bind Events
  bindHeaderEvents();
  bindSidebarEvents();
  bindModalEvents();

  if (state.activeTab === 'dashboard') bindDashboardEvents();
  if (state.activeTab === 'pos') bindPosEvents();
  if (state.activeTab === 'inventory') bindInventoryEvents();
  if (state.activeTab === 'branches') bindBranchesEvents();
  if (state.activeTab === 'reports') bindReportsEvents();
  if (state.activeTab === 'staff') bindStaffEvents();
}

// Global Keyboard Shortcuts (F1 for POS Search, F12 for Pay Checkout)
window.addEventListener('keydown', (e) => {
  if (e.key === 'F1') {
    e.preventDefault();
    setActiveTab('pos');
    setTimeout(() => {
      const input = document.getElementById('pos-search-input');
      if (input) input.focus();
    }, 100);
  }
  if (e.key === 'F12') {
    e.preventDefault();
    if (state.cart.length > 0) {
      openModal('pay');
    }
  }
});

// Initial Setup & Subscribe
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.className = state.themeMode;
  renderApp();
  subscribe(renderApp);
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  document.documentElement.className = state.themeMode;
  renderApp();
  subscribe(renderApp);
}
