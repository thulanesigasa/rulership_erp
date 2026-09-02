/**
 * Shared Product Catalog — Rulership LTD PTY
 * Single Branch: Sakhile, Ext7
 *
 * THIS IS THE SINGLE SOURCE OF TRUTH for all product definitions.
 * Both the Web App (src/js/storeState.js) and the Mobile App
 * (app/src/store/barcodeDatabase.js) import from here.
 *
 * Any change to a product name, barcode, SKU, price, or category
 * MUST be made here — it will automatically propagate to both apps.
 *
 * Stock levels are RUNTIME values managed by each app independently
 * (Web: localStorage, Mobile: AsyncStorage). The initialStock here
 * is only used on first load / after a reset.
 */

export const PRODUCT_CATALOG = [
  {
    id: 'det-1',
    sku: 'DET-PINE-2L',
    barcode: '2024699900018',
    name: '2L Pine Gel Concentrated Cleaner',
    category: 'Pine Gels',
    price: 69.99,
    unit: 'bottle',
    initialStock: 12, // User's real count
    minStock: 80,
    status: 'In Stock',
    supplier: 'Rulership Chemical Works',
  },
  {
    id: 'det-2',
    sku: 'DET-DWL-2L',
    barcode: '2024699900025',
    name: '2L Dish Washing Liquid',
    category: 'Dishwashing',
    price: 69.99,
    unit: 'bottle',
    initialStock: 11, // User's real count
    minStock: 100,
    status: 'In Stock',
    supplier: 'Rulership Chemical Works',
  },
  {
    id: 'det-3',
    sku: 'DET-MPC-2L',
    barcode: '2024699900032',
    aliases: ['8142519014016'], // The real encoded value of the placeholder SVG bars
    name: '2L Multi-Purpose Surface Cleaner',
    category: 'Surface Cleaners',
    price: 69.99,
    unit: 'bottle',
    initialStock: 13, // User's real count
    minStock: 50,
    status: 'In Stock',
    supplier: 'Rulership Chemical Works',
  },
  {
    id: 'det-4',
    sku: 'DET-BLC-2L',
    barcode: '2024699900049',
    name: '2L Thick Hygiene Bleach',
    category: 'Bleach & Hygiene',
    price: 69.99,
    unit: 'bottle',
    initialStock: 0,
    minStock: 60,
    status: 'Out of Stock',
    supplier: 'Rulership Chemical Works',
  },
  {
    id: 'det-5',
    sku: 'DET-CAR-2L',
    barcode: '2024699900056',
    name: '2L High-Foam Car Shampoo',
    category: 'Auto Care',
    price: 69.99,
    unit: 'bottle',
    initialStock: 0,
    minStock: 30,
    status: 'Out of Stock',
    supplier: 'Rulership Chemical Works',
  },
  {
    id: 'det-6',
    sku: 'DET-SOFT-2L',
    barcode: '2024699900063',
    name: '2L Fabric Softener Spring Fresh',
    category: 'Laundry',
    price: 69.99,
    unit: 'bottle',
    initialStock: 0,
    minStock: 50,
    status: 'Out of Stock',
    supplier: 'Rulership Chemical Works',
  }
];

/**
 * Lookup a product by its barcode or SKU — exact match only.
 * Used by the mobile barcode scanner.
 */
export function lookupByBarcode(rawQuery) {
  if (!rawQuery) return null;
  const clean = String(rawQuery).trim();
  return PRODUCT_CATALOG.find(p => {
    // Check main barcode or aliases
    if (p.barcode === clean) return true;
    if (p.aliases && p.aliases.includes(clean)) return true;
    if (p.sku.toLowerCase() === clean.toLowerCase()) return true;
    return false;
  }) || null;
}

/**
 * Build a mobile-ready product record (with runtime stock field).
 * Mobile starts from initialStock on fresh load.
 */
export function toMobileProduct(catalogEntry) {
  return {
    ...catalogEntry,
    stock: catalogEntry.initialStock,
    branchStock: { 'Sakhile, Ext7': catalogEntry.initialStock }
  };
}

/**
 * Build a web-ready product record (with totalStock + branchStock fields).
 * Web starts from initialStock on fresh load.
 */
export function toWebProduct(catalogEntry) {
  return {
    ...catalogEntry,
    totalStock: catalogEntry.initialStock,
    branchStock: { 'Sakhile, Ext7': catalogEntry.initialStock }
  };
}
