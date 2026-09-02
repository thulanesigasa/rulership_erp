# Rulership LTD PTY - Enterprise ERP & Chemical Inventory System

An executive Enterprise Resource Planning (ERP) and Mobile Point-of-Sale (POS) Inventory System for **Rulership LTD PTY**, specialized in 2L detergent manufacturing, sales, SARS 15% VAT calculation, thermal receipt printing, and shift roster management at the **Sakhile Ext7 Facility**.

---

## 🌟 Key Features

1. **Dual System Architecture**:
   - **Web ERP System**: Executive analytics dashboard, sales reports, inventory catalog, shift roster, and thermal receipt printing.
   - **React Native & Expo SDK 57 Mobile App (`app/`)**: Full mobile POS checkout, restock scanner, live mobile camera barcode scanner, and director credentials profile.

2. **60-30-10 Design System**:
   - Strictly enforces the 60-30-10 design system rules (60% Neutral Slate `#f8fafc`/`#0f172a`, 30% Structural Blue `#ffffff`/`#e2e8f0`, 10% Royal Accent `#0058be`/`#0284c7`).
   - SVG vector shapes from svgrepo.com. Zero emojis or hover glow animations.

3. **Live Camera & 13-Digit Barcode Scanner**:
   - Live edge-to-edge camera stream with an animated royal blue laser bar gliding UP and DOWN (`expo-camera`).
   - Auto-scans and resolves target bottle barcodes (`2024699900012` Pine Gel, `2024699900029` Dish Washing, `2024699900036` Multi-Purpose Cleaner).

4. **Tax & Financial Compliance**:
   - Automated 15% South African Output VAT calculation (`15/115 VAT Inclusive`).
   - Digital & physical thermal sales receipt rendering with South African Rand (ZAR / R) formatting.

---

## 📁 Project Structure

```
inventorymanagementsystem/
├── app/                             # React Native & Expo SDK 57 Mobile Application
│   ├── assets/                      # Application icons & splash screen graphics
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppModal.jsx         # Universal 60-30-10 themed popup dialog component
│   │   │   ├── ReceiptModal.jsx     # Thermal receipt modal printer component
│   │   │   └── SvgIcon.js           # Native SVG vector icon layout shapes
│   │   ├── screens/
│   │   │   ├── DashboardScreen.jsx  # Executive KPIs & activity feed
│   │   │   ├── ProfileScreen.jsx    # Director credentials & identity
│   │   │   ├── ScannerScreen.jsx    # Live camera scanner & POS checkout cart
│   │   │   └── SettingsScreen.jsx   # SARS VAT config & staff shift roster
│   │   └── store/
│   │       └── mobileStore.js       # Central reactive state store & barcode engine
│   ├── App.js                       # Mobile root layout & tab navigation
│   ├── app.json                     # Expo SDK 57 manifest configuration
│   ├── babel.config.js              # Babel compiler preset
│   └── package.json                 # Mobile dependencies (expo-camera, react-native-web)
├── src/                             # Web ERP Application Source
│   ├── css/                         # Custom vanilla CSS design system tokens
│   ├── js/
│   │   ├── components/              # Sidebar & top navigation components
│   │   ├── store/                   # Web reactive state store
│   │   └── views/                   # Dashboard, Inventory, POS, & Settings views
├── dist/                            # Web production build bundle
├── public/                          # Static public web assets
│   ├── labels/                      # Validated barcode SVGs (DET-MPC-2L, etc.)
│   └── templates/                   # Invoice & thermal receipt templates
├── .gitignore                       # Root Git ignore rules
├── index.html                       # Web ERP HTML entrypoint
├── package.json                     # Web ERP dependencies & npm scripts
└── README.md                        # Complete project architecture & documentation
```

---

## 🚀 Quick Start & Development

### 1. Web ERP System
```bash
npm install
npm run dev
```
Access the Web ERP dashboard at `http://localhost:3000/`.

### 2. Expo SDK 57 Mobile App
```bash
cd app
npm install
npm run dev
```
Scan the Metro QR code with **Expo Go** on your physical Android or iOS device.
