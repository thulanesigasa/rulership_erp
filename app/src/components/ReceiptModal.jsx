import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { formatCurrency } from '../store/mobileStore';

export function ReceiptModal({ visible, transaction, onClose }) {
  if (!visible || !transaction) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Top Brand Accent Bar */}
          <View style={styles.topAccentBar} />

          {/* Printer slot header */}
          <View style={styles.printerTop}>
            <View style={styles.slotMouth} />
          </View>

          {/* Receipt paper card */}
          <ScrollView style={styles.paperScroll} contentContainerStyle={styles.paperContent}>
            <View style={styles.headerArea}>
              <Text style={styles.companyTitle}>RULERSHIP LTD PTY</Text>
              <Text style={styles.subTitle}>DETERGENTS & CLEANING WORKS</Text>
              <Text style={styles.metaText}>{transaction.facility}</Text>
              <Text style={styles.metaText}>VAT Reg: ZA4901928374</Text>
              <Text style={styles.metaText}>{transaction.date}</Text>
              <Text style={styles.receiptId}>RECEIPT #{transaction.id}</Text>
            </View>

            {/* Items list */}
            <View style={styles.itemsArea}>
              <View style={styles.itemHeaderRow}>
                <Text style={styles.colHeader}>QTY & ITEM</Text>
                <Text style={styles.colHeader}>PRICE</Text>
              </View>

              {transaction.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.qty}x {item.name}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price * item.qty)}</Text>
                </View>
              ))}
            </View>

            {/* Totals Breakdown */}
            <View style={styles.totalsArea}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal Excl. VAT:</Text>
                <Text style={styles.totalVal}>{formatCurrency(transaction.subtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>15% SARS VAT (Included):</Text>
                <Text style={styles.totalVal}>{formatCurrency(transaction.vat)}</Text>
              </View>
              <View style={[styles.totalRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>TOTAL AMOUNT:</Text>
                <Text style={styles.grandTotalVal}>{formatCurrency(transaction.total)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>CASH TENDERED:</Text>
                <Text style={styles.totalVal}>{formatCurrency(transaction.tenderAmount)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.changeLabel}>CHANGE DUE:</Text>
                <Text style={styles.changeVal}>{formatCurrency(transaction.change)}</Text>
              </View>
            </View>

            <View style={styles.footerArea}>
              <Text style={styles.thankYouText}>THANK YOU FOR YOUR PATRONAGE</Text>
              <Text style={styles.footerSub}>Cleanliness & Hygiene Delivered • Standerton</Text>
              <View style={styles.barcodeLines}>
                <Text style={styles.barcodeText}>||| | |||| | ||| || ||| | |||</Text>
                <Text style={styles.barcodeId}>{transaction.id}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action button */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Done Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  container: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10
  },
  topAccentBar: {
    height: 4,
    backgroundColor: '#0058be'
  },
  printerTop: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    alignItems: 'center'
  },
  slotMouth: {
    width: '80%',
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 3
  },
  paperScroll: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  paperContent: {
    paddingBottom: 20
  },
  headerArea: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    borderStyle: 'dashed',
    paddingBottom: 12,
    marginBottom: 12
  },
  companyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5
  },
  subTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    marginTop: 2
  },
  metaText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2
  },
  receiptId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 8
  },
  itemsArea: {
    marginBottom: 12
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
    marginBottom: 6
  },
  colHeader: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b'
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  itemName: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1
  },
  itemPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'monospace'
  },
  totalsArea: {
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    borderStyle: 'dashed',
    paddingTop: 8,
    gap: 4
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748b'
  },
  totalVal: {
    fontSize: 10,
    color: '#0f172a',
    fontFamily: 'monospace'
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 6,
    marginVertical: 4
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a'
  },
  grandTotalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0058be',
    fontFamily: 'monospace'
  },
  changeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7'
  },
  changeVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284c7',
    fontFamily: 'monospace'
  },
  footerArea: {
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    borderStyle: 'dashed',
    paddingTop: 12
  },
  thankYouText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a'
  },
  footerSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2
  },
  barcodeLines: {
    alignItems: 'center',
    marginTop: 8
  },
  barcodeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 2,
    color: '#0f172a'
  },
  barcodeId: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#64748b',
    marginTop: 2
  },
  actionsRow: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  closeBtn: {
    backgroundColor: '#0058be',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  }
});
