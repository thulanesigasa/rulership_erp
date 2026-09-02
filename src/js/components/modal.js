import { getIcon } from '../svgIcons.js';
import { 
  state, 
  closeModal, 
  completePayment, 
  addNewProduct, 
  updateStaffShift, 
  addStaffMember, 
  formatCurrency 
} from '../storeState.js';
import { generateBarcodeSVG } from '../barcodeGenerator.js';

export function renderModal() {
  if (!state.activeModal) return '';

  // 1. POS Payment Modal (VAT INCLUSIVE)
  if (state.activeModal === 'pay') {
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const vat = total * (state.vatRate / (1 + state.vatRate)); // 15/115 VAT
    const subtotal = total - vat;

    return `
      <div class="modal-backdrop">
        <div class="modal-content bg-white text-slate-900 dark:bg-slate-900 dark:text-white p-6 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full relative">
          <div class="flex justify-between items-center mb-4 border-b border-outline-variant pb-3">
            <div>
              <h3 class="font-heading font-extrabold text-lg text-on-surface">POS Checkout Payment (ZAR)</h3>
              <p class="text-xs text-on-surface-variant">Sakhile Ext7 Terminal • 15% South African VAT (Included)</p>
            </div>
            <button id="modal-close-btn" class="p-1 rounded text-outline hover:text-on-surface">
              ${getIcon('close', 'svg-icon-md')}
            </button>
          </div>

          <div class="space-y-4">
            <!-- Payable Total Card (VAT Inclusive R 69.99) -->
            <div class="p-4 bg-primary-container/20 rounded border border-primary/30 flex justify-between items-center">
              <div>
                <span class="font-heading font-bold text-sm text-on-surface block">Total Amount Payable</span>
                <span class="text-[10px] text-slate-500">Includes 15% SARS VAT (${formatCurrency(vat)})</span>
              </div>
              <span class="font-heading font-extrabold text-2xl text-primary">${formatCurrency(total)}</span>
            </div>

            <!-- Tender Type Buttons -->
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Payment Tender Type</label>
              <div class="grid grid-cols-3 gap-2">
                <button data-pay-method="Cash" class="pay-method-btn btn btn-primary text-xs py-2">Cash</button>
                <button data-pay-method="Card" class="pay-method-btn btn btn-outline text-xs py-2">Card / EFT</button>
                <button data-pay-method="Mobile" class="pay-method-btn btn btn-outline text-xs py-2">Mobile Pay</button>
              </div>
            </div>

            <!-- Cash Tender Amount Input -->
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Cash Tendered (R)</label>
              <input 
                id="tender-input"
                type="number"
                step="5"
                value="${Math.ceil(total / 10) * 10}"
                class="w-full p-2.5 bg-surface-low border border-outline-variant rounded font-mono font-bold text-lg focus:outline-none focus:border-primary text-on-surface"
              />
            </div>

            <div class="p-3 bg-surface-low rounded border border-outline-variant flex justify-between items-center text-xs">
              <span class="font-medium text-on-surface-variant">Change Due to Customer</span>
              <span id="change-due-val" class="font-mono font-bold text-base text-secondary">
                ${formatCurrency(Math.max(0, (Math.ceil(total / 10) * 10) - total))}
              </span>
            </div>

            <div class="flex gap-2 pt-2">
              <button id="cancel-pay-btn" class="flex-1 btn btn-outline text-xs py-2.5">Cancel</button>
              <button id="confirm-pay-btn" class="flex-1 btn btn-secondary text-sm font-bold py-2.5">
                Complete Sale & Dispense Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Animated Thermal POS Receipt Printer Dispenser Modal (VAT INCLUSIVE)
  if (state.activeModal === 'receipt' && state.lastTransaction) {
    const tx = state.lastTransaction;
    const itemsHtml = tx.items.map(item => `
      <div class="flex justify-between text-xs py-1 border-b border-dashed border-gray-300">
        <span class="font-mono">${item.qty}x ${item.name}</span>
        <span class="font-mono font-bold">${formatCurrency(item.price * item.qty)}</span>
      </div>
    `).join('');

    return `
      <div class="modal-backdrop">
        <div class="flex flex-col items-center max-w-sm w-full">
          <div class="w-full flex justify-end mb-2">
            <button id="modal-close-btn" class="btn btn-sm btn-outline text-white bg-slate-800 border-slate-700 hover:bg-slate-700">
              ${getIcon('close', 'svg-icon-sm')} Close Printer Window
            </button>
          </div>

          <div class="w-full bg-gradient-to-b from-slate-200 to-slate-400 p-3 rounded-2xl border-4 border-slate-300 shadow-2xl relative z-20 flex flex-col items-center">
            <div class="w-11/12 h-5 bg-slate-900 rounded-full border-2 border-slate-400 shadow-inner flex items-center justify-center relative overflow-hidden">
              <div class="w-4/5 h-1 bg-black rounded-full"></div>
            </div>
          </div>

          <div class="w-full -mt-2 overflow-hidden relative z-10 flex justify-center pb-4">
            <div class="receipt-paper animate-receipt-slide w-11/12 bg-white text-slate-800 p-5 shadow-2xl font-mono text-xs relative border-x border-slate-300">
              
              <div class="text-center border-b-2 border-dashed border-slate-400 pb-3 mb-3">
                <div class="text-lg font-heading font-extrabold tracking-tight text-slate-900">RULERSHIP LTD PTY</div>
                <div class="text-[10px] text-slate-600 font-bold uppercase">Detergents & Cleaning Works</div>
                <div class="text-[10px] text-slate-500 mt-1">${tx.branch}</div>
                <div class="text-[10px] text-slate-500">VAT Reg: ZA4901928374</div>
                <div class="text-[10px] text-slate-500 mt-1">${tx.date}</div>
                <div class="text-xs font-bold text-slate-800 mt-2">RECEIPT #${tx.id}</div>
              </div>

              <div class="space-y-1 mb-4">
                <div class="text-[10px] text-slate-500 font-bold uppercase border-b border-slate-300 pb-1 mb-1 flex justify-between">
                  <span>QTY & ITEM</span>
                  <span>PRICE</span>
                </div>
                ${itemsHtml}
              </div>

              <div class="border-t-2 border-dashed border-slate-400 pt-3 space-y-1.5 text-xs">
                <div class="flex justify-between text-slate-600">
                  <span>Subtotal Excl. VAT:</span>
                  <span>${formatCurrency(tx.subtotal)}</span>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>15% SARS VAT (Included):</span>
                  <span>${formatCurrency(tx.vat)}</span>
                </div>
                <div class="flex justify-between text-sm font-bold text-slate-900 border-t border-b border-slate-300 py-1.5 my-1">
                  <span>TOTAL AMOUNT (INCL. VAT):</span>
                  <span>${formatCurrency(tx.total)}</span>
                </div>
                <div class="flex justify-between text-[11px] text-slate-600">
                  <span>CASH TENDERED:</span>
                  <span>${formatCurrency(tx.tenderAmount)}</span>
                </div>
                <div class="flex justify-between text-[11px] font-bold text-emerald-700">
                  <span>CHANGE DUE:</span>
                  <span>${formatCurrency(tx.change)}</span>
                </div>
              </div>

              <div class="text-center mt-5 pt-3 border-t-2 border-dashed border-slate-400 space-y-2">
                <div class="font-heading font-extrabold text-sm text-slate-900 tracking-wide">THANK YOU FOR YOUR PATRONAGE</div>
                <p class="text-[9px] text-slate-500">Cleanliness & Hygiene Delivered • Standerton 2431</p>
                
                <div class="flex justify-center items-center gap-0.5 h-10 pt-2 opacity-80">
                  <div class="w-1 h-full bg-slate-900"></div>
                  <div class="w-0.5 h-full bg-slate-900"></div>
                  <div class="w-1.5 h-full bg-slate-900"></div>
                  <div class="w-0.5 h-full bg-slate-900"></div>
                  <div class="w-2 h-full bg-slate-900"></div>
                  <div class="w-1 h-full bg-slate-900"></div>
                  <div class="w-0.5 h-full bg-slate-900"></div>
                  <div class="w-1.5 h-full bg-slate-900"></div>
                  <div class="w-1 h-full bg-slate-900"></div>
                  <div class="w-2 h-full bg-slate-900"></div>
                  <div class="w-0.5 h-full bg-slate-900"></div>
                  <div class="w-1.5 h-full bg-slate-900"></div>
                  <div class="w-1 h-full bg-slate-900"></div>
                  <div class="w-2 h-full bg-slate-900"></div>
                  <div class="w-0.5 h-full bg-slate-900"></div>
                  <div class="w-1 h-full bg-slate-900"></div>
                </div>
                <div class="text-[9px] font-mono text-slate-500">${tx.id}</div>
              </div>

              <div class="receipt-zigzag-bottom"></div>
            </div>
          </div>

          <div class="w-full flex gap-2 mt-2">
            <button id="close-receipt-btn" class="flex-1 btn btn-outline bg-white text-xs py-2 font-bold shadow">
              Done Checkout
            </button>
            <button id="print-receipt-btn" class="flex-1 btn btn-primary text-xs py-2 font-bold shadow flex items-center justify-center gap-1">
              ${getIcon('download', 'svg-icon-sm')} Print Physical Receipt
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 3. Printable Numeric EAN-13 Barcode Sticker Labels Sheet Modal
  if (state.activeModal === 'barcodeSheet') {
    const inStockProds = state.products.filter(p => p.status === 'In Stock');
    const labelGridHtml = inStockProds.map(p => `
      <div class="p-3 bg-white border border-slate-300 rounded text-center flex flex-col items-center justify-between shadow-sm">
        <div class="text-left w-full border-b border-slate-200 pb-1 mb-1">
          <span class="text-[9px] font-bold text-slate-500 block uppercase">Rulership LTD PTY</span>
          <span class="text-xs font-bold text-slate-900 block truncate">${p.name}</span>
        </div>
        
        <div class="w-full py-1">
          <img src="/labels/${p.sku}.svg" alt="${p.name} Label" class="w-full h-auto rounded border border-slate-200" onerror="this.onerror=null; this.src='/labels/DET-PINE-2L.svg';" />
        </div>

        <div class="flex justify-between items-center w-full border-t border-slate-200 pt-1 mt-1 font-mono text-xs">
          <span class="font-bold text-slate-900">${formatCurrency(p.price)}</span>
          <span class="text-[9px] text-slate-500 font-sans font-semibold">Sakhile, Ext7</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="modal-backdrop">
        <div class="modal-content bg-white text-slate-900 p-6 shadow-2xl border border-slate-200 rounded-xl max-w-2xl w-full relative">
          <div class="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
            <div>
              <span class="badge badge-primary text-[10px] mb-1">13-Digit Numeric Barcodes</span>
              <h3 class="font-heading font-extrabold text-lg text-slate-900">Internal Numeric Barcode Labels</h3>
              <p class="text-xs text-slate-500">Printable 13-digit EAN-13 barcode stickers for 2L detergent bottles</p>
            </div>
            <button id="modal-close-btn" class="p-1 rounded text-slate-400 hover:text-slate-900">
              ${getIcon('close', 'svg-icon-md')}
            </button>
          </div>

          <div class="space-y-4">
            <div class="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
              <span class="font-bold">Human-Readable 13-Digit Barcodes Active:</span>
              <span> These barcodes display standard 13-digit numbers (e.g., 2024699900018, 2024699900025, 2024699900032). Store cashiers can read the numbers directly or scan them into the POS!</span>
            </div>

            <!-- Barcode Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-slate-100 rounded border border-slate-200 max-h-96 overflow-y-auto">
              ${labelGridHtml}
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button id="cancel-barcode-btn" class="btn btn-outline text-xs py-2">Close</button>
              <button id="print-barcodes-btn" class="btn btn-primary text-xs py-2 flex items-center gap-1">
                ${getIcon('download', 'svg-icon-sm')} Print Sticker Sheet
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 4. Edit Staff Shift Modal
  if (state.activeModal === 'editShift' && state.selectedStaffToEdit) {
    const s = state.selectedStaffToEdit;
    return `
      <div class="modal-backdrop">
        <div class="modal-content bg-white text-slate-900 dark:bg-slate-900 dark:text-white p-6 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full relative">
          <div class="flex justify-between items-center mb-4 border-b border-outline-variant pb-3">
            <div>
              <span class="badge badge-primary text-[10px] mb-1">Director Control</span>
              <h3 class="font-heading font-extrabold text-lg text-on-surface">Edit Employee Shift & Role</h3>
              <p class="text-xs text-on-surface-variant">Update work schedule for ${s.name} at Sakhile Ext7</p>
            </div>
            <button id="modal-close-btn" class="p-1 rounded text-outline hover:text-on-surface">
              ${getIcon('close', 'svg-icon-md')}
            </button>
          </div>

          <form id="edit-shift-form" class="space-y-4 text-xs">
            <div class="p-3 bg-surface-low rounded border border-outline-variant">
              <span class="text-[10px] text-on-surface-variant font-mono uppercase block">Employee Identity</span>
              <span class="font-heading font-bold text-sm text-on-surface">${s.name} (${s.phone})</span>
            </div>

            <div>
              <label class="block font-semibold text-on-surface mb-1">Assigned Role</label>
              <select id="edit-staff-role" class="w-full p-2.5 bg-surface-lowest border border-outline-variant rounded font-semibold text-on-surface">
                <option value="Managing Director" ${s.role === 'Managing Director' ? 'selected' : ''}>Managing Director</option>
                <option value="Chemical Inventory Officer" ${s.role === 'Chemical Inventory Officer' ? 'selected' : ''}>Chemical Inventory Officer</option>
                <option value="Senior POS Cashier & Logistics" ${s.role.includes('Senior POS Cashier') ? 'selected' : ''}>Senior POS Cashier & Logistics</option>
                <option value="POS Cashier & Support" ${s.role.includes('Support') ? 'selected' : ''}>POS Cashier & Support</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-on-surface mb-1">Assigned Shift Hours</label>
              <select id="edit-staff-shift" class="w-full p-2.5 bg-surface-lowest border border-outline-variant rounded font-mono font-semibold text-on-surface">
                <option value="Morning (07:00 - 15:00)" ${s.shift.includes('Morning') ? 'selected' : ''}>Morning (07:00 - 15:00)</option>
                <option value="Afternoon (12:00 - 20:00)" ${s.shift.includes('Afternoon') ? 'selected' : ''}>Afternoon (12:00 - 20:00)</option>
                <option value="Night Bottling (20:00 - 04:00)" ${s.shift.includes('Night') ? 'selected' : ''}>Night Bottling (20:00 - 04:00)</option>
                <option value="Full Day (07:00 - 17:00)" ${s.shift.includes('Full Day') ? 'selected' : ''}>Full Day (07:00 - 17:00)</option>
              </select>
            </div>

            <div class="flex gap-2 pt-3">
              <button type="button" id="cancel-shift-btn" class="flex-1 btn btn-outline text-xs py-2">Cancel</button>
              <button type="submit" class="flex-1 btn btn-primary text-xs py-2">Save Shift Roster</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // 5. Add Staff Member Modal
  if (state.activeModal === 'addStaff') {
    return `
      <div class="modal-backdrop">
        <div class="modal-content bg-white text-slate-900 dark:bg-slate-900 dark:text-white p-6 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full relative">
          <div class="flex justify-between items-center mb-4 border-b border-outline-variant pb-3">
            <div>
              <h3 class="font-heading font-extrabold text-lg text-on-surface">Register New Employee</h3>
              <p class="text-xs text-on-surface-variant">Add new staff member to Sakhile Ext7 Roster</p>
            </div>
            <button id="modal-close-btn" class="p-1 rounded text-outline hover:text-on-surface">
              ${getIcon('close', 'svg-icon-md')}
            </button>
          </div>

          <form id="add-staff-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-on-surface mb-1">Full Employee Name</label>
              <input required id="new-staff-name" type="text" placeholder="e.g. Sipho Mabena" class="w-full p-2 bg-surface-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-on-surface" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-on-surface mb-1">Contact Phone</label>
                <input required id="new-staff-phone" type="text" placeholder="+27 82 123 4567" class="w-full p-2 bg-surface-lowest border border-outline-variant rounded font-mono focus:outline-none focus:border-primary text-on-surface" />
              </div>
              <div>
                <label class="block font-semibold text-on-surface mb-1">Designated Role</label>
                <select id="new-staff-role" class="w-full p-2 bg-surface-lowest border border-outline-variant rounded text-on-surface">
                  <option>POS Cashier & Logistics</option>
                  <option>Senior POS Cashier</option>
                  <option>Chemical Inventory Officer</option>
                  <option>Store Manager</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-semibold text-on-surface mb-1">Shift Schedule</label>
              <select id="new-staff-shift" class="w-full p-2 bg-surface-lowest border border-outline-variant rounded font-mono text-on-surface">
                <option>Morning (07:00 - 15:00)</option>
                <option>Afternoon (12:00 - 20:00)</option>
                <option>Night Bottling (20:00 - 04:00)</option>
                <option>Full Day (07:00 - 17:00)</option>
              </select>
            </div>

            <div class="flex gap-2 pt-3">
              <button type="button" id="cancel-add-staff-btn" class="flex-1 btn btn-outline text-xs py-2">Cancel</button>
              <button type="submit" class="flex-1 btn btn-primary text-xs py-2">Add to Roster</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // 6. Reorder PO Modal
  if (state.activeModal === 'reorder' && state.selectedReorderProduct) {
    const p = state.selectedReorderProduct;
    return `
      <div class="modal-backdrop">
        <div class="modal-content bg-white text-slate-900 dark:bg-slate-900 dark:text-white p-6 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full relative">
          <div class="flex justify-between items-center mb-4 border-b border-outline-variant pb-3">
            <div>
              <h3 class="font-heading font-extrabold text-lg text-on-surface">Chemical Works Purchase Order (PO)</h3>
              <p class="text-xs text-on-surface-variant">Reorder raw ingredients & bottles for Sakhile Ext7</p>
            </div>
            <button id="modal-close-btn" class="p-1 rounded text-outline hover:text-on-surface">
              ${getIcon('close', 'svg-icon-md')}
            </button>
          </div>

          <div class="space-y-4 text-xs">
            <div class="p-3 bg-surface-low rounded border border-outline-variant">
              <div class="font-mono text-[10px] text-primary font-bold">${p.sku}</div>
              <div class="font-heading font-bold text-sm text-on-surface">${p.name}</div>
              <div class="text-on-surface-variant mt-1">Current Stock: <span class="font-bold ${p.totalStock <= p.minStock ? 'text-error' : ''}">${p.totalStock} ${p.unit}s</span> (Min: ${p.minStock})</div>
            </div>

            <div>
              <label class="block font-semibold text-on-surface mb-1">Manufacturer / Supplier</label>
              <input type="text" value="${p.supplier}" readonly class="w-full p-2 bg-surface-low border border-outline-variant rounded font-medium text-on-surface" />
            </div>

            <div>
              <label class="block font-semibold text-on-surface mb-1">Reorder Quantity (${p.unit}s)</label>
              <input id="po-qty-input" type="number" value="${p.minStock * 4}" class="w-full p-2 bg-surface-lowest border border-outline-variant rounded font-mono font-bold text-sm focus:outline-none focus:border-primary text-on-surface" />
            </div>

            <div class="flex gap-2 pt-2">
              <button id="cancel-po-btn" class="flex-1 btn btn-outline text-xs py-2">Cancel</button>
              <button id="confirm-po-btn" class="flex-1 btn btn-primary text-xs py-2">Submit Purchase Order</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 7. Add Product Modal
  if (state.activeModal === 'addProduct') {
    return `
      <div class="modal-backdrop">
        <div class="modal-content bg-white text-slate-900 dark:bg-slate-900 dark:text-white p-6 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full relative">
          <div class="flex justify-between items-center mb-4 border-b border-outline-variant pb-3">
            <div>
              <h3 class="font-heading font-extrabold text-lg text-on-surface">Add New Detergent Product</h3>
              <p class="text-xs text-on-surface-variant">Register new chemical product SKU into Rulership catalog</p>
            </div>
            <button id="modal-close-btn" class="p-1 rounded text-outline hover:text-on-surface">
              ${getIcon('close', 'svg-icon-md')}
            </button>
          </div>

          <form id="add-product-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-on-surface mb-1">Detergent Product Title</label>
              <input required id="new-prod-name" type="text" placeholder="e.g. 2L Heavy Duty Pine Gel" class="w-full p-2 bg-surface-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-on-surface" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-on-surface mb-1">SKU Code</label>
                <input id="new-prod-sku" type="text" placeholder="DET-PINE-2L" class="w-full p-2 bg-surface-lowest border border-outline-variant rounded font-mono focus:outline-none focus:border-primary text-on-surface" />
              </div>
              <div>
                <label class="block font-semibold text-on-surface mb-1">Numeric Barcode (EAN-13)</label>
                <input id="new-prod-barcode" type="text" placeholder="2024699900018" class="w-full p-2 bg-surface-lowest border border-outline-variant rounded font-mono focus:outline-none focus:border-primary text-on-surface" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-on-surface mb-1">Retail Price (R)</label>
                <input required id="new-prod-price" type="number" step="0.01" value="69.99" class="w-full p-2 bg-surface-lowest border border-outline-variant rounded font-mono focus:outline-none focus:border-primary text-on-surface" />
              </div>
              <div>
                <label class="block font-semibold text-on-surface mb-1">Initial Stock</label>
                <input required id="new-prod-stock" type="number" placeholder="200" class="w-full p-2 bg-surface-lowest border border-outline-variant rounded font-mono focus:outline-none focus:border-primary text-on-surface" />
              </div>
              <div>
                <label class="block font-semibold text-on-surface mb-1">Min Threshold</label>
                <input required id="new-prod-min" type="number" placeholder="30" class="w-full p-2 bg-surface-lowest border border-outline-variant rounded font-mono focus:outline-none focus:border-primary text-on-surface" />
              </div>
            </div>

            <div class="flex gap-2 pt-3">
              <button type="button" id="cancel-add-btn" class="flex-1 btn btn-outline text-xs py-2">Cancel</button>
              <button type="submit" class="flex-1 btn btn-primary text-xs py-2">Register Product</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  return '';
}

export function bindModalEvents() {
  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  const cancelPayBtn = document.getElementById('cancel-pay-btn');
  if (cancelPayBtn) cancelPayBtn.addEventListener('click', closeModal);

  const closeReceiptBtn = document.getElementById('close-receipt-btn');
  if (closeReceiptBtn) closeReceiptBtn.addEventListener('click', closeModal);

  const printReceiptBtn = document.getElementById('print-receipt-btn');
  if (printReceiptBtn) {
    printReceiptBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const cancelBarcodeBtn = document.getElementById('cancel-barcode-btn');
  if (cancelBarcodeBtn) cancelBarcodeBtn.addEventListener('click', closeModal);

  const printBarcodesBtn = document.getElementById('print-barcodes-btn');
  if (printBarcodesBtn) {
    printBarcodesBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const tenderInput = document.getElementById('tender-input');
  if (tenderInput) {
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    tenderInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      const changeEl = document.getElementById('change-due-val');
      if (changeEl) {
        changeEl.innerText = formatCurrency(Math.max(0, val - total));
      }
    });
  }

  const confirmPayBtn = document.getElementById('confirm-pay-btn');
  if (confirmPayBtn) {
    confirmPayBtn.addEventListener('click', () => {
      const val = parseFloat(document.getElementById('tender-input')?.value || '0');
      completePayment(val, 'Cash');
    });
  }

  const editShiftForm = document.getElementById('edit-shift-form');
  if (editShiftForm) {
    editShiftForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newRole = document.getElementById('edit-staff-role').value;
      const newShift = document.getElementById('edit-staff-shift').value;
      if (state.selectedStaffToEdit) {
        updateStaffShift(state.selectedStaffToEdit.id, newShift, newRole);
      }
    });
  }
  const cancelShiftBtn = document.getElementById('cancel-shift-btn');
  if (cancelShiftBtn) cancelShiftBtn.addEventListener('click', closeModal);

  const addStaffForm = document.getElementById('add-staff-form');
  if (addStaffForm) {
    addStaffForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addStaffMember({
        name: document.getElementById('new-staff-name').value,
        phone: document.getElementById('new-staff-phone').value,
        role: document.getElementById('new-staff-role').value,
        shift: document.getElementById('new-staff-shift').value
      });
    });
  }
  const cancelAddStaffBtn = document.getElementById('cancel-add-staff-btn');
  if (cancelAddStaffBtn) cancelAddStaffBtn.addEventListener('click', closeModal);

  const confirmPoBtn = document.getElementById('confirm-po-btn');
  if (confirmPoBtn) {
    confirmPoBtn.addEventListener('click', () => {
      alert('Chemical raw materials purchase order submitted successfully!');
      closeModal();
    });
  }
  const cancelPoBtn = document.getElementById('cancel-po-btn');
  if (cancelPoBtn) cancelPoBtn.addEventListener('click', closeModal);

  const addForm = document.getElementById('add-product-form');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addNewProduct({
        name: document.getElementById('new-prod-name').value,
        sku: document.getElementById('new-prod-sku').value,
        barcode: document.getElementById('new-prod-barcode')?.value,
        category: document.getElementById('new-prod-cat').value,
        price: document.getElementById('new-prod-price').value,
        initialStock: document.getElementById('new-prod-stock').value,
        minStock: document.getElementById('new-prod-min').value
      });
    });
  }
  const cancelAddBtn = document.getElementById('cancel-add-btn');
  if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeModal);
}
