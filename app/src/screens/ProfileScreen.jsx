import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { mobileStore } from '../store/mobileStore';
import { SvgIcon } from '../components/SvgIcon';

export function ProfileScreen() {
  const p = mobileStore.userProfile;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Universal Page Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rulership ERP</Text>
        <Text style={styles.subTitle}>Director Profile & Credentials</Text>
      </View>

      {/* Profile Header Avatar Banner */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarBg}>
          <Text style={styles.avatarInitials}>NG</Text>
        </View>
        <Text style={styles.name}>{p.name}</Text>
        <Text style={styles.role}>{p.role}</Text>
        <View style={styles.branchBadge}>
          <Text style={styles.branchText}>{p.branch}</Text>
        </View>
      </View>

      {/* Account Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Director Credentials & Identity</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email Address</Text>
          <Text style={styles.infoVal}>{p.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Contact Phone</Text>
          <Text style={styles.infoVal}>{p.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Company Reg. No.</Text>
          <Text style={styles.infoVal}>{p.regNumber}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>SARS VAT Number</Text>
          <Text style={styles.infoVal}>{p.vatNumber}</Text>
        </View>

        <View style={[styles.infoRow, styles.lastRow]}>
          <Text style={styles.infoLabel}>Facility Stand Address</Text>
          <Text style={styles.infoVal}>{p.address}</Text>
        </View>
      </View>

      {/* Facility Operations & Security Badge */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Role Permissions & Access Control</Text>

        <View style={styles.permRow}>
          <SvgIcon name="check" size={16} color="#0058be" />
          <Text style={styles.permText}>Full POS Payment Checkout & Dispense</Text>
        </View>

        <View style={styles.permRow}>
          <SvgIcon name="check" size={16} color="#0058be" />
          <Text style={styles.permText}>Inventory Stock Restock & Count Adjustments</Text>
        </View>

        <View style={styles.permRow}>
          <SvgIcon name="check" size={16} color="#0058be" />
          <Text style={styles.permText}>Staff Shift Roster & Performance Control</Text>
        </View>

        <View style={styles.permRow}>
          <SvgIcon name="check" size={16} color="#0058be" />
          <Text style={styles.permText}>SARS 15% VAT Monthly Report Auditing</Text>
        </View>
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
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  avatarBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0058be',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff'
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  role: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  branchBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8
  },
  branchText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284c7'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
    marginBottom: 12
  },
  infoRow: {
    marginBottom: 10
  },
  lastRow: {
    marginBottom: 0
  },
  infoLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600'
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc'
  },
  permText: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: '600'
  }
});
