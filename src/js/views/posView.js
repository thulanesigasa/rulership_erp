import { getIcon } from '../svgIcons.js';
import { 
  state, 
  addToCart, 
  updateCartQty, 
  removeFromCart, 
  clearCart, 
  setPosCategoryFilter, 
  setSelectedCustomer, 
  openModal,
  formatCurrency 
} from '../storeState.js';

export function renderPosView() {
  const categories = ['All', 'Dishwashing', 'Surface Cleaners', 'Pine Gels', 'Bleach & Hygiene', 'Auto Care', 'Laundry'];

  const categoryPillsHtml = categories.map(cat => {
    const isSel = state.posCategoryFilter === cat;
    return `
      <button 
        data-category="${cat}"
        class="pos-cat-pill btn btn-sm ${isSel ? 'btn-primary' : 'btn-outline'} text-xs rounded-full whitespace-nowrap"
      >
        ${cat}
      </button>
    `;
  }).join('');

  let filteredProds = state.products;
  if (state.posCategoryFilter !== 'All') {
    filteredProds = filteredProds.filter(p => p.category === state.posCategoryFilter);
  }
  if (state.globalSearch.trim() !== '') {
    const q = state.globalSearch.toLowerCase();
    filteredProds = filteredProds.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q) || 
      (p.barcode && p.barcode.includes(q))
    );
  }

  const productGridHtml = filteredProds.map(p => `
    <div data-product-id="${p.id}" class="pos-product-card product-card ${p.status === 'Out of Stock' ? 'opacity-50 cursor-not-allowed' : ''}">
      <div class="flex justify-between items-start mb-1">
        <span class="text-xs font-bold text-on-surface line-clamp-2">${p.name}</span>
        ${p.status === 'Out of Stock' ? `<span class="badge badge-error text-[9px]">Out</span>` : `<span class="badge badge-success text-[9px]">In Stock</span>`}
      </div>
      <div class="mt-2">
        <div class="font-mono text-[10px] text-on-surface-variant">Code: ${p.barcode || p.sku}</div>
        <div class="font-heading font-extrabold text-base text-primary">${formatCurrency(p.price)} <span class="text-[10px] text-slate-500 font-normal">Incl. VAT</span></div>
      </div>
    </div>
  `).join('');

  // Cart Calculations (VAT INCLUSIVE: Catalog price R 69.99 = Grand Total R 69.99)
  const total = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const vat = total * (state.vatRate / (1 + state.vatRate)); // 15/115 SARS VAT
  const subtotal = total - vat;

  const cartRowsHtml = state.cart.map(item => {
    const itemTotal = item.price * item.qty;
    return `
      <tr class="border-b border-outline-variant/40 hover:bg-surface-low/50">
        <td class="py-2 px-2">
          <div class="font-semibold text-xs text-on-surface leading-tight">${item.name}</div>
          <div class="font-mono text-[10px] text-on-surface-variant">Code: ${item.barcode || item.sku}</div>
        </td>
        <td class="py-2 px-1 text-center">
          <div class="inline-flex items-center gap-1 bg-surface-low border border-outline-variant rounded p-0.5">
            <button data-cart-minus="${item.productId}" class="cart-qty-btn p-0.5 text-on-surface-variant hover:text-primary rounded">
              ${getIcon('minus', 'svg-icon-sm')}
            </button>
            <span class="font-mono text-xs font-bold w-6 text-center">${item.qty}</span>
            <button data-cart-plus="${item.productId}" class="cart-qty-btn p-0.5 text-on-surface-variant hover:text-primary rounded">
              ${getIcon('plus', 'svg-icon-sm')}
            </button>
          </div>
        </td>
        <td class="py-2 px-2 text-right font-mono text-xs">${formatCurrency(item.price)}</td>
        <td class="py-2 px-2 text-right font-mono text-xs font-bold text-on-surface">${formatCurrency(itemTotal)}</td>
        <td class="py-2 px-1 text-center">
          <button data-cart-remove="${item.productId}" class="cart-remove-btn text-outline hover:text-error p-1">
            ${getIcon('trash', 'svg-icon-sm')}
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      <!-- Left: Detergent Catalog (7 Columns) -->
      <div class="lg:col-span-7 flex flex-col border-r border-outline-variant p-4 h-full overflow-hidden">
        <!-- Scan / Search Header -->
        <div class="mb-3">
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              ${getIcon('search', 'svg-icon-md')}
            </span>
            <input 
              id="pos-search-input"
              type="text" 
              placeholder="Scan 13-digit barcode (e.g. 2024699900018) or type product name (F1)..."
              value="${state.globalSearch}"
              class="w-full pl-10 pr-12 py-3 bg-surface-lowest border border-outline-variant rounded-md font-heading font-semibold text-sm text-on-surface focus:outline-none focus:border-primary shadow-sm"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] bg-surface-low border border-outline-variant px-1.5 py-0.5 rounded text-on-surface-variant">
              F1
            </span>
          </div>
        </div>

        <!-- Category Filters -->
        <div class="flex justify-between items-center mb-3">
          <h2 class="font-heading font-bold text-sm text-on-surface">Household Cleaning Catalog</h2>
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
            ${categoryPillsHtml}
          </div>
        </div>

        <!-- Product Grid -->
        <div class="flex-1 overflow-y-auto pr-1">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-8">
            ${productGridHtml.length > 0 ? productGridHtml : `<div class="col-span-full text-center text-on-surface-variant py-8">No detergent products found.</div>`}
          </div>
        </div>
      </div>

      <!-- Right: POS Cart & Checkout Terminal (5 Columns) -->
      <div class="lg:col-span-5 flex flex-col bg-surface-lowest h-full border-l border-outline-variant">
        <div class="p-3 border-b border-outline-variant bg-surface-container flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded bg-primary-container text-primary flex items-center justify-center">
              ${getIcon('user', 'svg-icon-sm')}
            </div>
            <div>
              <select id="pos-customer-select" class="bg-transparent border-none text-xs font-bold text-on-surface focus:outline-none cursor-pointer">
                <option value="Walk-in Retail Customer" ${state.selectedCustomer.includes('Retail') ? 'selected' : ''}>Walk-in Retail Customer</option>
                <option value="Sakhile Car Wash Co. (Commercial)" ${state.selectedCustomer.includes('Car Wash') ? 'selected' : ''}>Sakhile Car Wash Co. (Commercial)</option>
                <option value="Standerton Guest House (Wholesale)" ${state.selectedCustomer.includes('Guest House') ? 'selected' : ''}>Standerton Guest House (Wholesale)</option>
              </select>
            </div>
          </div>
          <span class="badge badge-success text-[10px]">Ext7 Terminal Active</span>
        </div>

        <div class="table-container border-none rounded-none flex-1 overflow-y-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Detergent Item</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${cartRowsHtml.length > 0 ? cartRowsHtml : `
                <tr>
                  <td colspan="5" class="text-center text-on-surface-variant py-12">
                    <div class="flex flex-col items-center gap-2">
                      ${getIcon('cart', 'svg-icon-xl text-outline')}
                      <p class="text-xs font-semibold">Cart is currently empty</p>
                      <p class="text-[11px]">Select detergent products on the left to add to sale</p>
                    </div>
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <!-- Checkout Totals in ZAR with VAT INCLUSIVE calculation -->
        <div class="border-t border-outline-variant bg-surface-low p-4 flex flex-col gap-3">
          <div class="space-y-1.5 text-xs text-on-surface-variant">
            <div class="flex justify-between">
              <span>Subtotal Excl. VAT (${state.cart.reduce((a, b) => a + b.qty, 0)} items)</span>
              <span class="font-mono font-medium">${formatCurrency(subtotal)}</span>
            </div>
            <div class="flex justify-between">
              <span>15% SARS VAT (Included)</span>
              <span class="font-mono font-medium">${formatCurrency(vat)}</span>
            </div>
            <div class="flex justify-between items-end pt-2 border-t border-outline-variant border-dashed">
              <span class="font-heading font-extrabold text-base text-on-surface">Grand Total (Incl. VAT)</span>
              <span class="font-heading font-extrabold text-2xl text-primary">${formatCurrency(total)}</span>
            </div>
          </div>

          <div class="grid grid-cols-12 gap-2 mt-2">
            <button id="pos-hold-btn" class="col-span-3 btn btn-outline text-xs flex flex-col items-center py-2">
              ${getIcon('pause', 'svg-icon-sm')}
              <span>Hold</span>
            </button>
            <button id="pos-discard-btn" class="col-span-3 btn btn-danger text-xs flex flex-col items-center py-2">
              ${getIcon('trash', 'svg-icon-sm')}
              <span>Discard</span>
            </button>
            <button 
              id="pos-pay-btn" 
              class="col-span-6 btn btn-secondary text-sm font-heading font-bold py-2.5 flex items-center justify-center gap-2"
              ${state.cart.length === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
            >
              ${getIcon('payments', 'svg-icon-sm')}
              <span>Pay ${formatCurrency(total)} (F12)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindPosEvents() {
  document.querySelectorAll('.pos-cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      setPosCategoryFilter(cat);
    });
  });

  document.querySelectorAll('.pos-product-card').forEach(card => {
    card.addEventListener('click', () => {
      const prodId = card.getAttribute('data-product-id');
      const prod = state.products.find(p => p.id === prodId);
      if (prod) {
        addToCart(prod);
      }
    });
  });

  document.querySelectorAll('[data-cart-plus]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-cart-plus');
      updateCartQty(id, 1);
    });
  });

  document.querySelectorAll('[data-cart-minus]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-cart-minus');
      updateCartQty(id, -1);
    });
  });

  document.querySelectorAll('[data-cart-remove]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-cart-remove');
      removeFromCart(id);
    });
  });

  const custSelect = document.getElementById('pos-customer-select');
  if (custSelect) {
    custSelect.addEventListener('change', (e) => {
      setSelectedCustomer(e.target.value);
    });
  }

  const discardBtn = document.getElementById('pos-discard-btn');
  if (discardBtn) {
    discardBtn.addEventListener('click', () => {
      if (state.cart.length > 0 && confirm('Discard current detergent order?')) {
        clearCart();
      }
    });
  }

  const payBtn = document.getElementById('pos-pay-btn');
  if (payBtn) {
    payBtn.addEventListener('click', () => {
      if (state.cart.length > 0) {
        openModal('pay');
      }
    });
  }
}
