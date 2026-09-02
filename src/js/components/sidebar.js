import { getIcon } from '../svgIcons.js';
import { state, setActiveTab } from '../storeState.js';

export function renderSidebar() {
  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: 'analytics' },
    { id: 'pos', label: 'POS Terminal (F1)', icon: 'cart', badge: 'FAST' },
    { id: 'inventory', label: 'Inventory Catalog', icon: 'inventory' },
    { id: 'branches', label: 'Branch Overview', icon: 'store' },
    { id: 'reports', label: 'Reports', icon: 'download' },
    { id: 'staff', label: 'Staff Roster', icon: 'badge' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  const itemsHtml = navItems.map(item => {
    const isActive = state.activeTab === item.id;
    return `
      <a 
        href="#" 
        data-tab="${item.id}"
        class="nav-item ${isActive ? 'active' : ''}"
      >
        ${getIcon(item.icon, isActive ? 'text-primary' : '')}
        <span class="text-xs flex-1">${item.label}</span>
        ${item.badge ? `<span class="badge badge-primary text-[10px]">${item.badge}</span>` : ''}
      </a>
    `;
  }).join('');

  return `
    <aside class="app-sidebar flex flex-col h-[calc(100vh-3.5rem)] shrink-0 z-20">
      <!-- Active Branch Info Header -->
      <div id="sidebar-branch-info" class="p-4 border-b border-outline-variant bg-surface-lowest flex items-center gap-3">
        <div class="w-9 h-9 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-mono font-bold text-xs shrink-0">
          ZA
        </div>
        <div class="overflow-hidden">
          <h2 class="font-heading font-bold text-xs text-on-surface truncate">${state.activeBranch}</h2>
          <p class="font-mono text-[10px] text-on-surface-variant truncate">ID: #SKH-EXT7-ZA • Active Facility</p>
        </div>
      </div>

      <!-- Navigation List (Account Profile removed from sidebar per request) -->
      <nav class="flex-1 overflow-y-auto py-3">
        ${itemsHtml}
      </nav>

      <!-- Quick Action CTA -->
      <div class="p-3 border-t border-outline-variant bg-surface-lowest">
        <button id="sidebar-new-sale-btn" class="w-full btn btn-primary text-xs py-2.5 flex items-center justify-center gap-2">
          ${getIcon('cart', 'svg-icon-sm')}
          New Sale (F1)
        </button>
      </div>

      <!-- System Info Footer -->
      <div class="p-3 border-t border-outline-variant flex justify-between items-center text-[11px] text-on-surface-variant font-mono">
        <span>Rulership v2.4.0</span>
        <span class="flex items-center gap-1 text-secondary font-bold">
          ${getIcon('check', 'svg-icon-sm text-secondary')} Online
        </span>
      </div>
    </aside>
  `;
}

export function bindSidebarEvents() {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = el.getAttribute('data-tab');
      if (tab) {
        setActiveTab(tab);
      }
    });
  });

  const newSaleBtn = document.getElementById('sidebar-new-sale-btn');
  if (newSaleBtn) {
    newSaleBtn.addEventListener('click', () => {
      setActiveTab('pos');
    });
  }
}
