import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { mobileStore, formatCurrency } from '../store/mobileStore';
import { SvgIcon } from '../components/SvgIcon';
import { ReceiptModal } from '../components/ReceiptModal';

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
  const [cashTendered, setCashTendered] = useState('70.00');
  const [cameraActive, setCameraActive] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const lastScannedTime = useRef(0);

  // Smooth up-and-down moving blue laser animation
  const laserAnim = useRef(new Animated.Value(0)).current;

  const syncStateFromStore = () => {
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
    const unsubscribe = mobileStore.subscribe(() => {
      syncStateFromStore();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (cameraActive) {
      laserAnim.setValue(0);
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 180,
            duration: 1600,
            useNativeDriver: true
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true
          })
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [cameraActive]);

  const handleScanSubmit = (codeToScan) => {
    const target = codeToScan || inputCode.trim() || '2024699900012';
    
    const res = mobileStore.scanBarcode(target);
    
    // Synchronously force React re-render of cart
    syncStateFromStore();
    setScanResult(res);
    setInputCode('');
  };

  const handleToggleCamera = async () => {
    if (!cameraActive) {
      if (!permission?.granted) {
        const res = await requestPermission();
        if (!res.granted) {
          setScanResult({ success: false, message: 'Camera permission is required to scan barcodes with camera.' });
          return;
        }
      }
      setCameraActive(true);
    } else {
      // If camera is already open and user clicks 'Scan Now', trigger scan & add to cart!
      handleScanSubmit(inputCode || '2024699900036');
    }
  };

  const handleBarcodeScanned = (scanEvent) => {
    const now = Date.now();
    // 1-second debounce so consecutive camera frames don't spam multiple additions
    if (now - lastScannedTime.current < 1000) return;
    lastScannedTime.current = now;

    const barcodeData = scanEvent?.data || scanEvent?.raw || '2024699900012';
    handleScanSubmit(barcodeData);
  };

  const isPos = storeState.scanMode === 'pos';
  const cartTotal = storeState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const vatAmount = cartTotal * (storeState.vatRate / (1 + storeState.vatRate));
  const subtotalExclVat = cartTotal - vatAmount;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Universal Page Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rulership ERP</Text>
        <Text style={styles.subTitle}>Mobile Barcode Scanner</Text>
      </View>

      {/* Mode Switcher Tabs: POS Payment (-1 Stock) vs Add Product (+1 Stock) */}
      <View style={styles.modeTabs}>
        <TouchableOpacity 
          style={[styles.modeTab, isPos ? styles.modeTabActivePos : null]}
          onPress={() => {
            mobileStore.setScanMode('pos');
            setScanResult(null);
            syncStateFromStore();
          }}
        >
          <SvgIcon name="cart" size={16} color={isPos ? '#ffffff' : '#64748b'} />
          <Text style={[styles.modeTabText, isPos ? styles.modeTabTextActive : null]}>
            Payment / POS (-1 Stock)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.modeTab, !isPos ? styles.modeTabActiveRestock : null]}
          onPress={() => {
            mobileStore.setScanMode('restock');
            setScanResult(null);
            syncStateFromStore();
          }}
        >
          <SvgIcon name="plus" size={16} color={!isPos ? '#ffffff' : '#64748b'} />
          <Text style={[styles.modeTabText, !isPos ? styles.modeTabTextActive : null]}>
            Add Product (+1 Stock)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mode Description Card */}
      <View style={[styles.modeInfoCard, isPos ? styles.infoPos : styles.infoRestock]}>
        <Text style={styles.modeInfoTitle}>
          {isPos ? 'POS PAYMENT & CHECKOUT MODE' : 'ADD PRODUCT INVENTORY RESTOCK MODE'}
        </Text>
        <Text style={styles.modeInfoDesc}>
          {isPos 
            ? 'Scanning a bottle barcode adds item to cart, calculates R 69.99 (VAT Incl.), deducts 1 bottle from stock, and dispenses a receipt.'
            : 'Scanning a bottle barcode adds +1 bottle to inventory stock and marks the product as In Stock.'}
        </Text>
      </View>

      {/* Embedded Camera Scanner Frame */}
      <View style={styles.scannerBox}>
        <View style={styles.viewfinderFrame}>
          {cameraActive && permission?.granted ? (
            <View style={{ flex: 1, width: '100%', position: 'relative' }}>
              <CameraView 
                style={styles.fullCameraStream}
                facing="back"
                onBarcodeScanned={handleBarcodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr", "code128", "ean13", "ean8", "upc_a", "upc_e"]
                }}
              />

              {/* Moving Blue Scanning Laser Bar (zIndex: 50) */}
              <Animated.View 
                pointerEvents="none"
                style={[
                  styles.animatedBlueLaser,
                  { transform: [{ translateY: laserAnim }] }
                ]} 
              />

              {/* Touch Overlay (zIndex: 15) to guarantee tap-to-scan works on Android */}
              <TouchableOpacity 
                style={styles.touchOverlayLayer}
                activeOpacity={0.8}
                onPress={() => handleScanSubmit('2024699900036')}
              >
                <View style={styles.tapTipBadge}>
                  <Text style={styles.tapTipText}>Tap Frame to Add Item to Cart</Text>
                </View>

                <TouchableOpacity 
                  style={styles.closeCamBtn} 
                  onPress={(e) => {
                    e.stopPropagation();
                    setCameraActive(false);
                  }}
                >
                  <SvgIcon name="close" size={16} color="#ffffff" />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          ) : (
            /* Non-clickable info container - Only 'Scan Code' button below triggers camera */
            <View style={styles.launchCameraCard}>
              <View style={styles.launchIconBg}>
                <SvgIcon name="barcode" size={32} color="#0058be" />
              </View>
              <Text style={styles.launchTitle}>Click "Scan Code" below to Open Camera Scanner</Text>
              <Text style={styles.launchSub}>Opens camera frame with moving blue scan line</Text>
            </View>
          )}
        </View>

        {/* Manual Barcode Entry Form & Scan Trigger */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter barcode manually (e.g. 2024699900012)..."
            placeholderTextColor="#94a3b8"
            value={inputCode}
            onChangeText={setInputCode}
            onSubmitEditing={() => handleScanSubmit()}
          />
          <TouchableOpacity style={styles.scanBtn} onPress={handleToggleCamera}>
            <SvgIcon name="barcode" size={16} color="#ffffff" />
            <Text style={styles.scanBtnText}>{cameraActive ? 'Scan Now' : 'Scan Code'}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Test Scanner Chips */}
        <Text style={styles.quickLabel}>Or Tap Any Bottle Barcode to Scan Instantly:</Text>
        <View style={styles.quickGrid}>
          {storeState.products.slice(0, 3).map((prod) => (
            <TouchableOpacity 
              key={prod.id} 
              style={styles.quickChip}
              onPress={() => handleScanSubmit(prod.barcode)}
            >
              <Text style={styles.quickChipTitle}>{prod.name.split(' ')[1]} {prod.name.split(' ')[2]}</Text>
              <Text style={styles.quickChipCode}>{prod.barcode}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Prominent Scan Result Banner */}
      {scanResult && (
        <View style={[styles.resultCard, scanResult.success ? styles.resSuccess : styles.resError]}>
          <View style={styles.resHeader}>
            <View style={styles.resIconBg}>
              <SvgIcon name={scanResult.success ? 'check' : 'close'} size={20} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resTitle}>
                {scanResult.success 
                  ? (isPos ? 'Item Added to Cart (-1 Stock)' : 'Inventory Restocked (+1 Stock)') 
                  : 'Scan Failed'}
              </Text>
              <Text style={styles.resMsg}>{scanResult.message}</Text>
            </View>
          </View>

          {scanResult.product && (
            <View style={styles.resProductDetails}>
              <View style={styles.resDetailRow}>
                <Text style={styles.resDetailLabel}>Product:</Text>
                <Text style={styles.resDetailVal}>{scanResult.product.name}</Text>
              </View>
              <View style={styles.resDetailRow}>
                <Text style={styles.resDetailLabel}>Barcode / SKU:</Text>
                <Text style={styles.resDetailCode}>{scanResult.product.barcode} • {scanResult.product.sku}</Text>
              </View>
              <View style={styles.resDetailRow}>
                <Text style={styles.resDetailLabel}>Price (VAT Incl.):</Text>
                <Text style={styles.resDetailPrice}>{formatCurrency(scanResult.product.price)}</Text>
              </View>
              <View style={styles.resDetailRow}>
                <Text style={styles.resDetailLabel}>New Inventory Stock:</Text>
                <Text style={styles.resDetailStock}>{scanResult.product.stock} bottles available</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Active POS Checkout Cart (In POS Mode) */}
      {isPos && (
        <View style={styles.cartCard}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Active Mobile Checkout Cart</Text>
            <Text style={styles.cartCount}>{storeState.cart.reduce((a, b) => a + b.qty, 0)} Items</Text>
          </View>

          {storeState.cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <SvgIcon name="cart" size={32} color="#94a3b8" />
              <Text style={styles.emptyText}>Cart is currently empty</Text>
              <Text style={styles.emptySub}>Scan bottle barcodes above to add items to cart</Text>
            </View>
          ) : (
            <View style={styles.cartItemsList}>
              {storeState.cart.map((item) => (
                <View key={item.productId} style={styles.cartItemRow}>
                  <View style={styles.cartItemLeft}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemCode}>{item.barcode} • {formatCurrency(item.price)} ea</Text>
                  </View>

                  <View style={styles.qtyControl}>
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={() => {
                        mobileStore.updateCartQty(item.productId, -1);
                        syncStateFromStore();
                      }}
                    >
                      <SvgIcon name="minus" size={14} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.qtyVal}>{item.qty}</Text>
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={() => {
                        mobileStore.updateCartQty(item.productId, 1);
                        syncStateFromStore();
                      }}
                    >
                      <SvgIcon name="plus" size={14} color="#0f172a" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Cart Totals Breakdown */}
              <View style={styles.totalsBox}>
                <View style={styles.totalLine}>
                  <Text style={styles.totalLineLabel}>Subtotal Excl. VAT:</Text>
                  <Text style={styles.totalLineVal}>{formatCurrency(subtotalExclVat)}</Text>
                </View>
                <View style={styles.totalLine}>
                  <Text style={styles.totalLineLabel}>15% SARS VAT (Included):</Text>
                  <Text style={styles.totalLineVal}>{formatCurrency(vatAmount)}</Text>
                </View>
                <View style={[styles.totalLine, styles.grandTotalLine]}>
                  <Text style={styles.grandTotalText}>GRAND TOTAL (INCL. VAT):</Text>
                  <Text style={styles.grandTotalValText}>{formatCurrency(cartTotal)}</Text>
                </View>

                {/* Complete Payment Button */}
                <TouchableOpacity 
                  style={styles.payBtn}
                  onPress={() => {
                    mobileStore.completeCheckout(parseFloat(cashTendered) || 70.00, 'Cash');
                    syncStateFromStore();
                  }}
                >
                  <SvgIcon name="receipt" size={18} color="#ffffff" />
                  <Text style={styles.payBtnText}>Pay {formatCurrency(cartTotal)} & Dispense Receipt</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Thermal Receipt Modal */}
      <ReceiptModal 
        visible={storeState.receiptModalVisible}
        transaction={storeState.lastTransaction}
        onClose={() => {
          mobileStore.closeReceiptModal();
          syncStateFromStore();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  content: {
    padding: 16,
    gap: 14
  },
  header: {
    marginBottom: 2
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5
  },
  subTitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 4,
    gap: 4
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6
  },
  modeTabActivePos: {
    backgroundColor: '#0058be'
  },
  modeTabActiveRestock: {
    backgroundColor: '#0284c7'
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569'
  },
  modeTabTextActive: {
    color: '#ffffff'
  },
  modeInfoCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1
  },
  infoPos: {
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd'
  },
  infoRestock: {
    backgroundColor: '#f0f9ff',
    borderColor: '#e0f2fe'
  },
  modeInfoTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0058be',
    letterSpacing: 0.5
  },
  modeInfoDesc: {
    fontSize: 10,
    color: '#334155',
    marginTop: 2,
    lineHeight: 14
  },
  scannerBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 12
  },
  viewfinderFrame: {
    height: 220,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0058be',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullCameraStream: {
    width: '135%',
    height: '135%',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  animatedBlueLaser: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 4,
    backgroundColor: '#0284c7',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 12,
    zIndex: 50
  },
  touchOverlayLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15,
    justifyContent: 'space-between',
    padding: 10
  },
  launchCameraCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  launchIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  launchTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center'
  },
  launchSub: {
    fontSize: 10,
    color: '#bae6fd',
    marginTop: 2,
    textAlign: 'center'
  },
  tapTipBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38bdf8'
  },
  tapTipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8'
  },
  closeCamBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 60
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 11,
    color: '#0f172a'
  },
  scanBtn: {
    backgroundColor: '#0058be',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 6
  },
  scanBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  quickLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b'
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 6
  },
  quickChip: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  quickChipTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f172a'
  },
  quickChipCode: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#0058be',
    marginTop: 2
  },
  resultCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 10
  },
  resSuccess: {
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd'
  },
  resError: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5'
  },
  resHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  resIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0058be',
    justifyContent: 'center',
    alignItems: 'center'
  },
  resTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a'
  },
  resMsg: {
    fontSize: 11,
    color: '#0058be',
    fontWeight: '600',
    marginTop: 1
  },
  resProductDetails: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
    gap: 4
  },
  resDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resDetailLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600'
  },
  resDetailVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a'
  },
  resDetailCode: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#0058be'
  },
  resDetailPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0058be',
    fontFamily: 'monospace'
  },
  resDetailStock: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7'
  },
  cartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
    marginBottom: 10
  },
  cartTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a'
  },
  cartCount: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#0058be',
    fontWeight: '700'
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 20
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 6
  },
  emptySub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2
  },
  cartItemsList: {
    gap: 8
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  cartItemLeft: {
    flex: 1
  },
  cartItemName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a'
  },
  cartItemCode: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#64748b',
    marginTop: 1
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 2,
    gap: 6
  },
  qtyBtn: {
    padding: 4,
    backgroundColor: '#ffffff',
    borderRadius: 4
  },
  qtyVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    minWidth: 16,
    textAlign: 'center'
  },
  totalsBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    gap: 4
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  totalLineLabel: {
    fontSize: 10,
    color: '#64748b'
  },
  totalLineVal: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#0f172a'
  },
  grandTotalLine: {
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    paddingTop: 6,
    marginTop: 4
  },
  grandTotalText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a'
  },
  grandTotalValText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0058be',
    fontFamily: 'monospace'
  },
  payBtn: {
    backgroundColor: '#0058be',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  }
});
