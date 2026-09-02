import { getIcon } from '../svgIcons.js';
import { state } from '../storeState.js';

export function renderSettingsView() {
  return `
    <div class="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <!-- Title -->
      <div class="flex justify-between items-center border-b border-outline-variant pb-4">
        <div>
          <h1 class="font-heading font-extrabold text-2xl text-on-surface tracking-tight">System Settings & Configuration</h1>
          <p class="text-xs text-on-surface-variant mt-0.5">Configure business tax rules, terminal preferences, and store details for Rulership LTD PTY.</p>
        </div>
        <button class="btn btn-primary text-xs py-2">Save Settings</button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Business Info Section -->
        <div class="bento-card space-y-4">
          <h3 class="font-heading font-bold text-base text-on-surface border-b border-outline-variant pb-2">
            Company & Tax Registration Details
          </h3>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-on-surface mb-1">Company Legal Name</label>
              <input type="text" value="Rulership LTD PTY" class="w-full p-2 bg-surface-low border border-outline-variant rounded font-bold" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-on-surface mb-1">Company Reg #</label>
                <input type="text" value="2024/991823/07" class="w-full p-2 bg-surface-low border border-outline-variant rounded font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-on-surface mb-1">VAT Reg #</label>
                <input type="text" value="ZA4901928374" class="w-full p-2 bg-surface-low border border-outline-variant rounded font-mono" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-on-surface mb-1">Primary Facility Address</label>
              <input type="text" value="Stand 4092, Main Road, Sakhile, Ext7, Standerton, 2431" class="w-full p-2 bg-surface-low border border-outline-variant rounded" />
            </div>
          </div>
        </div>

        <!-- Tax & Terminal Preferences -->
        <div class="bento-card space-y-4">
          <h3 class="font-heading font-bold text-base text-on-surface border-b border-outline-variant pb-2">
            POS Tax & Receipt Printing Rules
          </h3>

          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-on-surface mb-1">Standard VAT Rate (%)</label>
                <input type="number" step="1" value="15" class="w-full p-2 bg-surface-low border border-outline-variant rounded font-mono font-bold" />
              </div>
              <div>
                <label class="block font-semibold text-on-surface mb-1">Currency Code</label>
                <input type="text" value="ZAR (R)" readonly class="w-full p-2 bg-surface-low border border-outline-variant rounded font-mono font-bold text-primary" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-on-surface mb-1">Receipt Footer Message</label>
              <input type="text" value="Thank you for choosing Rulership Chemical Works! Cleanliness Delivered." class="w-full p-2 bg-surface-low border border-outline-variant rounded" />
            </div>

            <div class="p-3 bg-surface-low rounded border border-outline-variant space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-on-surface">Auto-Print Sales Receipt on Pay</span>
                <input type="checkbox" checked class="rounded border-outline-variant text-primary" />
              </div>
              <div class="flex justify-between items-center">
                <span class="font-semibold text-on-surface">Require Manager Override for Voids</span>
                <input type="checkbox" checked class="rounded border-outline-variant text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
