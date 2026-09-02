import { getIcon } from '../svgIcons.js';
import { state, formatCurrency, setActiveTab, setChartTimeframe } from '../storeState.js';

export function renderDashboardView() {
  const isDaily = state.chartTimeframe === 'daily';
  const isWeekly = state.chartTimeframe === 'weekly';
  const isMonthly = state.chartTimeframe === 'monthly';

  // Dynamic Chart X-Axis Labels & Title based on Timeframe
  let xAxisLabels = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'];
  let subTitle = 'Hourly 2L detergent demand trends at Sakhile Ext7';

  if (isWeekly) {
    xAxisLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    subTitle = 'Daily 2L detergent sales volume for the current week';
  } else if (isMonthly) {
    xAxisLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    subTitle = 'Weekly manufacturing & dispatch volume for current month';
  }

  // Dynamic SVG Paths for different timeframes using DIFFERENT SHADES OF BLUE
  // Line 1: Royal Blue (#0058be)
  // Line 2: Bright Sky Blue (#0284c7)
  // Line 3: Cobalt Navy Blue (#1d4ed8)
  let path1 = "M0,150 C60,130 120,90 180,75 C240,90 300,95 360,70 C420,45 480,35 540,30 C600,25 660,20 700,15";
  let path2 = "M0,170 C60,155 120,130 180,110 C240,100 300,85 360,75 C420,75 480,70 540,60 C600,50 660,40 700,30";
  let path3 = "M0,190 C60,180 120,165 180,150 C240,140 300,130 360,120 C420,120 480,115 540,105 C600,95 660,85 700,75";

  if (isWeekly) {
    path1 = "M0,160 C100,110 200,140 300,60 C400,90 500,40 600,30 L700,20";
    path2 = "M0,180 C100,140 200,150 300,90 C400,110 500,60 600,45 L700,35";
    path3 = "M0,195 C100,170 200,175 300,130 C400,140 500,100 600,80 L700,65";
  } else if (isMonthly) {
    path1 = "M0,170 Q175,100 350,60 T700,18";
    path2 = "M0,185 Q175,130 350,90 T700,38";
    path3 = "M0,198 Q175,155 350,120 T700,70";
  }

  const xAxisHtml = xAxisLabels.map(lbl => `<span class="font-mono text-[10px] text-on-surface-variant">${lbl}</span>`).join('');

  return `
    <div class="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <!-- Title & Main Context -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span class="badge badge-primary text-[10px] uppercase font-bold tracking-wider mb-1">Rulership LTD PTY • Sakhile, Ext7</span>
          <h1 class="font-heading font-extrabold text-2xl text-on-surface tracking-tight">Executive Dashboard</h1>
          <p class="text-xs text-on-surface-variant mt-0.5">Real-time chemical manufacturing metrics, POS retail throughput, and inventory status.</p>
        </div>

        <div class="flex items-center gap-2">
          <button id="dash-pos-btn" class="btn btn-secondary text-xs py-2 flex items-center gap-2">
            ${getIcon('cart', 'svg-icon-sm')} Open POS Terminal
          </button>
          <button id="dash-inv-btn" class="btn btn-outline text-xs py-2 flex items-center gap-2">
            ${getIcon('inventory', 'svg-icon-sm')} View Detergent Stock
          </button>
        </div>
      </div>

      <!-- Key Financial & Operational Metric Cards (Shades of Blue Accents) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Metric 1: Monthly Gross Revenue -->
        <div class="bento-card border-l-4 border-l-[#0058be] flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="font-mono text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Gross Sales (Monthly)</span>
              ${getIcon('trendingUp', 'svg-icon-sm text-[#0058be]')}
            </div>
            <div class="font-heading font-extrabold text-2xl text-on-surface">R 124 500.00</div>
          </div>
          <div class="mt-4 flex items-center justify-between text-xs">
            <span class="text-[#0058be] font-bold text-[11px]">+14.2% vs last month</span>
            <span class="text-[10px] text-on-surface-variant font-mono">ZAR (15% VAT)</span>
          </div>
        </div>

        <!-- Metric 2: Primary 2L Units Bottled & Sold -->
        <div class="bento-card border-l-4 border-l-[#0284c7] flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="font-mono text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">2L Bottles Dispensed</span>
              ${getIcon('box', 'svg-icon-sm text-[#0284c7]')}
            </div>
            <div class="font-heading font-extrabold text-2xl text-on-surface">2 010 units</div>
          </div>
          <div class="mt-4 flex items-center justify-between text-xs">
            <span class="text-[#0284c7] font-semibold text-[11px]">R 69.99 Standard Price</span>
            <span class="text-[10px] text-on-surface-variant font-mono">Ext7 Facility</span>
          </div>
        </div>

        <!-- Metric 3: Primary In-Stock Products -->
        <div class="bento-card border-l-4 border-l-[#1d4ed8] flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="font-mono text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Active Detergents</span>
              ${getIcon('check', 'svg-icon-sm text-[#1d4ed8]')}
            </div>
            <div class="font-heading font-extrabold text-2xl text-on-surface">3 Products</div>
          </div>
          <div class="mt-4 flex items-center justify-between text-xs">
            <span class="text-[#1d4ed8] font-bold text-[11px]">2L Pine, Dish & Multi</span>
            <span class="text-[10px] text-on-surface-variant font-mono">3 Out of Stock</span>
          </div>
        </div>

        <!-- Metric 4: On-Duty Staff -->
        <div class="bento-card border-l-4 border-l-[#3b82f6] flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="font-mono text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">On-Duty Staff Roster</span>
              ${getIcon('users', 'svg-icon-sm text-[#3b82f6]')}
            </div>
            <div class="font-heading font-extrabold text-xl text-on-surface">NG. Motloung +2</div>
          </div>
          <div class="mt-4 flex items-center justify-between text-xs">
            <span class="text-[#3b82f6] font-semibold text-[11px]">Motloung, Nhlapho, Sigasa</span>
            <span class="text-[10px] text-on-surface-variant font-mono">Sakhile, Ext7</span>
          </div>
        </div>
      </div>

      <!-- Main Section: Interactive Trend Chart & Live Operations Stream -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Interactive Chemical Category Sales Activity Chart (Shades of Blue Only) -->
        <div class="lg:col-span-8 bento-card flex flex-col justify-between">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-outline-variant">
            <div>
              <h3 class="font-heading font-bold text-base text-on-surface">Chemical Product Category Sales Activity</h3>
              <p class="text-xs text-on-surface-variant">${subTitle}</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5 bg-surface-low border border-outline-variant rounded px-2.5 py-1">
                <span class="text-xs font-semibold text-on-surface-variant">View:</span>
                <select id="chart-timeframe-select" class="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer">
                  <option value="daily" ${isDaily ? 'selected' : ''}>Daily (Hourly)</option>
                  <option value="weekly" ${isWeekly ? 'selected' : ''}>Weekly (Daily)</option>
                  <option value="monthly" ${isMonthly ? 'selected' : ''}>Monthly (Weekly)</option>
                </select>
              </div>
              <button id="view-reports-link" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View Reports &rarr;
              </button>
            </div>
          </div>

          <!-- SVG Chart Area (Blue Shades Curves) -->
          <div class="relative w-full h-64 my-2">
            <!-- Background Gridlines -->
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div class="border-b border-outline"></div>
              <div class="border-b border-outline"></div>
              <div class="border-b border-outline"></div>
              <div class="border-b border-outline"></div>
            </div>

            <!-- SVG Smooth Path Lines with Blue Shades -->
            <svg class="w-full h-full overflow-visible" viewBox="0 0 700 220" preserveAspectRatio="none">
              <!-- Grid line overlays -->
              <line x1="0" y1="50" x2="700" y2="50" stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="1" />
              <line x1="0" y1="100" x2="700" y2="100" stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="1" />
              <line x1="0" y1="150" x2="700" y2="150" stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="1" />

              <!-- Royal Blue (#0058be) Line 1 - Dishwashing Liquids -->
              <path 
                d="${path1}" 
                fill="none" 
                stroke="#0058be" 
                stroke-width="3.5" 
                stroke-linecap="round"
                class="animate-chart-line-1"
              />

              <!-- Bright Sky Blue (#0284c7) Line 2 - Pine Gels -->
              <path 
                d="${path2}" 
                fill="none" 
                stroke="#0284c7" 
                stroke-width="3" 
                stroke-linecap="round"
                class="animate-chart-line-2"
              />

              <!-- Cobalt Navy Blue (#1d4ed8) Line 3 - Bleach & Hygiene -->
              <path 
                d="${path3}" 
                fill="none" 
                stroke="#1d4ed8" 
                stroke-width="2.5" 
                stroke-linecap="round"
                class="animate-chart-line-3"
              />
            </svg>
          </div>

          <!-- X-Axis Labels -->
          <div class="flex justify-between items-center px-1 border-t border-outline-variant pt-2">
            ${xAxisHtml}
          </div>

          <!-- Chart Legend (Shades of Blue Only) -->
          <div class="flex justify-center items-center gap-6 mt-4 pt-2 border-t border-outline-variant text-xs">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-[#0058be]"></span>
              <span class="font-semibold text-on-surface">Dishwashing Liquids</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-[#0284c7]"></span>
              <span class="font-semibold text-on-surface">Pine Gels</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-[#1d4ed8]"></span>
              <span class="font-semibold text-on-surface">Bleach & Hygiene</span>
            </div>
          </div>
        </div>

        <!-- Live Operations Stream (Shades of Blue Dots Only) -->
        <div class="lg:col-span-4 bento-card flex flex-col">
          <div class="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant">
            <h3 class="font-heading font-bold text-base text-on-surface">Live Operations Stream</h3>
            <span class="font-mono text-[10px] text-primary font-bold">Real-time</span>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 pr-1">
            ${state.activityStream.map((act, index) => {
              // Shades of Blue Dots for activity stream
              const blueDots = ['bg-[#0058be]', 'bg-[#0284c7]', 'bg-[#1d4ed8]', 'bg-[#3b82f6]'];
              const dotColor = blueDots[index % blueDots.length];
              return `
                <div class="flex items-start gap-3 text-xs border-b border-outline-variant/40 pb-3 last:border-none">
                  <div class="w-2.5 h-2.5 rounded-full ${dotColor} mt-1 shrink-0"></div>
                  <div class="flex-1">
                    <p class="font-medium text-on-surface leading-snug">${act.text}</p>
                    <span class="font-mono text-[10px] text-on-surface-variant block mt-1">${act.time}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindDashboardEvents() {
  const dashPosBtn = document.getElementById('dash-pos-btn');
  if (dashPosBtn) {
    dashPosBtn.addEventListener('click', () => setActiveTab('pos'));
  }

  const dashInvBtn = document.getElementById('dash-inv-btn');
  if (dashInvBtn) {
    dashInvBtn.addEventListener('click', () => setActiveTab('inventory'));
  }

  const viewReportsLink = document.getElementById('view-reports-link');
  if (viewReportsLink) {
    viewReportsLink.addEventListener('click', () => setActiveTab('reports'));
  }

  const tfSelect = document.getElementById('chart-timeframe-select');
  if (tfSelect) {
    tfSelect.addEventListener('change', (e) => {
      setChartTimeframe(e.target.value);
    });
  }
}
