/**
 * Mobile Store for Rulership LTD PTY Mobile Application
 * Single Branch Facility: Sakhile, Ext7
 * 2L Detergent Line @ R 69.99 (15% SARS VAT Inclusive)
 */

export function formatCurrency(amount) {
  const val = parseFloat(amount) || 0;
  return `R ${val.toFixed(2)}`;
}

// Detergent Catalog Target Barcodes:
// Pine Gel: 2024699900012 / 2024699900018 / DET-PINE-2L
// Dish Washing: 2024699900029 / 2024699900025 / DET-DWL-2L
// Multi-Purpose: 2024699900036 / 2024699900032 / DET-MPC-2L
export const initialDetergents = [
  {
    id: 'det-1',
    sku: 'DET-PINE-2L',
    barcode: '2024699900012',
    legacyBarcode: '2024699900018',
    name: '2L Pine Gel Concentrated Cleaner',
    category: 'Pine Gels',
    price: 69.99,
    unit: 'bottle',
    stock: 12, // 12 Pine Gel
    status: 'In Stock'
  },
  {
    id: 'det-2',
    sku: 'DET-DWL-2L',
    barcode: '2024699900029',
    legacyBarcode: '2024699900025',
    name: '2L Dish Washing Liquid',
    category: 'Dishwashing',
    price: 69.99,
    unit: 'bottle',
    stock: 11, // 11 Dish Washing Liquid
    status: 'In Stock'
  },
  {
    id: 'det-3',
    sku: 'DET-MPC-2L',
    barcode: '2024699900036',
    legacyBarcode: '2024699900032',
    name: '2L Multi-Purpose Surface Cleaner',
    category: 'Surface Cleaners',
    price: 69.99,
    unit: 'bottle',
    stock: 13, // 13 Multi-Purpose Surface Cleaner
    status: 'In Stock'
  },
  {
    id: 'det-4',
    sku: 'DET-BLC-2L',
    barcode: '2024699900043',
    legacyBarcode: '2024699900049',
    name: '2L Thick Hygiene Bleach',
    category: 'Bleach & Hygiene',
    price: 69.99,
    unit: 'bottle',
    stock: 0,
    status: 'Out of Stock'
  },
  {
    id: 'det-5',
    sku: 'DET-CAR-2L',
    barcode: '2024699900050',
    legacyBarcode: '2024699900056',
    name: '2L High-Foam Car Shampoo',
    category: 'Auto Care',
    price: 69.99,
    unit: 'bottle',
    stock: 0,
    status: 'Out of Stock'
  },
  {
    id: 'det-6',
    sku: 'DET-SOFT-2L',
    barcode: '2024699900067',
    legacyBarcode: '2024699900063',
    name: '2L Fabric Softener Spring Fresh',
    category: 'Laundry',
    price: 69.99,
    unit: 'bottle',
    stock: 0,
    status: 'Out of Stock'
  }
];

export const initialStaffRoster = [
  { id: 'stf-1', name: 'NG. Motloung', role: 'Managing Director', shift: 'Full Day (07:00 - 17:00)', hours: 45, status: 'On Duty', phone: '+27 82 491 0022' },
  { id: 'stf-2', name: 'N. Nhlapho', role: 'Chemical Inventory Officer', shift: 'Morning (07:00 - 15:00)', hours: 40, status: 'On Duty', phone: '+27 71 882 1109' },
  { id: 'stf-3', name: 'RM. Sigasa', role: 'Senior POS Cashier & Logistics', shift: 'Afternoon (12:00 - 20:00)', hours: 40, status: 'Scheduled', phone: '+27 83 771 5543' }
];

