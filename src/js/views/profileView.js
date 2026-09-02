import { getIcon } from '../svgIcons.js';
import { state } from '../storeState.js';

export function renderProfileView() {
  const p = state.userProfile;

  return `
    <div class="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <!-- Title Bar -->
      <div class="flex justify-between items-center border-b border-outline-variant pb-4">
        <div>
          <span class="badge badge-primary text-[10px] mb-1">Director & Manager Account</span>
          <h1 class="font-heading font-extrabold text-2xl text-on-surface tracking-tight">User Account & Profile</h1>
          <p class="text-xs text-on-surface-variant mt-0.5">Manage administrative credentials, branch authorization, and security logs.</p>
        </div>
        <span class="badge badge-success text-xs">Master Access Granted</span>
      </div>

      <!-- Profile Overview Card Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Identity Card -->
        <div class="bento-card flex flex-col items-center text-center gap-4">
          <div class="w-24 h-24 rounded-full bg-primary-container text-on-primary-container font-heading font-extrabold text-3xl flex items-center justify-center border-4 border-primary/20">
            JS
          </div>
          <div>
            <h2 class="font-heading font-bold text-xl text-on-surface">${p.name}</h2>
            <p class="text-xs font-semibold text-primary mt-0.5">${p.role}</p>
            <p class="font-mono text-[11px] text-on-surface-variant mt-1">${p.companyName || 'Rulership LTD PTY'}</p>
          </div>

          <div class="w-full border-t border-outline-variant/60 pt-4 text-xs space-y-2 text-left">
            <div class="flex justify-between">
              <span class="text-on-surface-variant">Primary Branch:</span>
              <span class="font-bold text-on-surface">${p.branch}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-on-surface-variant">Company Reg #:</span>
              <span class="font-mono font-semibold text-on-surface">${p.regNumber}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-on-surface-variant">VAT Reg #:</span>
              <span class="font-mono font-semibold text-on-surface">${p.vatNumber}</span>
            </div>
          </div>
        </div>

        <!-- Account Contact & Address Details (Span 2) -->
        <div class="lg:col-span-2 bento-card flex flex-col justify-between">
          <div class="space-y-4">
            <h3 class="font-heading font-bold text-base text-on-surface border-b border-outline-variant pb-2">
              Contact & Business Location Information
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div class="p-3 bg-surface-low rounded border border-outline-variant">
                <span class="text-[10px] text-on-surface-variant font-mono uppercase block">Email Address</span>
                <span class="font-bold text-on-surface">${p.email}</span>
              </div>
              <div class="p-3 bg-surface-low rounded border border-outline-variant">
                <span class="text-[10px] text-on-surface-variant font-mono uppercase block">Direct Phone</span>
                <span class="font-mono font-bold text-on-surface">${p.phone}</span>
              </div>
            </div>

            <div>
              <span class="text-[10px] text-on-surface-variant font-mono uppercase block mb-1">Registered Chemical Works & Facility Address</span>
              <div class="p-3 bg-surface-low rounded border border-outline-variant text-xs font-semibold text-on-surface">
                ${p.address}
              </div>
            </div>

            <!-- Security & System Privileges -->
            <div class="border-t border-outline-variant pt-4 space-y-3">
              <h4 class="font-heading font-bold text-xs text-on-surface">System Privileges & Security Role</h4>
              <div class="flex flex-wrap gap-2">
                <span class="badge badge-primary">Full POS Terminal Control</span>
                <span class="badge badge-primary">Roster Shift Editor</span>
                <span class="badge badge-primary">Inventory Stock Override</span>
                <span class="badge badge-primary">Financial & Excel Export Access</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-outline-variant mt-4">
            <button class="btn btn-outline text-xs py-2">Edit Account Details</button>
            <button class="btn btn-primary text-xs py-2">Update Password & Security</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
