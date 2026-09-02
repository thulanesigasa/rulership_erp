import { getIcon } from '../svgIcons.js';
import { state, setGlobalSearch, toggleTheme, setActiveTab } from '../storeState.js';

export function renderHeader() {
  return `
    <header class="app-header px-4 flex items-center justify-between z-30 shrink-0">
      <!-- Left Branding & Single Branch Indicator (Blue 'R' logo box removed per request) -->
      <div class="flex items-center gap-4 lg:gap-6">
        <button id="mobile-menu-btn" class="lg:hidden p-1.5 rounded hover:bg-surface-low text-on-surface-variant">
          ${getIcon('menu')}
        </button>

        <div class="flex flex-col cursor-pointer" id="header-logo-btn">
          <span class="font-heading font-extrabold text-lg text-primary leading-tight tracking-tight">RULERSHIP</span>
          <span class="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase font-bold">LTD PTY</span>
        </div>

        <div class="h-5 w-px bg-outline-variant hidden sm:block"></div>

        <!-- Single Facility / Branch Indicator Badge -->
        <div class="flex items-center gap-2 bg-surface-low px-3 py-1 rounded border border-outline-variant">
          ${getIcon('store', 'svg-icon-sm text-primary')}
          <span class="text-xs font-bold text-on-surface">${state.activeBranch}</span>
        </div>
      </div>

      <!-- Right Action Tools & Top-Right Profile Trigger -->
      <div class="flex items-center gap-3">
        <!-- Global Search Input -->
        <div class="relative hidden md:block">
          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline svg-icon-sm">
            ${getIcon('search')}
          </span>
          <input 
            id="global-search-input"
            type="text"
            placeholder="Search SKU, detergent, PO..."
            value="${state.globalSearch}"
            class="w-56 lg:w-72 h-8 pl-8 pr-3 bg-surface-low border border-outline-variant rounded text-xs font-body focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <!-- Theme Switcher -->
        <button id="theme-toggle-btn" class="p-1.5 rounded hover:bg-surface-low text-on-surface-variant transition-colors" title="Toggle Light/Dark Theme">
          ${getIcon(state.themeMode === 'light' ? 'moon' : 'sun', 'svg-icon-sm')}
        </button>

        <!-- Notification Bell -->
        <div class="relative">
          <button id="notification-btn" class="p-1.5 rounded hover:bg-surface-low text-on-surface-variant transition-colors relative" title="Notifications">
            ${getIcon('notification', 'svg-icon-sm')}
            <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-error"></span>
          </button>
        </div>

        <div class="h-5 w-px bg-outline-variant hidden sm:block"></div>

        <!-- Top-Right User Profile Avatar & Name Trigger -->
        <div id="header-profile-btn" class="flex items-center gap-2 cursor-pointer hover:opacity-90 p-1 rounded hover:bg-surface-low transition-colors" title="View Account Profile">
          <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-heading font-extrabold text-xs flex items-center justify-center border border-primary/30">
            NM
          </div>
          <div class="hidden xl:flex flex-col text-left">
            <span class="text-xs font-bold text-on-surface leading-tight">${state.userProfile.name}</span>
            <span class="text-[10px] text-primary font-semibold font-mono">Managing Director</span>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function bindHeaderEvents() {
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      setGlobalSearch(e.target.value);
    });
  }

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      toggleTheme();
    });
  }

  const logoBtn = document.getElementById('header-logo-btn');
  if (logoBtn) {
    logoBtn.addEventListener('click', () => {
      setActiveTab('dashboard');
    });
  }

  const profileBtn = document.getElementById('header-profile-btn');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      setActiveTab('profile');
    });
  }
}
