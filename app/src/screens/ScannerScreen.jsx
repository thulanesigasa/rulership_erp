import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, Modal
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { mobileStore, formatCurrency } from '../store/mobileStore';
import { SvgIcon } from '../components/SvgIcon';
import { ReceiptModal } from '../components/ReceiptModal';
import { playScanBeep } from '../utils/audioBeep';

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
  const [cameraOpen, setCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Cooldown state for 3-second pause between scans
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const isCoolingDown = useRef(false);
  const cooldownInterval = useRef(null);

  // Blue laser animation
  const laserAnim = useRef(new Animated.Value(0)).current;
  const laserAnimation = useRef(null);

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

  // Start/stop laser animation when camera opens/closes
  useEffect(() => {
    if (cameraOpen && cooldownSeconds === 0) {
      laserAnim.setValue(0);
      laserAnimation.current = Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, { toValue: 180, duration: 1600, useNativeDriver: true }),
          Animated.timing(laserAnim, { toValue: 0, duration: 1600, useNativeDriver: true })
        ])
      );
      laserAnimation.current.start();
    } else {
      if (laserAnimation.current) laserAnimation.current.stop();
    }
    return () => {
      if (laserAnimation.current) laserAnimation.current.stop();
    };
  }, [cameraOpen, cooldownSeconds]);

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

    // Close camera, show countdown, reopen after 3s
    if (cameraOpen) {
      startCooldown();
    }
  };

  // Called by CameraView when it reads a barcode from the camera feed
  const onBarcodeRead = ({ data }) => {
    if (isCoolingDown.current) return;
    if (!data) return;
    processCode(data);
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setScanResult({ success: false, message: 'Camera permission denied.' });
        return;
      }
    }
    isCoolingDown.current = false;
    setCooldownSeconds(0);
    setCameraOpen(true);
  };

  const closeCamera = () => {
    if (cooldownInterval.current) clearInterval(cooldownInterval.current);
    cooldownInterval.current = null;
    isCoolingDown.current = false;
    setCooldownSeconds(0);
    setCameraOpen(false);
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
    <View style={{ flex: 1 }}>
      {/* FULLSCREEN CAMERA MODAL — no overlapping touch layers */}
      <Modal
        visible={cameraOpen}
        animationType="slide"
        onRequestClose={closeCamera}
      >
        <View style={styles.cameraModal}>
          {/* Camera Header */}
          <View style={styles.camHeader}>
            <Text style={styles.camHeaderTitle}>Rulership ERP</Text>
            <Text style={styles.camHeaderSub}>
              {isPos ? 'POS Payment Scanner — Point at bottle barcode' : 'Restock Scanner — Point at bottle barcode'}
            </Text>
          </View>

          {cooldownSeconds > 0 ? (
            /* 3-second cooldown screen between scans */
            <View style={styles.cooldownScreen}>
              <View style={styles.cooldownCheckBadge}>
                <SvgIcon name="check" size={28} color="#ffffff" />
              </View>
              <Text style={styles.cooldownTitle}>
                {scanResult?.product ? scanResult.product.name : 'Item Scanned!'}
              </Text>
              <Text style={styles.cooldownSub}>
                {isPos ? 'Added to POS Cart' : 'Inventory Restocked'}
              </Text>
              <View style={styles.cooldownPill}>
                <Text style={styles.cooldownCount}>Re-opening in {cooldownSeconds}s</Text>
              </View>
            </View>
          ) : (
            /* Live camera feed — NO overlapping touch views */
            <View style={styles.cameraFeed}>
              {permission?.granted && (
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  facing="back"
                  onBarcodeScanned={onBarcodeRead}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'code128', 'ean13', 'ean8', 'upc_a', 'upc_e']
                  }}
                />
              )}

              {/* Laser bar — pointerEvents none so camera gets all touch */}
              <Animated.View
                pointerEvents="none"
                style={[styles.laser, { transform: [{ translateY: laserAnim }] }]}
              />

              {/* Corner reticle marks */}
              <View pointerEvents="none" style={[styles.corner, styles.cornerTL]} />
              <View pointerEvents="none" style={[styles.corner, styles.cornerTR]} />
              <View pointerEvents="none" style={[styles.corner, styles.cornerBL]} />
              <View pointerEvents="none" style={[styles.corner, styles.cornerBR]} />
            </View>
          )}

          {/* Close camera button */}
          <TouchableOpacity style={styles.closeCamButton} onPress={closeCamera}>
            <SvgIcon name="close" size={18} color="#ffffff" />
            <Text style={styles.closeCamText}>Close Scanner</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* MAIN SCREEN */}
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rulership ERP</Text>
          <Text style={styles.subTitle}>Mobile Barcode Scanner</Text>
        </View>

        {/* Mode Tabs */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, isPos && styles.modeTabActivePos]}
            onPress={() => { mobileStore.setScanMode('pos'); setScanResult(null); syncState(); }}
          >
            <SvgIcon name="cart" size={16} color={isPos ? '#ffffff' : '#64748b'} />
            <Text style={[styles.modeTabText, isPos && styles.modeTabTextActive]}>Payment / POS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, !isPos && styles.modeTabActiveRestock]}
            onPress={() => { mobileStore.setScanMode('restock'); setScanResult(null); syncState(); }}
          >
            <SvgIcon name="plus" size={16} color={!isPos ? '#ffffff' : '#64748b'} />
            <Text style={[styles.modeTabText, !isPos && styles.modeTabTextActive]}>Add Product</Text>
          </TouchableOpacity>
        </View>

        {/* Mode Description */}
        <View style={[styles.modeInfo, isPos ? styles.infoPosColor : styles.infoRestockColor]}>
          <Text style={styles.modeInfoTitle}>
            {isPos ? 'POS PAYMENT MODE — Cart & Receipt' : 'RESTOCK MODE — Inventory +1'}
          </Text>
          <Text style={styles.modeInfoDesc}>
            {isPos
              ? 'Point camera at bottle barcode. Scanner beeps, item adds to cart (R 69.99 incl. VAT), camera pauses 3s then reopens.'
              : 'Point camera at bottle barcode. Scanner beeps, +1 added to inventory stock, camera pauses 3s then reopens.'}
          </Text>
        </View>

        {/* Open Camera Button */}
        <TouchableOpacity style={styles.openCameraBtn} onPress={openCamera}>
          <SvgIcon name="barcode" size={20} color="#ffffff" />
          <Text style={styles.openCameraText}>Open Camera Scanner</Text>
        </TouchableOpacity>

        {/* Manual Entry */}
        <View style={styles.manualSection}>
          <Text style={styles.manualLabel}>Manual Barcode Entry</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Type barcode e.g. 2024699900025..."
              placeholderTextColor="#94a3b8"
              value={inputCode}
              onChangeText={setInputCode}
              onSubmitEditing={handleManualSubmit}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleManualSubmit}>
              <Text style={styles.submitBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Bottle Chips */}
        <View style={styles.chipSection}>
          <Text style={styles.chipLabel}>Quick Scan — Tap a Bottle:</Text>
          <View style={styles.chipGrid}>
            {storeState.products.slice(0, 3).map((prod) => (
              <TouchableOpacity
                key={prod.id}
                style={styles.chip}
                onPress={() => processCode(prod.barcode)}
              >
                <Text style={styles.chipName}>{prod.sku}</Text>
                <Text style={styles.chipBarcode}>{prod.barcode}</Text>
                <Text style={styles.chipStock}>{prod.stock} in stock</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Scan Result */}
        {scanResult && (
          <View style={[styles.resultCard, scanResult.success ? styles.resultSuccess : styles.resultError]}>
            <View style={styles.resultRow}>
              <View style={styles.resultIcon}>
                <SvgIcon name={scanResult.success ? 'check' : 'close'} size={18} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle}>
                  {scanResult.success
                    ? (isPos ? 'Added to Cart' : 'Stock Updated')
                    : 'Scan Failed'}
                </Text>
                <Text style={styles.resultMsg}>{scanResult.message}</Text>
              </View>
            </View>
            {scanResult.product && (
              <View style={styles.resultDetails}>
                <Text style={styles.detailRow}><Text style={styles.detailKey}>Product: </Text>{scanResult.product.name}</Text>
                <Text style={styles.detailRow}><Text style={styles.detailKey}>SKU: </Text>{scanResult.product.sku}</Text>
                <Text style={styles.detailRow}><Text style={styles.detailKey}>Barcode: </Text>{scanResult.product.barcode}</Text>
                <Text style={styles.detailRow}><Text style={styles.detailKey}>Price: </Text>{formatCurrency(scanResult.product.price)}</Text>
                <Text style={styles.detailRow}><Text style={styles.detailKey}>Remaining Stock: </Text>{scanResult.product.stock} bottles</Text>
              </View>
            )}
          </View>
        )}

        {/* Cart — POS Mode Only */}
        {isPos && (
          <View style={styles.cartCard}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Active Checkout Cart</Text>
              <Text style={styles.cartCount}>{storeState.cart.reduce((a, b) => a + b.qty, 0)} Items</Text>
            </View>

            {storeState.cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <SvgIcon name="cart" size={28} color="#94a3b8" />
                <Text style={styles.emptyText}>Cart empty — scan a bottle to start</Text>
              </View>
            ) : (
              <>
                {storeState.cart.map((item) => (
                  <View key={item.productId} style={styles.cartRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemCode}>{item.barcode} • {formatCurrency(item.price)} ea</Text>
                    </View>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => { mobileStore.updateCartQty(item.productId, -1); syncState(); }}>
                        <SvgIcon name="minus" size={12} color="#0f172a" />
                      </TouchableOpacity>
                      <Text style={styles.qtyNum}>{item.qty}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => { mobileStore.updateCartQty(item.productId, 1); syncState(); }}>
                        <SvgIcon name="plus" size={12} color="#0f172a" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <View style={styles.totals}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLbl}>Subtotal (excl. VAT):</Text>
                    <Text style={styles.totalVal}>{formatCurrency(subtotalExclVat)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLbl}>15% SARS VAT:</Text>
                    <Text style={styles.totalVal}>{formatCurrency(vatAmount)}</Text>
                  </View>
                  <View style={[styles.totalRow, styles.grandTotalRow]}>
                    <Text style={styles.grandLbl}>TOTAL (incl. VAT):</Text>
                    <Text style={styles.grandVal}>{formatCurrency(cartTotal)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() => { mobileStore.completeCheckout(cartTotal + 0.01, 'Cash'); syncState(); }}
                  >
                    <SvgIcon name="receipt" size={16} color="#ffffff" />
                    <Text style={styles.payBtnText}>Pay {formatCurrency(cartTotal)} & Print Receipt</Text>
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 14, paddingBottom: 40 },

  // Camera Modal
  cameraModal: { flex: 1, backgroundColor: '#0f172a' },
  camHeader: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#0f172a' },
  camHeaderTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5 },
  camHeaderSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  cameraFeed: { flex: 1, position: 'relative', overflow: 'hidden' },

  laser: {
    position: 'absolute', top: 0, left: 0, right: 0,
    width: '100%', height: 3, backgroundColor: '#0284c7',
    shadowColor: '#0284c7', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 10,
    zIndex: 10
  },

  // Corner reticle marks
  corner: { position: 'absolute', width: 24, height: 24, borderColor: '#38bdf8', zIndex: 10 },
  cornerTL: { top: 40, left: 40, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 40, right: 40, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 40, left: 40, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 40, right: 40, borderBottomWidth: 3, borderRightWidth: 3 },

  // Cooldown screen
  cooldownScreen: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0f172a', gap: 10
  },
  cooldownCheckBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#0058be', justifyContent: 'center', alignItems: 'center'
  },
  cooldownTitle: { fontSize: 16, fontWeight: '800', color: '#ffffff', textAlign: 'center', paddingHorizontal: 20 },
  cooldownSub: { fontSize: 12, color: '#94a3b8' },
  cooldownPill: {
    marginTop: 8, backgroundColor: 'rgba(0, 88, 190, 0.3)',
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#38bdf8'
  },
  cooldownCount: { fontSize: 13, fontWeight: '800', color: '#38bdf8' },

  closeCamButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1e293b', paddingVertical: 16, gap: 8,
    borderTopWidth: 1, borderTopColor: '#334155'
  },
  closeCamText: { color: '#94a3b8', fontSize: 14, fontWeight: '700' },

  // Main screen
  header: { marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  subTitle: { fontSize: 11, color: '#64748b', marginTop: 1 },

  modeTabs: {
    flexDirection: 'row', backgroundColor: '#e2e8f0',
    borderRadius: 10, padding: 4, gap: 4
  },
  modeTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6
  },
  modeTabActivePos: { backgroundColor: '#0058be' },
  modeTabActiveRestock: { backgroundColor: '#0284c7' },
  modeTabText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  modeTabTextActive: { color: '#ffffff' },

  modeInfo: { padding: 12, borderRadius: 8, borderWidth: 1 },
  infoPosColor: { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' },
  infoRestockColor: { backgroundColor: '#f0f9ff', borderColor: '#e0f2fe' },
  modeInfoTitle: { fontSize: 10, fontWeight: '800', color: '#0058be', letterSpacing: 0.5 },
  modeInfoDesc: { fontSize: 10, color: '#334155', marginTop: 4, lineHeight: 15 },

  openCameraBtn: {
    backgroundColor: '#0058be', borderRadius: 10,
    paddingVertical: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10
  },
  openCameraText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },

  manualSection: { gap: 6 },
  manualLabel: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  inputRow: { flexDirection: 'row', gap: 8 },
  textInput: {
    flex: 1, backgroundColor: '#ffffff', borderWidth: 1,
    borderColor: '#cbd5e1', borderRadius: 8,
    paddingHorizontal: 12, fontSize: 12, color: '#0f172a', height: 44
  },
  submitBtn: {
    backgroundColor: '#0284c7', paddingHorizontal: 16,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center'
  },
  submitBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },

  chipSection: { gap: 8 },
  chipLabel: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  chipGrid: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1, backgroundColor: '#ffffff', padding: 10,
    borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', gap: 2
  },
  chipName: { fontSize: 10, fontWeight: '800', color: '#0058be' },
  chipBarcode: { fontSize: 9, fontFamily: 'monospace', color: '#64748b' },
  chipStock: { fontSize: 9, color: '#0284c7', fontWeight: '600' },

  resultCard: { borderRadius: 12, padding: 14, borderWidth: 1, gap: 10 },
  resultSuccess: { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' },
  resultError: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#0058be', justifyContent: 'center', alignItems: 'center'
  },
  resultTitle: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  resultMsg: { fontSize: 11, color: '#0058be', fontWeight: '600', marginTop: 1 },
  resultDetails: {
    backgroundColor: '#ffffff', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#bae6fd', gap: 4
  },
  detailRow: { fontSize: 11, color: '#334155' },
  detailKey: { fontWeight: '700', color: '#0f172a' },

  cartCard: {
    backgroundColor: '#ffffff', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#cbd5e1', gap: 10
  },
  cartHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', paddingBottom: 8
  },
  cartTitle: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  cartCount: { fontSize: 10, fontFamily: 'monospace', color: '#0058be', fontWeight: '700' },

  emptyCart: { alignItems: 'center', paddingVertical: 20, gap: 6 },
  emptyText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },

  cartRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 8
  },
  cartItemName: { fontSize: 11, fontWeight: '700', color: '#0f172a' },
  cartItemCode: { fontSize: 9, fontFamily: 'monospace', color: '#64748b', marginTop: 1 },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f1f5f9', borderRadius: 6, padding: 2, gap: 6
  },
  qtyBtn: { padding: 4, backgroundColor: '#ffffff', borderRadius: 4 },
  qtyNum: { fontSize: 11, fontWeight: '700', color: '#0f172a', minWidth: 16, textAlign: 'center' },

  totals: { gap: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLbl: { fontSize: 10, color: '#64748b' },
  totalVal: { fontSize: 10, fontFamily: 'monospace', color: '#0f172a' },
  grandTotalRow: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 4 },
  grandLbl: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  grandVal: { fontSize: 16, fontWeight: '800', color: '#0058be', fontFamily: 'monospace' },
  payBtn: {
    backgroundColor: '#0058be', borderRadius: 8, paddingVertical: 12,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 6
  },
  payBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' }
});
