import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, Dimensions
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { mobileStore, formatCurrency } from '../store/mobileStore';
import { SvgIcon } from '../components/SvgIcon';
import { ReceiptModal } from '../components/ReceiptModal';
import { playScanBeep } from '../utils/audioBeep';

const FRAME_HEIGHT = 280; // Camera frame embedded in screen

export function ScannerScreen() {
  const [storeState, setStoreState] = useState({
    cart: [...mobileStore.cart],
    products: [...mobileStore.products],
    scanLog: [...mobileStore.scanLog],
    scanMode: mobileStore.scanMode,
    vatRate: mobileStore.vatRate,
    receiptModalVisible: mobileStore.receiptModalVisible,
    lastTransaction: mobileStore.lastTransaction
  });

  const [inputCode, setInputCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Cooldown — ref so onBarcodeScanned always reads current value (no stale closure)
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const isCoolingDown = useRef(false);
  const cooldownInterval = useRef(null);

  // Laser animation within the inline frame
  const laserAnim = useRef(new Animated.Value(0)).current;
  const laserLoop = useRef(null);

  const syncState = () => {
    setStoreState({
      cart: [...mobileStore.cart],
      products: [...mobileStore.products],
      scanLog: [...mobileStore.scanLog],
      scanMode: mobileStore.scanMode,
      vatRate: mobileStore.vatRate,
      receiptModalVisible: mobileStore.receiptModalVisible,
      lastTransaction: mobileStore.lastTransaction
    });
  };

  useEffect(() => {
    const unsub = mobileStore.subscribe(syncState);
    return () => unsub();
  }, []);

  // Laser runs when camera is active and not in cooldown
  useEffect(() => {
    if (laserLoop.current) {
      laserLoop.current.stop();
      laserLoop.current = null;
    }
    if (cameraActive && cooldownSeconds === 0) {
      laserAnim.setValue(0);
      const travel = FRAME_HEIGHT - 6;
      laserLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, { toValue: travel, duration: 1600, useNativeDriver: true }),
          Animated.timing(laserAnim, { toValue: 0, duration: 1600, useNativeDriver: true })
        ])
      );
      laserLoop.current.start();
    }
    return () => {
      if (laserLoop.current) laserLoop.current.stop();
    };
  }, [cameraActive, cooldownSeconds]);

  const startCooldown = () => {
    isCoolingDown.current = true;
    setCooldownSeconds(3);
    let remaining = 3;
    if (cooldownInterval.current) clearInterval(cooldownInterval.current);
    cooldownInterval.current = setInterval(() => {
      remaining -= 1;
      setCooldownSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(cooldownInterval.current);
        cooldownInterval.current = null;
        isCoolingDown.current = false;
      }
    }, 1000);
  };

  const processCode = (rawCode) => {
    if (!rawCode || !rawCode.trim()) return;
    const code = rawCode.trim();
    playScanBeep();
    const res = mobileStore.scanBarcode(code);
    syncState();
    setScanResult(res);
    if (cameraActive && res.success) {
      startCooldown();
    }
  };

  // onBarcodeScanned fires from CameraView — use ref guard (no stale closure)
  const onBarcodeRead = ({ data }) => {
    if (isCoolingDown.current || !data) return;
    processCode(data);
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setScanResult({ success: false, message: 'Camera permission denied. Please allow camera access in device settings.' });
        return;
      }
    }
    isCoolingDown.current = false;
    setCooldownSeconds(0);
    setCameraActive(true);
  };

  const closeCamera = () => {
    if (cooldownInterval.current) clearInterval(cooldownInterval.current);
    cooldownInterval.current = null;
    isCoolingDown.current = false;
    setCooldownSeconds(0);
    setCameraActive(false);
  };

  const handleManualSubmit = () => {
    const code = inputCode.trim();
    if (!code) return;
    processCode(code);
    setInputCode('');
  };

  const isPos = storeState.scanMode === 'pos';
  const cartTotal = storeState.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const vatAmount = cartTotal * (storeState.vatRate / (1 + storeState.vatRate));
  const subtotalExclVat = cartTotal - vatAmount;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Barcode Scanner</Text>
          <Text style={styles.subTitle}>Rulership LTD PTY · Sakhile, Ext7</Text>
        </View>

        {/* ── Mode Tabs ── */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, isPos && styles.modeTabActivePos]}
            onPress={() => { mobileStore.setScanMode('pos'); setScanResult(null); syncState(); }}
          >
            <SvgIcon name="cart" size={15} color={isPos ? '#fff' : '#64748b'} />
            <Text style={[styles.modeTabText, isPos && styles.modeTabTextActive]}>Payment / POS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, !isPos && styles.modeTabActiveRestock]}
            onPress={() => { mobileStore.setScanMode('restock'); setScanResult(null); syncState(); }}
          >
            <SvgIcon name="plus" size={15} color={!isPos ? '#fff' : '#64748b'} />
            <Text style={[styles.modeTabText, !isPos && styles.modeTabTextActive]}>Add Product</Text>
          </TouchableOpacity>
        </View>

        {/* ── Inline Camera Frame ── */}
        <View style={styles.cameraCard}>
          <View style={styles.cameraFrameOuter}>
            {/* Dark surround */}
            <View style={styles.cameraFrame}>
              {cameraActive ? (
                <>
                  {/* Live camera fills the frame */}
                  <CameraView
                    style={{ flex: 1, zIndex: 1 }}
                    facing="back"
                    onBarcodeScanned={cooldownSeconds > 0 ? undefined : onBarcodeRead}
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr', 'code128', 'ean13', 'ean8', 'upc_a', 'upc_e']
                    }}
                  />

                  {/* Overlays — elevation+zIndex above native CameraView surface on Android */}
                  <View
                    style={[StyleSheet.absoluteFillObject, { zIndex: 20, elevation: 20 }]}
                    pointerEvents="none"
                  >
                    {/* Scanning laser sweeping top → bottom */}
                    <Animated.View style={[styles.laser, { transform: [{ translateY: laserAnim }] }]} />

                    {/* Corner reticle marks */}
                    <View style={[styles.corner, styles.cTL]} />
                    <View style={[styles.corner, styles.cTR]} />
                    <View style={[styles.corner, styles.cBL]} />
                    <View style={[styles.corner, styles.cBR]} />

                    {/* 3-second countdown overlay after successful scan */}
                    {cooldownSeconds > 0 && (
                      <View style={styles.cooldownOverlay}>
                        <View style={styles.cooldownBadge}>
                          <SvgIcon name="check" size={20} color="#fff" />
                        </View>
                        <Text style={styles.cooldownLabel}>
                          {scanResult?.product?.name ?? 'Scanned!'}
                        </Text>
                        <View style={styles.cooldownPill}>
                          <Text style={styles.cooldownPillText}>Next scan in {cooldownSeconds}s</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </>
              ) : (
                /* Camera closed — tap to open */
                <TouchableOpacity style={styles.openCamTap} onPress={openCamera} activeOpacity={0.8}>
                  <View style={styles.openCamIcon}>
                    <SvgIcon name="barcode" size={32} color="#38bdf8" />
                  </View>
                  <Text style={styles.openCamText}>Tap to Open Camera</Text>
                  <Text style={styles.openCamHint}>
                    {isPos ? 'Scan bottle → adds to cart' : 'Scan bottle → adds +1 stock'}
                  </Text>
                  {/* Corner marks even when idle */}
                  <View style={[styles.corner, styles.cTL]} />
                  <View style={[styles.corner, styles.cTR]} />
                  <View style={[styles.corner, styles.cBL]} />
                  <View style={[styles.corner, styles.cBR]} />
                </TouchableOpacity>
              )}
            </View>

            {/* Camera toolbar — close / mode label */}
            <View style={styles.cameraToolbar}>
              <Text style={styles.toolbarMode}>
                {isPos ? 'POS Payment Mode' : 'Restock Mode'}
              </Text>
              {cameraActive && (
                <TouchableOpacity style={styles.closeCamBtn} onPress={closeCamera}>
                  <SvgIcon name="close" size={14} color="#94a3b8" />
                  <Text style={styles.closeCamText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* ── Manual Entry ── */}
        <View style={styles.manualSection}>
          <Text style={styles.sectionLabel}>Manual Barcode Entry</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Type barcode e.g. 2024699900036"
              placeholderTextColor="#94a3b8"
              value={inputCode}
              onChangeText={setInputCode}
              onSubmitEditing={handleManualSubmit}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleManualSubmit}>
              <Text style={styles.submitBtnText}>Scan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Quick Tap Product Chips ── */}
        <View style={styles.chipSection}>
          <Text style={styles.sectionLabel}>Quick Tap — Known Products:</Text>
          <View style={styles.chipGrid}>
            {storeState.products.slice(0, 3).map((prod) => (
              <TouchableOpacity
                key={prod.id}
                style={styles.chip}
                onPress={() => processCode(prod.barcode)}
              >
                <Text style={styles.chipSku}>{prod.sku}</Text>
                <Text style={styles.chipBarcode}>{prod.barcode}</Text>
                <Text style={[styles.chipStock, prod.stock > 0 ? styles.chipInStock : styles.chipOut]}>
                  {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Scan Result ── */}
        {scanResult && (
          <View style={[styles.resultCard, scanResult.success ? styles.resultOk : styles.resultFail]}>
            <View style={styles.resultRow}>
              <View style={[styles.resultIcon, !scanResult.success && styles.resultIconFail]}>
                <SvgIcon name={scanResult.success ? 'check' : 'close'} size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle}>
                  {scanResult.success
                    ? (isPos ? 'Added to Cart' : 'Stock Updated')
                    : 'Not Recognised'}
                </Text>
                <Text style={styles.resultMsg}>{scanResult.message}</Text>
              </View>
            </View>
            {scanResult.scannedRaw && (
              <View style={styles.rawBarcodeBox}>
                <Text style={styles.rawBarcodeLabel}>Raw scanned value:</Text>
                <Text style={styles.rawBarcodeVal}>{scanResult.scannedRaw}</Text>
              </View>
            )}
            {scanResult.product && (
              <View style={styles.resultDetails}>
                <Text style={styles.dRow}><Text style={styles.dKey}>Product: </Text>{scanResult.product.name}</Text>
                <Text style={styles.dRow}><Text style={styles.dKey}>SKU: </Text>{scanResult.product.sku}</Text>
                <Text style={styles.dRow}><Text style={styles.dKey}>Barcode: </Text>{scanResult.product.barcode}</Text>
                <Text style={styles.dRow}><Text style={styles.dKey}>Price: </Text>{formatCurrency(scanResult.product.price)}</Text>
                <Text style={styles.dRow}><Text style={styles.dKey}>Stock left: </Text>{scanResult.product.stock} bottles</Text>
              </View>
            )}
          </View>
        )}

        {/* ── POS Cart ── */}
        {isPos && (
          <View style={styles.cartCard}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Active Checkout Cart</Text>
              <Text style={styles.cartCount}>{storeState.cart.reduce((a, b) => a + b.qty, 0)} items</Text>
            </View>

            {storeState.cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <SvgIcon name="cart" size={26} color="#cbd5e1" />
                <Text style={styles.emptyText}>Cart is empty — scan a bottle to start</Text>
              </View>
            ) : (
              <>
                {storeState.cart.map((item) => (
                  <View key={item.productId} style={styles.cartRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemCode}>{item.barcode} · {formatCurrency(item.price)} ea</Text>
                    </View>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => { mobileStore.updateCartQty(item.productId, -1); syncState(); }}>
                        <SvgIcon name="minus" size={11} color="#0f172a" />
                      </TouchableOpacity>
                      <Text style={styles.qtyNum}>{item.qty}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => { mobileStore.updateCartQty(item.productId, 1); syncState(); }}>
                        <SvgIcon name="plus" size={11} color="#0f172a" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <View style={styles.totals}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLbl}>Subtotal (excl. 15% VAT)</Text>
                    <Text style={styles.totalVal}>{formatCurrency(subtotalExclVat)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLbl}>15% SARS VAT</Text>
                    <Text style={styles.totalVal}>{formatCurrency(vatAmount)}</Text>
                  </View>
                  <View style={[styles.totalRow, styles.grandRow]}>
                    <Text style={styles.grandLbl}>TOTAL (incl. VAT)</Text>
                    <Text style={styles.grandVal}>{formatCurrency(cartTotal)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() => { mobileStore.completeCheckout(cartTotal + 0.01, 'Cash'); syncState(); }}
                  >
                    <SvgIcon name="receipt" size={15} color="#fff" />
                    <Text style={styles.payBtnText}>Pay {formatCurrency(cartTotal)} · Print Receipt</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      <ReceiptModal
        visible={storeState.receiptModalVisible}
        transaction={storeState.lastTransaction}
        onClose={() => { mobileStore.closeReceiptModal(); syncState(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 48 },

  // Header
  header: { gap: 2 },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a', letterSpacing: -0.4 },
  subTitle: { fontSize: 10, color: '#64748b' },

  // Mode tabs
  modeTabs: {
    flexDirection: 'row', backgroundColor: '#e2e8f0',
    borderRadius: 10, padding: 4, gap: 4
  },
  modeTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 9, borderRadius: 7, gap: 6
  },
  modeTabActivePos: { backgroundColor: '#0058be' },
  modeTabActiveRestock: { backgroundColor: '#0284c7' },
  modeTabText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  modeTabTextActive: { color: '#ffffff' },

  // Inline camera card
  cameraCard: {
    backgroundColor: '#0f172a', borderRadius: 14,
    borderWidth: 1, borderColor: '#1e293b'
    // NOTE: no overflow:hidden — it clips absolutely-positioned corner marks
  },
  cameraFrameOuter: { gap: 0 },
  cameraFrame: {
    height: FRAME_HEIGHT, backgroundColor: '#0a1628',
    position: 'relative', borderRadius: 14, overflow: 'hidden'
  },

  // Tap-to-open idle state
  openCamTap: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative'
  },
  openCamIcon: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: 'rgba(56,189,248,0.12)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)'
  },
  openCamText: { fontSize: 13, fontWeight: '800', color: '#e2e8f0' },
  openCamHint: { fontSize: 10, color: '#64748b' },

  // Laser bar
  laser: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    backgroundColor: '#38bdf8',
    shadowColor: '#38bdf8', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 6, elevation: 6
  },

  // Corner reticle
  corner: { position: 'absolute', width: 20, height: 20, borderColor: '#38bdf8' },
  cTL: { top: 16, left: 16, borderTopWidth: 2.5, borderLeftWidth: 2.5 },
  cTR: { top: 16, right: 16, borderTopWidth: 2.5, borderRightWidth: 2.5 },
  cBL: { bottom: 16, left: 16, borderBottomWidth: 2.5, borderLeftWidth: 2.5 },
  cBR: { bottom: 16, right: 16, borderBottomWidth: 2.5, borderRightWidth: 2.5 },

  // Cooldown overlay inside camera frame
  cooldownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,22,40,0.85)',
    alignItems: 'center', justifyContent: 'center', gap: 8
  },
  cooldownBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#0058be', justifyContent: 'center', alignItems: 'center'
  },
  cooldownLabel: { fontSize: 12, fontWeight: '700', color: '#e2e8f0', textAlign: 'center', paddingHorizontal: 20 },
  cooldownPill: {
    backgroundColor: 'rgba(56,189,248,0.15)', paddingHorizontal: 16,
    paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#38bdf8'
  },
  cooldownPillText: { fontSize: 11, fontWeight: '800', color: '#38bdf8' },

  // Camera toolbar below frame
  cameraToolbar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#1e293b'
  },
  toolbarMode: { fontSize: 10, fontWeight: '700', color: '#64748b', letterSpacing: 0.4 },
  closeCamBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  closeCamText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },

  // Manual entry
  manualSection: { gap: 6 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', letterSpacing: 0.3 },
  inputRow: { flexDirection: 'row', gap: 8 },
  textInput: {
    flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1',
    borderRadius: 8, paddingHorizontal: 12, fontSize: 12, color: '#0f172a', height: 42
  },
  submitBtn: {
    backgroundColor: '#0284c7', paddingHorizontal: 18,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center'
  },
  submitBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Product chips
  chipSection: { gap: 8 },
  chipGrid: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#e2e8f0', gap: 2
  },
  chipSku: { fontSize: 9, fontWeight: '800', color: '#0058be' },
  chipBarcode: { fontSize: 8, fontFamily: 'monospace', color: '#64748b' },
  chipStock: { fontSize: 8, fontWeight: '600', marginTop: 1 },
  chipInStock: { color: '#0284c7' },
  chipOut: { color: '#ef4444' },

  // Scan result
  resultCard: { borderRadius: 12, padding: 12, borderWidth: 1, gap: 10 },
  resultOk: { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' },
  resultFail: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultIcon: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#0058be', justifyContent: 'center', alignItems: 'center'
  },
  resultIconFail: { backgroundColor: '#ef4444' },
  resultTitle: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  resultMsg: { fontSize: 10, color: '#334155', marginTop: 2, lineHeight: 14 },
  rawBarcodeBox: {
    backgroundColor: '#fff', borderRadius: 6, padding: 8,
    borderWidth: 1, borderColor: '#fecaca'
  },
  rawBarcodeLabel: { fontSize: 9, fontWeight: '700', color: '#64748b' },
  rawBarcodeVal: { fontSize: 12, fontFamily: 'monospace', color: '#0f172a', fontWeight: '700', marginTop: 2 },
  resultDetails: {
    backgroundColor: '#fff', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#bae6fd', gap: 3
  },
  dRow: { fontSize: 10, color: '#334155' },
  dKey: { fontWeight: '700', color: '#0f172a' },

  // Cart
  cartCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#e2e8f0', gap: 10
  },
  cartHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8
  },
  cartTitle: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  cartCount: { fontSize: 10, color: '#0058be', fontWeight: '700', fontFamily: 'monospace' },
  emptyCart: { alignItems: 'center', paddingVertical: 20, gap: 6 },
  emptyText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  cartRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f8fafc', gap: 8
  },
  cartItemName: { fontSize: 11, fontWeight: '700', color: '#0f172a' },
  cartItemCode: { fontSize: 9, fontFamily: 'monospace', color: '#64748b', marginTop: 1 },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f1f5f9', borderRadius: 6, padding: 2, gap: 6
  },
  qtyBtn: { padding: 4, backgroundColor: '#fff', borderRadius: 4 },
  qtyNum: { fontSize: 11, fontWeight: '700', color: '#0f172a', minWidth: 16, textAlign: 'center' },
  totals: { gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLbl: { fontSize: 10, color: '#64748b' },
  totalVal: { fontSize: 10, fontFamily: 'monospace', color: '#0f172a' },
  grandRow: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 4 },
  grandLbl: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  grandVal: { fontSize: 18, fontWeight: '800', color: '#0058be', fontFamily: 'monospace' },
  payBtn: {
    backgroundColor: '#0058be', borderRadius: 8, paddingVertical: 12,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 4
  },
  payBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' }
});
