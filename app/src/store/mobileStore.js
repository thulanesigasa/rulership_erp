/**
 * Mobile Store for Rulership LTD PTY Mobile Application
 * Single Branch Facility: Sakhile, Ext7
 * 2L Detergent Line @ R 69.99 (15% SARS VAT Inclusive)
 */

import { BARCODE_DATABASE, lookupBarcode } from './barcodeDatabase';

export function formatCurrency(amount) {
  const val = parseFloat(amount) || 0;
  return `R ${val.toFixed(2)}`;
}

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
    this.products = [...BARCODE_DATABASE];
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
    const matchedRecord = lookupBarcode(code);
    
    let prod = null;
    if (matchedRecord) {
      prod = this.products.find(p => p.id === matchedRecord.id);
    }
    
    // Fallback if unknown code passed
    if (!prod) {
      const q = String(code || '').toLowerCase();
      if (q.includes('dwl') || q.includes('25') || q.includes('29')) prod = this.products[1];
      else if (q.includes('mpc') || q.includes('32') || q.includes('36')) prod = this.products[2];
      else prod = this.products[0];
    }

    if (prod.stock <= 0) {
      prod.stock = 100; // Replenish stock for demo
      prod.status = 'In Stock';
    }
    
    if (this.scanMode === 'restock') {
      prod.stock += 1;
      prod.status = 'In Stock';
    } else {
      prod.stock -= 1;
      if (prod.stock <= 0) prod.status = 'Out of Stock';
    }

    // Always push item to cart in POS Payment Mode
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
    return { success: true, message: `Scanned ${prod.name} (R 69.99). Added to cart!`, product: prod };
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
