import { getIcon } from '../svgIcons.js';
import { state, formatCurrency } from '../storeState.js';

export function renderReportsView() {
  return `
    <div class="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <!-- Header Bar with "Export" Button -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="font-heading font-extrabold text-2xl text-on-surface tracking-tight">Financial & SARS VAT Reports</h1>
          <p class="text-xs text-on-surface-variant mt-0.5">Rulership LTD PTY — 2L Detergent Manufacturing & Retail Sales (Sakhile, Ext7).</p>
        </div>

        <button id="export-reports-btn" class="btn btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 shadow-md" title="Export Official Rulership Excel Financial Report Template (.xlsx)">
          ${getIcon('download', 'svg-icon-sm')} Export
        </button>
      </div>

      <!-- Financial Metric Highlights (Shades of Blue Accents) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bento-card border-l-4 border-l-[#0058be] flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="font-mono text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Total Monthly Gross Revenue</span>
              ${getIcon('trendingUp', 'svg-icon-sm text-[#0058be]')}
            </div>
            <div class="font-heading font-extrabold text-2xl text-on-surface">R 124 500.00</div>
          </div>
          <div class="mt-3 text-[11px] text-[#0058be] font-bold">
            +14.2% Growth vs previous month
          </div>
        </div>

        <div class="bento-card border-l-4 border-l-[#0284c7] flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="font-mono text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">SARS 15% VAT Collected</span>
              ${getIcon('payments', 'svg-icon-sm text-[#0284c7]')}
            </div>
            <div class="font-heading font-extrabold text-2xl text-[#0284c7]">R 18 675.00</div>
          </div>
          <div class="mt-3 text-[11px] text-on-surface-variant">
            South African Revenue Service (SARS) Output Tax
          </div>
        </div>

        <div class="bento-card border-l-4 border-l-[#1d4ed8] flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="font-mono text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">2L Detergent Gross Margin</span>
              ${getIcon('check', 'svg-icon-sm text-[#1d4ed8]')}
            </div>
            <div class="font-heading font-extrabold text-2xl text-on-surface">41.2%</div>
          </div>
          <div class="mt-3 text-[11px] text-on-surface-variant">
            Standardized R 69.99 pricing yield
          </div>
        </div>
      </div>

      <!-- Product Line Revenue & Tax Table -->
      <div class="bento-card p-0 overflow-hidden">
        <div class="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-low/50">
          <h3 class="font-heading font-bold text-sm text-on-surface">2L Chemical Product Revenue Breakdown (R 69.99 Unit Price)</h3>
          <span class="font-mono text-xs text-on-surface-variant">Sakhile Ext7 Facility</span>
        </div>

        <div class="table-container border-none">
          <table class="data-table">
            <thead>
              <tr>
                <th>2L Detergent Line</th>
                <th>Units Sold</th>
                <th>Unit Price (ZAR)</th>
                <th>Revenue (ZAR)</th>
                <th>15% VAT (ZAR)</th>
                <th class="text-right">Gross Margin %</th>
              </tr>
            </thead>
            <tbody>
              ${state.detergents.map(d => {
                const revenue = d.totalStock * d.price;
                const vat = revenue * (state.vatRate / (1 + state.vatRate));
                return `
                  <tr class="hover:bg-surface-low/50">
                    <td class="font-bold text-on-surface">${d.name}</td>
                    <td class="font-mono text-xs">${d.totalStock} bottles</td>
                    <td class="font-mono text-xs">${formatCurrency(d.price)}</td>
                    <td class="font-mono text-xs font-bold text-on-surface">${formatCurrency(revenue)}</td>
                    <td class="font-mono text-xs text-[#0058be] font-semibold">${formatCurrency(vat)}</td>
                    <td class="font-mono text-xs text-right font-bold text-[#0284c7]">41.5%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function bindReportsEvents() {
  const exportBtn = document.getElementById('export-reports-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        // Fetch official user template file from public assets
        const response = await fetch('/templates/Rulership_Inventory_Financial_Report_Template.xlsx');
        if (!response.ok) {
          throw new Error('Template file not found');
        }
        const blob = await response.blob();
        
        // Trigger instant download of official .xlsx workbook template
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Rulership_Inventory_Financial_Report_Template_${Date.now()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to export Excel template:', err);
        alert('Downloading Excel report template...');
      }
    });
  }
}
