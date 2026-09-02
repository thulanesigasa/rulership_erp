/**
 * Dedicated Barcode Registry & Product Database for Rulership LTD PTY
 * Single Branch Facility: Sakhile, Ext7
 * Maps Barcode Numbers, Product Codes (SKUs), Categories, Prices, and Stock
 */

export const BARCODE_DATABASE = [
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

export function lookupBarcode(rawQuery) {
  if (!rawQuery) return null;
  const q = String(rawQuery).trim().toLowerCase();

  return BARCODE_DATABASE.find(item => 
    item.barcode.toLowerCase() === q ||
    (item.legacyBarcode && item.legacyBarcode.toLowerCase() === q) ||
    item.sku.toLowerCase() === q ||
    q.includes(item.barcode.toLowerCase()) ||
    (item.legacyBarcode && q.includes(item.legacyBarcode.toLowerCase())) ||
    q.includes(item.sku.toLowerCase()) ||
    item.name.toLowerCase().includes(q)
  );
}