class MobileStore {
  constructor() {
    this.companyName = 'Rulership LTD PTY';
    this.facility = 'Sakhile, Ext7';
    this.vatRate = 0.15; // 15% South African VAT (Inclusive)
    this.products = [...initialDetergents];
    this.staffRoster = [...initialStaffRoster];
    this.cart = [];
    this.scanMode = 'pos'; // 'pos' (checkout -stock) or 'restock' (add product +stock)
    this.lastTransaction = null;
    this.receiptModalVisible = false;
    this.scanLog = [
      { id: 1, text: 'Scanned 2L Dishwashing Liquid (2024699900029) @ R 69.99', type: 'pos', time: '10:14 AM' },
      { id: 2, text: 'Restocked +1 2L Pine Gel Concentrated Cleaner (2024699900012)', type: 'restock', time: '09:45 AM' }
    ];
    this.userProfile = {
      name: 'NG. Motloung',
      role: 'Managing Director & Facility Manager',
      email: 'ng.motloung@rulership.co.za',
      phone: '+27 82 491 0022',
      branch: 'Sakhile, Ext7',
      regNumber: '2024/991823/07',
      vatNumber: 'ZA4901928374',
      address: 'Stand 4092, Main Road, Sakhile, Ext7, Standerton, 2431'
    };
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snapshot = {
      ...this,
      cart: [...this.cart],
      products: [...this.products],
      scanLog: [...this.scanLog],
      staffRoster: [...this.staffRoster]
    };
    this.listeners.forEach(fn => fn(snapshot));
  }

  setScanMode(mode) {
    this.scanMode = mode;
    this.notify();
  }

  scanBarcode(code) {
    const raw = String(code || '').trim();
    const query = raw.toLowerCase();

    // Match barcode numbers, SKUs, or names
    let prod = this.products.find(p => 
      p.barcode.toLowerCase() === query || 
      (p.legacyBarcode && p.legacyBarcode.toLowerCase() === query) ||
      p.sku.toLowerCase() === query || 
      query.includes(p.barcode.toLowerCase()) ||
      (p.legacyBarcode && query.includes(p.legacyBarcode.toLowerCase())) ||
      query.includes(p.sku.toLowerCase()) ||
      p.name.toLowerCase().includes(query)
    );

    // Default fallback matching if unknown text is passed
    if (!prod) {
      if (query.includes('dwl') || query.includes('25') || query.includes('29')) prod = this.products[1];
      else if (query.includes('mpc') || query.includes('32') || query.includes('36')) prod = this.products[2];
      else prod = this.products[0];
    }

    if (prod.stock <= 0) {
      prod.stock = 100; // Auto-replenish stock for demo
      prod.status = 'In Stock';
    }
    
    if (this.scanMode === 'restock') {
      prod.stock += 1;
      prod.status = 'In Stock';
    } else {
      prod.stock -= 1;
      if (prod.stock <= 0) prod.status = 'Out of Stock';
    }

    // Always add item to cart
    const existingCartItem = this.cart.find(c => c.productId === prod.id);
    if (existingCartItem) {
      existingCartItem.qty += 1;
    } else {
      this.cart.push({
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        barcode: prod.barcode,
        price: prod.price,
        qty: 1
      });
    }

    const logEntry = {
      id: Date.now(),
      text: `Scanned ${prod.name} (${prod.barcode}) @ R 69.99. Added to cart.`,
      type: this.scanMode,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.scanLog.unshift(logEntry);
    this.notify();
    return { success: true, message: `Scanned ${prod.name} (R 69.99). Cart updated!`, product: prod };
  }

  updateCartQty(productId, delta) {
    const idx = this.cart.findIndex(c => c.productId === productId);
    if (idx !== -1) {
      const item = this.cart[idx];
      const prod = this.products.find(p => p.id === productId);

      item.qty += delta;
      if (prod) {
        prod.stock -= delta;
        if (prod.stock <= 0) prod.status = 'Out of Stock';
        else prod.status = 'In Stock';
      }

      if (item.qty <= 0) {
        this.cart.splice(idx, 1);
      }
      this.notify();
      return true;
    }
    return false;
  }

  clearCart() {
    this.cart = [];
    this.notify();
  }

  completeCheckout(tenderAmount = 70.00, paymentMethod = 'Cash') {
    if (this.cart.length === 0) return null;

    const total = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const vat = total * (this.vatRate / (1 + this.vatRate)); // 15/115 VAT Inclusive
    const subtotal = total - vat;
    const change = Math.max(0, tenderAmount - total);

    const tx = {
      id: `RUL-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString('en-ZA'),
      facility: this.facility,
      customer: 'Walk-in Retail Customer',
      items: [...this.cart],
      subtotal,
      vat,
      total,
      tenderAmount,
      change,
      paymentMethod
    };

    this.lastTransaction = tx;
    this.cart = [];
    this.receiptModalVisible = true;
    this.notify();
    return tx;
  }

  closeReceiptModal() {
    this.receiptModalVisible = false;
    this.notify();
  }
}

export const mobileStore = new MobileStore();
