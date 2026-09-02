import { getIcon } from '../svgIcons.js';
import { state, formatCurrency } from '../storeState.js';

export function renderBranchesView() {
  return `
    <div class="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <div class="flex justify-between items-center border-b border-outline-variant pb-4">
        <div>
          <span class="badge badge-primary text-[10px] mb-1">Rulership LTD PTY</span>
          <h1 class="font-heading font-extrabold text-2xl text-on-surface tracking-tight">Facility & Branch Overview</h1>
          <p class="text-xs text-on-surface-variant mt-0.5">Primary chemical manufacturing plant & retail facility metrics in ZAR.</p>
        </div>
        <span class="badge badge-success text-xs font-mono">1 Active Main Facility</span>
      </div>

      <!-- Single Primary Branch Card Grid -->
      <div class="max-w-xl">
        <div class="bento-card border-2 border-primary bg-primary-container/10 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start mb-3">
              <div>
                <span class="badge badge-success text-[10px] mb-1">Main Facility Operational</span>
                <h3 class="font-heading font-extrabold text-xl text-on-surface">Sakhile, Ext7</h3>
                <p class="font-mono text-[10px] text-on-surface-variant">Facility ID: #SKH-EXT7-ZA</p>
              </div>
              <div class="p-2.5 rounded bg-primary-container text-primary">
                ${getIcon('store', 'svg-icon-lg')}
              </div>
            </div>

            <div class="space-y-2.5 text-xs border-t border-b border-outline-variant/60 py-3 my-3">
              <div class="flex justify-between">
                <span class="text-on-surface-variant">Facility & Managing Director:</span>
                <span class="font-bold text-on-surface">${state.userProfile.name}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-on-surface-variant">Today's Revenue (ZAR):</span>
                <span class="font-mono font-bold text-primary text-sm">${formatCurrency(124500)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-on-surface-variant">Active POS Terminals:</span>
                <span class="font-mono text-on-surface font-bold">5/5 Active Registers</span>
              </div>
              <div class="flex justify-between">
                <span class="text-on-surface-variant">Detergent Stock Health:</span>
                <span class="font-mono font-bold text-secondary">96% Optimal</span>
              </div>
              <div class="flex justify-between">
                <span class="text-on-surface-variant">Physical Location:</span>
                <span class="font-medium text-on-surface-variant">Stand 4092, Main Road, Sakhile, Ext7</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 mt-2">
            <button class="w-full btn btn-secondary text-xs py-2.5 font-bold cursor-default">
              ${getIcon('check', 'svg-icon-sm')} Current Active Branch (Sakhile Ext7)
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindBranchesEvents() {}
