import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { mobileStore, formatCurrency } from '../store/mobileStore';
import { SvgIcon } from '../components/SvgIcon';

export function DashboardScreen({ onNavigate }) {
  const [storeState, setStoreState] = useState(mobileStore);

  useEffect(() => {
    const unsubscribe = mobileStore.subscribe(updated => setStoreState({ ...updated }));
    return () => unsubscribe();
  }, []);

  const totalRevenue = 124500.00;
  const inStockCount = storeState.products.filter(p => p.status === 'In Stock').length;
  const totalStockBottles = storeState.products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Universal Page Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Rulership ERP</Text>
          <Text style={styles.subTitle}>Executive Operations Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => onNavigate('profile')}>
          <SvgIcon name="profile" size={20} color="#0058be" />
        </TouchableOpacity>
      </View>

      {/* Primary KPI Cards Grid */}
      <View style={styles.kpiGrid}>
        {/* KPI 1: Gross Sales */}
        <View style={[styles.card, styles.cardBlue1]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>GROSS REVENUE (MONTHLY)</Text>
            <SvgIcon name="dashboard" size={16} color="#0058be" />
          </View>
          <Text style={styles.cardValue}>{formatCurrency(totalRevenue)}</Text>
          <Text style={styles.cardSub}>+14.2% Growth (15% SARS VAT Incl.)</Text>
        </View>

        {/* KPI 2: Units Dispensed */}
        <View style={[styles.card, styles.cardBlue2]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>PRIMARY 2L BOTTLES DISPENSED</Text>
            <SvgIcon name="cart" size={16} color="#0284c7" />
          </View>
          <Text style={styles.cardValue}>{totalStockBottles.toLocaleString()} units</Text>
          <Text style={styles.cardSub}>R 69.99 Standardized Bottle Price</Text>
        </View>

        {/* KPI 3: In-Stock Products */}
        <View style={[styles.card, styles.cardBlue3]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>IN-STOCK CATALOG ITEMS</Text>
            <SvgIcon name="check" size={16} color="#1d4ed8" />
          </View>
          <Text style={styles.cardValue}>{inStockCount} Products</Text>
          <Text style={styles.cardSub}>2L Pine Gel, Dishwashing & Multi-Purpose</Text>
        </View>
      </View>

      {/* Quick Barcode Action Banner */}
      <TouchableOpacity style={styles.actionBanner} onPress={() => onNavigate('scanner')}>
        <View style={styles.actionLeft}>
          <View style={styles.actionIconBg}>
            <SvgIcon name="barcode" size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.actionTitle}>Mobile Barcode Scanner</Text>
            <Text style={styles.actionDesc}>Scan barcodes to Add Stock or Process POS Sales</Text>
          </View>
        </View>
        <SvgIcon name="plus" size={18} color="#ffffff" />
      </TouchableOpacity>

      {/* Active Detergent Stock Summary */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Detergent Catalog</Text>
          <Text style={styles.sectionMeta}>3 In Stock • R 69.99</Text>
        </View>

        {storeState.products.map((item) => (
          <View key={item.id} style={styles.productRow}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productCode}>Code: {item.barcode} • {item.sku}</Text>
            </View>
            <View style={styles.productRight}>
              <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
              <View style={[styles.statusBadge, item.status === 'In Stock' ? styles.statusIn : styles.statusOut]}>
                <Text style={[styles.statusText, item.status === 'In Stock' ? styles.statusTextIn : styles.statusTextOut]}>
                  {item.status === 'In Stock' ? `${item.stock} in stock` : 'Out of Stock'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Live Operations Stream */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Live Activity Feed</Text>
        {storeState.scanLog.map((log) => (
          <View key={log.id} style={styles.logRow}>
            <View style={[styles.dot, log.type === 'restock' ? styles.dotRestock : styles.dotPos]} />
            <View style={styles.logInfo}>
              <Text style={styles.logText}>{log.text}</Text>
              <Text style={styles.logTime}>{log.time}</Text>
            </View>
          </View>
        ))}
      </View>
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
    gap: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
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
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bae6fd'
  },
  kpiGrid: {
    gap: 10
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2
  },
  cardBlue1: { borderLeftWidth: 4, borderLeftColor: '#0058be' },
  cardBlue2: { borderLeftWidth: 4, borderLeftColor: '#0284c7' },
  cardBlue3: { borderLeftWidth: 4, borderLeftColor: '#1d4ed8' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a'
  },
  cardSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0284c7',
    marginTop: 4
  },
  actionBanner: {
    backgroundColor: '#0058be',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  actionIconBg: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff'
  },
  actionDesc: {
    fontSize: 10,
    color: '#e0f2fe',
    marginTop: 2
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a'
  },
  sectionMeta: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#64748b'
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  productInfo: {
    flex: 1,
    marginRight: 8
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  productCode: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#64748b',
    marginTop: 2
  },
  productRight: {
    alignItems: 'flex-end'
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0058be',
    fontFamily: 'monospace'
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3
  },
  statusIn: { backgroundColor: '#e0f2fe' },
  statusOut: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 9, fontWeight: '700' },
  statusTextIn: { color: '#0284c7' },
  statusTextOut: { color: '#ef4444' },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc'
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4
  },
  dotRestock: { backgroundColor: '#0284c7' },
  dotPos: { backgroundColor: '#0058be' },
  logInfo: {
    flex: 1
  },
  logText: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: '500'
  },
  logTime: {
    fontSize: 9,
    color: '#94a3b8',
    fontFamily: 'monospace',
    marginTop: 2
  }
});
