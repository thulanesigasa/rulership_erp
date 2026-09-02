/**
 * StoreState - Reactive Central Store for Rulership LTD PTY
 * Single Branch Facility: Sakhile, Ext7
 * 2L Detergent Line at R 69.99 (VAT Inclusive)
 */

export function formatCurrency(amount) {
  const val = parseFloat(amount) || 0;
  return `R ${val.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const initialDetergents = [
  {
    id: 'det-1',
    sku: 'DET-PINE-2L',
    barcode: '2024699900018',
    name: '2L Pine Gel Concentrated Cleaner',
    category: 'Pine Gels',
    price: 69.99,
    unit: 'bottle',
    totalStock: 12,
    minStock: 80,
    status: 'In Stock',
    supplier: 'Rulership Chemical Works',
    branchStock: { 'Sakhile, Ext7': 12 }
  },
  {
    id: 'det-2',
    sku: 'DET-DWL-2L',
    barcode: '2024699900025',
    name: '2L Dish Washing Liquid',
    category: 'Dishwashing',
    price: 69.99,
    unit: 'bottle',
    totalStock: 11,
    minStock: 100,
    status: 'In Stock',
    supplier: 'Rulership Chemical Works',
    branchStock: { 'Sakhile, Ext7': 11 }
  },
  {
    id: 'det-3',
    sku: 'DET-MPC-2L',
    barcode: '2024699900032',
    name: '2L Multi-Purpose Surface Cleaner',
    category: 'Surface Cleaners',
    price: 69.99,
    unit: 'bottle',
    totalStock: 13,
    minStock: 50,
    status: 'In Stock',
    supplier: 'Rulership Chemical Works',
    branchStock: { 'Sakhile, Ext7': 13 }
  },
  {
    id: 'det-4',
    sku: 'DET-BLC-2L',
    barcode: '2024699900049',
    name: '2L Thick Hygiene Bleach',
    category: 'Bleach & Hygiene',
    price: 69.99,
    unit: 'bottle',
    totalStock: 0,
    minStock: 60,
    status: 'Out of Stock',
    supplier: 'Rulership Chemical Works',
    branchStock: { 'Sakhile, Ext7': 0 }
  },
  {
    id: 'det-5',
    sku: 'DET-CAR-2L',
    barcode: '2024699900056',
    name: '2L High-Foam Car Shampoo',
    category: 'Auto Care',
    price: 69.99,
    unit: 'bottle',
    totalStock: 0,
    minStock: 30,
    status: 'Out of Stock',
    supplier: 'Rulership Chemical Works',
    branchStock: { 'Sakhile, Ext7': 0 }
  },
  {
    id: 'det-6',
    sku: 'DET-SOFT-2L',
    barcode: '2024699900063',
    name: '2L Fabric Softener Spring Fresh',
    category: 'Laundry',
    price: 69.99,
    unit: 'bottle',
    totalStock: 0,
    minStock: 50,
    status: 'Out of Stock',
    supplier: 'Rulership Chemical Works',
    branchStock: { 'Sakhile, Ext7': 0 }
  }
];

const initialCart = [
  { productId: 'det-2', name: '2L Dish Washing Liquid', sku: 'DET-DWL-2L', barcode: '2024699900025', qty: 1, price: 69.99 }
];

const initialRoster = [
  { id: 'stf-1', name: 'NG. Motloung', role: 'Managing Director', shift: 'Full Day (07:00 - 17:00)', hours: 45, status: 'On Duty', phone: '+27 82 491 0022' },
  { id: 'stf-2', name: 'N. Nhlapho', role: 'Chemical Inventory Officer', shift: 'Morning (07:00 - 15:00)', hours: 40, status: 'On Duty', phone: '+27 71 882 1109' },
  { id: 'stf-3', name: 'RM. Sigasa', role: 'Senior POS Cashier & Logistics', shift: 'Afternoon (12:00 - 20:00)', hours: 40, status: 'Scheduled', phone: '+27 83 771 5543' }
];

export const state = {
  companyName: 'Rulership LTD PTY',
  companySubtitle: 'LTD PTY',
  activeBranch: 'Sakhile, Ext7',
  branchOptions: ['Sakhile, Ext7'],
  activeTab: 'dashboard',
  themeMode: 'light',
  globalSearch: '',
  posCategoryFilter: 'All',
  chartTimeframe: 'daily', // 'daily' | 'weekly' | 'monthly'
  vatRate: 0.15, // 15% South African VAT (Inclusive)
  products: initialDetergents,
  cart: initialCart,
  selectedCustomer: 'Walk-in Retail Customer',
  selectedInventoryProductId: 'det-1',
  activeModal: null, // null | 'pay' | 'reorder' | 'addProduct' | 'receipt' | 'editShift' | 'addStaff' | 'barcodeSheet'
  selectedReorderProduct: null,
  selectedStaffToEdit: null,
  lastTransaction: null,

  userProfile: {
    name: 'NG. Motloung',
    role: 'Managing Director & Facility Manager',
    email: 'ng.motloung@rulership.co.za',
    phone: '+27 82 491 0022',
    branch: 'Sakhile, Ext7',
    regNumber: '2024/991823/07',
    vatNumber: 'ZA4901928374',
    address: 'Stand 4092, Main Road, Sakhile, Ext7, Standerton, 2431'
  },

  staffRoster: initialRoster,

  activityStream: [
    { id: 1, type: 'sale', text: 'Retail sale (2L Dishwashing @ R 69.99 VAT Incl.) completed at Sakhile Ext7.', time: '5 mins ago', badgeColor: 'secondary' },
    { id: 2, type: 'shift', text: 'Shift roster updated for RM. Sigasa by Manager NG. Motloung.', time: '30 mins ago', badgeColor: 'primary' },
    { id: 3, type: 'stock', text: 'Stock alert: 3 primary 2L items in stock; bleach, car shampoo & fabric softener currently Out of Stock.', time: '1 hr ago', badgeColor: 'warning' },
    { id: 4, type: 'audit', text: 'Monthly VAT 15% report compiled by Director NG. Motloung.', time: '2 hrs ago', badgeColor: 'primary' }
  ]
};

const listeners = new Set();

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notify() {
  listeners.forEach(fn => fn(state));
}

// Actions
export function setActiveTab(tab) {
  state.activeTab = tab;
  notify();
}

export function setActiveBranch(branch) {
  state.activeBranch = branch;
  notify();
}

export function toggleTheme() {
  state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
  document.documentElement.className = state.themeMode;
  notify();
}

export function setGlobalSearch(query) {
  state.globalSearch = query;
  notify();
}

export function setPosCategoryFilter(cat) {
  state.posCategoryFilter = cat;
  notify();
}

export function setChartTimeframe(tf) {
  state.chartTimeframe = tf;
  notify();
}

export function addToCart(product) {
  if (product.status === 'Out of Stock' || product.totalStock <= 0) {
    alert(`${product.name} is currently Out of Stock!`);
    return;
  }
  const existing = state.cart.find(item => item.productId === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      qty: 1,
      price: product.price
    });
  }
  notify();
}

export function updateCartQty(productId, delta) {
  const idx = state.cart.findIndex(item => item.productId === productId);
  if (idx !== -1) {
    state.cart[idx].qty += delta;
    if (state.cart[idx].qty <= 0) {
      state.cart.splice(idx, 1);
    }
  }
  notify();
}

export function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.productId !== productId);
  notify();
}

export function clearCart() {
  state.cart = [];
  notify();
}

export function setSelectedCustomer(cust) {
  state.selectedCustomer = cust;
  notify();
}

export function setSelectedInventoryProduct(id) {
  state.selectedInventoryProductId = id;
  notify();
}

export function openModal(modalName, payload = null) {
  state.activeModal = modalName;
  if (modalName === 'reorder') {
    state.selectedReorderProduct = payload;
  }
  if (modalName === 'editShift') {
    state.selectedStaffToEdit = payload;
  }
  notify();
}

export function closeModal() {
  state.activeModal = null;
  state.selectedReorderProduct = null;
  state.selectedStaffToEdit = null;
  notify();
}

export function completePayment(tenderAmount, paymentMethod = 'Cash') {
  // Retail price is VAT INCLUSIVE (e.g. R 69.99)
  const total = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const vat = total * (state.vatRate / (1 + state.vatRate)); // SARS 15/115 inclusive portion
  const subtotalExclVat = total - vat;
  const change = Math.max(0, tenderAmount - total);

  const tx = {
    id: `RUL-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toLocaleString('en-ZA'),
    branch: state.activeBranch,
    customer: state.selectedCustomer,
    items: [...state.cart],
    subtotal: subtotalExclVat,
    vat: vat,
    total: total,
    tenderAmount: tenderAmount,
    change: change,
    paymentMethod
  };

  state.lastTransaction = tx;
  state.cart = [];
  state.activityStream.unshift({
    id: Date.now(),
    type: 'sale',
    text: `Completed transaction ${tx.id} (${formatCurrency(tx.total)}) via ${paymentMethod}.`,
    time: 'Just now',
    badgeColor: 'secondary'
  });

  state.activeModal = 'receipt';
  notify();
}

