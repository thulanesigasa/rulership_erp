import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCT_CATALOG } from '../app/src/store/sharedProductCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE = path.join(__dirname, 'inventoryState.json');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize state file if it doesn't exist
function initDB() {
  if (!fs.existsSync(STATE_FILE)) {
    const initialState = PRODUCT_CATALOG.map(p => ({
      id: p.id,
      stock: p.initialStock
    }));
    fs.writeFileSync(STATE_FILE, JSON.stringify(initialState, null, 2), 'utf-8');
  }
}

// Read current stock
function readDB() {
  initDB();
  const raw = fs.readFileSync(STATE_FILE, 'utf-8');
  return JSON.parse(raw);
}

// Write stock
function writeDB(data) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/inventory -> Returns full catalog merged with current live stock
app.get('/api/inventory', (req, res) => {
  const stockData = readDB();
  const merged = PRODUCT_CATALOG.map(cat => {
    const live = stockData.find(s => s.id === cat.id);
    const stockLevel = live ? live.stock : cat.initialStock;
    return {
      ...cat,
      totalStock: stockLevel,
      stock: stockLevel, // Mobile uses 'stock'
      branchStock: { 'Sakhile, Ext7': stockLevel },
      status: stockLevel > 0 ? 'In Stock' : 'Out of Stock'
    };
  });
  res.json(merged);
});

// POST /api/inventory/stock -> Adjust stock by delta (+ or -)
app.post('/api/inventory/stock', (req, res) => {
  const { id, delta } = req.body;
  if (!id || typeof delta !== 'number') {
    return res.status(400).json({ error: 'Missing id or delta' });
  }

  const stockData = readDB();
  const item = stockData.find(s => s.id === id);
  if (item) {
    item.stock = Math.max(0, item.stock + delta); // Prevent negative
  } else {
    // If not found, add to tracking
    stockData.push({ id, stock: Math.max(0, delta) });
  }

  writeDB(stockData);
  res.json({ success: true, newStock: item ? item.stock : delta });
});

// POST /api/inventory/reset -> Resets to initial catalog state
app.post('/api/inventory/reset', (req, res) => {
  if (fs.existsSync(STATE_FILE)) {
    fs.unlinkSync(STATE_FILE);
  }
  initDB();
  res.json({ success: true, message: 'Inventory reset to initial catalog values' });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Sync API running at http://0.0.0.0:${PORT}`);
  console.log(`   (Web and Mobile devices on LAN can connect)`);
});
