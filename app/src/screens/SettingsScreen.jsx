import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { mobileStore } from '../store/mobileStore';
import { SvgIcon } from '../components/SvgIcon';

export function SettingsScreen() {
  const [storeState, setStoreState] = useState(mobileStore);

  useEffect(() => {
    const unsubscribe = mobileStore.subscribe(updated => setStoreState({ ...updated }));
    return () => unsubscribe();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Universal Page Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rulership ERP</Text>
        <Text style={styles.subTitle}>System Settings & Staff Roster</Text>
      </View>

      {/* Staff Roster Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <SvgIcon name="users" size={18} color="#0058be" />
            <Text style={styles.cardTitle}>Employee Shift Roster</Text>
          </View>
          <Text style={styles.cardBadge}>3 Staff Members</Text>
        </View>

        <View style={styles.rosterList}>
          {storeState.staffRoster.map((staff) => (
            <View key={staff.id} style={styles.rosterRow}>
              <View style={styles.staffAvatar}>
                <Text style={styles.staffInitials}>{staff.name.split(' ').map(n => n[0]).join('')}</Text>
              </View>

              <View style={styles.staffDetails}>
                <Text style={styles.staffName}>{staff.name}</Text>
                <Text style={styles.staffRole}>{staff.role}</Text>
                <Text style={styles.staffShift}>Shift: {staff.shift}</Text>
              </View>

              <View style={styles.staffStatusArea}>
                <View style={[styles.statusBadge, staff.status === 'On Duty' ? styles.statusDuty : styles.statusSched]}>
                  <Text style={[styles.statusText, staff.status === 'On Duty' ? styles.textDuty : styles.textSched]}>
                    {staff.status}
                  </Text>
                </View>
                <Text style={styles.phoneText}>{staff.phone}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Facility & Financial Settings Card */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Facility & SARS Tax Configuration</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Active Facility Branch</Text>
          <Text style={styles.settingVal}>Sakhile, Ext7 (#SKH-EXT7-ZA)</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>SARS Output VAT Rate</Text>
          <Text style={styles.settingVal}>15.0% Standard Rate (Inclusive)</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Base Currency</Text>
          <Text style={styles.settingVal}>South African Rand (ZAR / R)</Text>
        </View>

        <View style={[styles.settingRow, styles.lastRow]}>
          <Text style={styles.settingLabel}>Chemical Works Supplier</Text>
          <Text style={styles.settingVal}>Rulership Chemical Works</Text>
        </View>
      </View>

      {/* Subtle Brand Footer (27% Opacity) */}
      <Text style={styles.brandFooter}>A product of Ts. Industries</Text>
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 12
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a'
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0058be',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
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
  rosterList: {
    gap: 10
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    gap: 10
  },
  staffAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0058be',
    justifyContent: 'center',
    alignItems: 'center'
  },
  staffInitials: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  staffDetails: {
    flex: 1
  },
  staffName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a'
  },
  staffRole: {
    fontSize: 10,
    color: '#475569',
    marginTop: 1
  },
  staffShift: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#0284c7',
    marginTop: 2
  },
  staffStatusArea: {
    alignItems: 'flex-end'
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusDuty: { backgroundColor: '#e0f2fe' },
  statusSched: { backgroundColor: '#f1f5f9' },
  statusText: { fontSize: 9, fontWeight: '700' },
  textDuty: { color: '#0284c7' },
  textSched: { color: '#64748b' },
  phoneText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#94a3b8',
    marginTop: 3
  },
  settingRow: {
    marginBottom: 10
  },
  lastRow: {
    marginBottom: 0
  },
  settingLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600'
  },
  settingVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1
  },
  brandFooter: {
    fontSize: 11,
    color: '#64748b',
    opacity: 0.27,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
    fontWeight: '500'
  }
});