export function addNewProduct(newProd) {
  const prod = {
    id: `det-${Date.now()}`,
    sku: newProd.sku || `DET-2L-${Math.floor(100 + Math.random() * 900)}`,
    barcode: newProd.barcode || `2024699900${Math.floor(10 + Math.random() * 89)}`,
    name: newProd.name,
    category: newProd.category,
    price: parseFloat(newProd.price || '69.99'),
    unit: 'bottle',
    totalStock: parseInt(newProd.initialStock, 10),
    minStock: parseInt(newProd.minStock, 10),
    status: parseInt(newProd.initialStock, 10) > 0 ? 'In Stock' : 'Out of Stock',
    supplier: newProd.supplier || 'Rulership Chemical Works',
    branchStock: {
      'Sakhile, Ext7': parseInt(newProd.initialStock, 10)
    }
  };

  state.products.unshift(prod);
  state.selectedInventoryProductId = prod.id;
  closeModal();
  notify();
}

export function updateStaffShift(staffId, newShift, newRole) {
  const staff = state.staffRoster.find(s => s.id === staffId);
  if (staff) {
    if (newShift) staff.shift = newShift;
    if (newRole) staff.role = newRole;
    state.activityStream.unshift({
      id: Date.now(),
      type: 'shift',
      text: `Shift updated for ${staff.name} (${staff.role}) to '${staff.shift}'.`,
      time: 'Just now',
      badgeColor: 'primary'
    });
  }
  closeModal();
  notify();
}

export function addStaffMember(newStaff) {
  const stf = {
    id: `stf-${Date.now()}`,
    name: newStaff.name,
    role: newStaff.role || 'POS Cashier & Logistics',
    shift: newStaff.shift || 'Morning (07:00 - 15:00)',
    hours: parseInt(newStaff.hours || '40', 10),
    status: 'Scheduled',
    phone: newStaff.phone || '+27 71 000 0000'
  };
  state.staffRoster.push(stf);
  closeModal();
  notify();
}

export async function syncWebWithServer() {
  try {
    const res = await fetch('http://localhost:3001/api/inventory');
    if (res.ok) {
      const data = await res.json();
      let changed = false;
      data.forEach(item => {
        const prod = state.detergents.find(d => d.id === item.id);
        if (prod && prod.totalStock !== item.totalStock) {
          prod.totalStock = item.totalStock;
          prod.status = item.status;
          prod.branchStock = { 'Sakhile, Ext7': item.totalStock };
          changed = true;
        }
      });
      if (changed) notify();
    }
  } catch (e) {
    // API server offline or not running
  }
}

// Initial sync and poll every 1.5 seconds for live real-time sync with mobile app
syncWebWithServer();
setInterval(syncWebWithServer, 1500);
