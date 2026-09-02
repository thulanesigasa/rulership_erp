/**
 * Dedicated Barcode Registry & Product Database for Rulership LTD PTY
 * Single Branch Facility: Sakhile, Ext7
 * 
 * Imports canonical product data from the shared product catalog
 * to ensure web and mobile use the exact same barcodes.
 */
import { PRODUCT_CATALOG, lookupByBarcode } from './sharedProductCatalog';

// We export a mobile-specific format of the catalog (with runtime 'stock' field)
export const BARCODE_DATABASE = PRODUCT_CATALOG.map(p => ({
  ...p,
  stock: p.initialStock,
  branchStock: { 'Sakhile, Ext7': p.initialStock }
}));

/**
 * Exact match lookup only.
 */
export function lookupBarcode(rawQuery) {
  // Uses the shared exact-match lookup function
  const match = lookupByBarcode(rawQuery);
  if (!match) return null;
  // Return the mobile-formatted version of the match
  return BARCODE_DATABASE.find(p => p.id === match.id) || null;
}

/**
 * Returns a human-readable label for an unrecognised barcode
 * so the UI can tell the cashier what was scanned vs what failed.
 */
export function describeUnknown(rawQuery) {
  return `Unknown barcode: "${rawQuery}" — not in product registry`;
}
