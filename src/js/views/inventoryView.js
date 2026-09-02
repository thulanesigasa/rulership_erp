import { getIcon } from '../svgIcons.js';
import { 
  state, 
  setSelectedInventoryProduct, 
  openModal,
  formatCurrency 
} from '../storeState.js';
import { generateBarcodeSVG, generateCompleteStickerSVG } from '../barcodeGenerator.js';

export function renderInventoryView() {
  const selectedProd = state.products.find(p => p.id === state.selectedInventoryProductId) || state.products[0];

  let filtered = state.products;
  if (state.globalSearch.trim() !== '') {
    const q = state.globalSearch.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q) || 
      (p.barcode && p.barcode.includes(q)) || 
      p.category.toLowerCase().includes(q)
    );
  }

  const tableRowsHtml = filtered.map(p => {
    const isSelected = selectedProd && selectedProd.id === p.id;
    return `
      <tr 
        data-inventory-row="${p.id}"
        class="cursor-pointer ${isSelected ? 'bg-primary-container/30 border-l-4 border-l-primary font-semibold' : 'hover:bg-surface-low'}"
      >
        <td class="w-8 py-3 px-3">
          <input type="checkbox" class="rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" />
        </td>
        <td class="py-3 px-4">
          <div class="font-medium text-xs text-on-surface">${p.name}</div>
          <div class="text-[11px] text-on-surface-variant font-normal">Supplier: ${p.supplier}</div>
        </td>
        <td class="py-3 px-4 font-mono text-xs text-on-surface-variant">
          <span class="font-bold text-on-surface">${p.barcode || p.sku}</span>
          <span class="text-[10px] text-primary block">${p.sku}</span>
        </td>
        <td class="py-3 px-4 text-xs">${p.category}</td>
        <td class="py-3 px-4 font-mono text-xs font-bold text-right">${p.totalStock.toLocaleString()} ${p.unit}s</td>
        <td class="py-3 px-4">
          <span class="badge ${p.status === 'In Stock' ? 'badge-success' : 'badge-error'}">
            ${p.status}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <button data-reorder-btn="${p.id}" class="btn btn-sm btn-outline text-[11px] py-1 px-2 text-primary border-primary">
            ${getIcon('refresh', 'svg-icon-sm')} Reorder
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Branch breakdown HTML for selected product (Single Branch: Sakhile, Ext7)
  const branchStockRowsHtml = selectedProd ? Object.entries(selectedProd.branchStock).map(([bName, stockVal]) => `
    <div class="bg-surface-low rounded p-2.5 flex justify-between items-center border border-outline-variant/60">
      <div class="flex items-center gap-2">
        ${getIcon('store', 'svg-icon-sm text-outline')}
        <span class="text-xs font-semibold text-on-surface">${bName}</span>
      </div>
      <span class="font-mono text-xs font-bold ${stockVal <= 0 ? 'text-error' : 'text-on-surface'}">
        ${stockVal} ${selectedProd.unit}s
      </span>
    </div>
  `).join('') : '';

  return `
    <div class="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <!-- Title & Global Actions -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="font-heading font-extrabold text-2xl text-on-surface tracking-tight">Detergent Inventory Catalog</h1>
          <p class="text-xs text-on-surface-variant mt-0.5">Central chemical stock control, reorder thresholds, and internal 13-digit numeric barcode generator.</p>
        </div>

        <div class="flex items-center gap-2">
          <button id="generate-barcodes-btn" class="btn btn-secondary text-xs py-2 flex items-center gap-2">
            ${getIcon('receipt', 'svg-icon-sm')} Generate Printable Barcodes
          </button>
          <button id="export-inventory-btn" class="btn btn-outline text-xs py-2 flex items-center gap-1.5">
            ${getIcon('download', 'svg-icon-sm')} Export Inventory CSV
          </button>
          <button id="add-product-btn" class="btn btn-primary text-xs py-2">
            ${getIcon('plus', 'svg-icon-sm')} Add New Product
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bento-card p-3 flex flex-col md:flex-row gap-3 items-center">
        <div class="flex-1 w-full relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            ${getIcon('search', 'svg-icon-sm')}
          </span>
          <input 
            id="inventory-search-input"
            type="text"
            placeholder="Search detergent product name, numeric barcode (e.g. 2024699900018)..."
            value="${state.globalSearch}"
            class="w-full pl-9 pr-4 py-2 bg-surface-low border border-outline-variant rounded text-xs focus:outline-none focus:border-primary"
          />
        </div>

        <div class="flex gap-2 w-full md:w-auto">
          <select id="inv-category-filter" class="bg-surface-lowest border border-outline-variant rounded px-3 py-2 text-xs font-semibold text-on-surface focus:outline-none">
            <option>All Categories</option>
            <option>Dishwashing</option>
            <option>Surface Cleaners</option>
            <option>Pine Gels</option>
            <option>Bleach & Hygiene</option>
            <option>Auto Care</option>
            <option>Laundry</option>
          </select>
          <select id="inv-status-filter" class="bg-surface-lowest border border-outline-variant rounded px-3 py-2 text-xs font-semibold text-on-surface focus:outline-none">
            <option>All Statuses</option>
            <option>In Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>

      <!-- Main Layout: Inventory Table + Single Branch Side Panel -->
      <div class="flex flex-col xl:flex-row gap-6">
        <!-- Main Data Table Container -->
        <div class="flex-1 bento-card p-0 overflow-hidden">
          <div class="table-container border-none">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="w-8"><input type="checkbox" class="rounded" /></th>
                  <th>Detergent Product Info</th>
                  <th>Numeric Barcode & SKU</th>
                  <th>Category</th>
                  <th class="text-right">Total Stock</th>
                  <th>Status</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Single Branch Stock Side Drawer & Vector Barcode Preview Card -->
        <div class="w-full xl:w-96 flex flex-col gap-4 shrink-0">
          ${selectedProd ? `
            <div class="bento-card border-l-4 border-l-primary flex flex-col gap-4">
              <div>
                <div class="font-mono text-[11px] text-primary font-bold uppercase mb-1">
                  ${selectedProd.sku} • ${selectedProd.category}
                </div>
                <h3 class="font-heading font-extrabold text-lg text-on-surface leading-tight">${selectedProd.name}</h3>
                <p class="text-xs text-on-surface-variant mt-1">Supplier: ${selectedProd.supplier}</p>
              </div>

              <!-- Price & Total Badge in ZAR (R) -->
              <div class="flex justify-between items-center p-3 bg-surface-low rounded border border-outline-variant">
                <div>
                  <span class="text-[10px] text-on-surface-variant font-mono uppercase block">Retail Price (ZAR)</span>
                  <span class="font-heading font-extrabold text-xl text-primary">${formatCurrency(selectedProd.price)}</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-on-surface-variant font-mono uppercase block">Status</span>
                  <span class="badge ${selectedProd.status === 'In Stock' ? 'badge-success' : 'badge-error'}">
                    ${selectedProd.status}
                  </span>
                </div>
              </div>

              <!-- Complete Barcode Sticker Card Preview (Official Validated SVG Vector File) -->
              <div id="full-barcode-card" class="p-3 bg-white rounded-lg border border-slate-300 text-center flex flex-col items-center gap-1 shadow-sm relative">
                <div class="w-full flex justify-between items-center border-b border-slate-200 pb-1.5 mb-1">
                  <span class="text-xs text-primary font-mono font-extrabold uppercase tracking-wider">${selectedProd.sku}</span>
                  <a href="/labels/${selectedProd.sku}.svg" download="Rulership_Bottle_Label_${selectedProd.sku}.svg" class="p-1.5 text-slate-600 hover:text-primary rounded-md border border-slate-300 hover:bg-slate-100 transition-all shadow-xs" title="Download Official Barcode Sticker SVG">
                    ${getIcon('download', 'svg-icon-sm')}
                  </a>
                </div>

                <div id="barcode-svg-container" class="w-full py-1">
                  <img src="/labels/${selectedProd.sku}.svg" alt="Official Barcode Label ${selectedProd.sku}" class="w-full h-auto rounded border border-slate-200 shadow-xs" onerror="this.onerror=null; this.src='/labels/DET-PINE-2L.svg';" />
                </div>
              </div>

              <!-- Branch Stock List -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <h4 class="font-heading font-bold text-xs text-on-surface">Facility Stock Allocation</h4>
                  <span class="font-mono text-[11px] text-on-surface-variant">Total: ${selectedProd.totalStock}</span>
                </div>
                <div class="flex flex-col gap-2">
                  ${branchStockRowsHtml}
                </div>
              </div>

              <!-- Quick Action Bar -->
              <div class="flex gap-2 mt-2">
                <button id="side-reorder-btn" class="flex-1 btn btn-primary text-xs py-2">
                  ${getIcon('refresh', 'svg-icon-sm')} Purchase Order (PO)
                </button>
                <button id="side-edit-btn" class="btn btn-outline text-xs p-2" title="Edit Product Specs">
                  ${getIcon('edit', 'svg-icon-sm')}
                </button>
              </div>
            </div>
          ` : `<div class="bento-card text-center text-on-surface-variant py-8">Select a product row to view facility details.</div>`}
        </div>
      </div>
    </div>
  `;
}

export function bindInventoryEvents() {
  document.querySelectorAll('[data-inventory-row]').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.getAttribute('data-inventory-row');
      setSelectedInventoryProduct(id);
    });
  });

  document.querySelectorAll('[data-reorder-btn]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-reorder-btn');
      const prod = state.products.find(p => p.id === id);
      if (prod) {
        openModal('reorder', prod);
      }
    });
  });

  const sideReorderBtn = document.getElementById('side-reorder-btn');
  if (sideReorderBtn) {
    sideReorderBtn.addEventListener('click', () => {
      const prod = state.products.find(p => p.id === state.selectedInventoryProductId);
      if (prod) {
        openModal('reorder', prod);
      }
    });
  }

  // Export Inventory CSV Event Handler
  const exportCsvBtn = document.getElementById('export-inventory-btn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const rows = [
        ['RULERSHIP LTD PTY - DETERGENT INVENTORY CATALOG'],
        ['Facility:', 'Sakhile, Ext7'],
        ['Currency:', 'ZAR (R) - 15% VAT Incl.'],
        ['Date Exported:', new Date().toLocaleDateString('en-ZA')],
        [''],
        ['Product Name', 'SKU Code', '13-Digit Barcode', 'Category', 'Retail Price (ZAR)', 'Total Stock', 'Status', 'Supplier']
      ];

      state.products.forEach(p => {
        rows.push([
          `"${p.name}"`,
          `"${p.sku}"`,
          `"${p.barcode || p.sku}"`,
          `"${p.category}"`,
          p.price.toFixed(2),
          p.totalStock,
          `"${p.status}"`,
          `"${p.supplier}"`
        ]);
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Rulership_Inventory_Catalog_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Complete Standalone Barcode Sticker SVG Vector Exporter
  const downloadBarcodeBtn = document.getElementById('download-barcode-btn');
  if (downloadBarcodeBtn) {
    downloadBarcodeBtn.addEventListener('click', () => {
      const sku = downloadBarcodeBtn.getAttribute('data-download-sku') || 'Product';
      const barcode = downloadBarcodeBtn.getAttribute('data-download-barcode') || sku;
      
      const fullStickerSvgString = generateCompleteStickerSVG(sku, barcode, 'RULERSHIP LTD PTY');
      
      const blob = new Blob([fullStickerSvgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `Rulership_Bottle_Label_${sku}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    });
  }

  const generateBarcodesBtn = document.getElementById('generate-barcodes-btn');
  if (generateBarcodesBtn) {
    generateBarcodesBtn.addEventListener('click', () => {
      openModal('barcodeSheet');
    });
  }

  const addProdBtn = document.getElementById('add-product-btn');
  if (addProdBtn) {
    addProdBtn.addEventListener('click', () => {
      openModal('addProduct');
    });
  }
}
