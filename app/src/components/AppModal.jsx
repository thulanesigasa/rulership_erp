import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { SvgIcon } from './SvgIcon';

/**
 * Universal Styled App Modal for Rulership ERP
 * Replaces system popups/alerts with a cohesive 60-30-10 themed dialog
 */
export function AppModal({ visible, title, message, iconName = 'check', primaryText = 'OK', onPrimary, secondaryText, onSecondary, onClose }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose || onPrimary}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Top Brand Accent Bar */}
          <View style={styles.topAccentBar} />

          <View style={styles.contentArea}>
            {/* Header Icon & Title */}
            <View style={styles.headerRow}>
              <View style={styles.iconBg}>
                <SvgIcon name={iconName} size={22} color="#0058be" />
              </View>
              <Text style={styles.titleText}>{title || 'System Notification'}</Text>
            </View>

            {/* Body Message */}
            <Text style={styles.messageText}>{message}</Text>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              {secondaryText && onSecondary && (
                <TouchableOpacity style={styles.secondaryBtn} onPress={onSecondary}>
                  <Text style={styles.secondaryBtnText}>{secondaryText}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.primaryBtn} onPress={onPrimary || onClose}>
                <Text style={styles.primaryBtnText}>{primaryText}</Text>
              </TouchableOpacity>
            </View>
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
    padding: 20
  },
  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8
  },
  topAccentBar: {
    height: 4,
    backgroundColor: '#0058be'
  },
  contentArea: {
    padding: 20
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bae6fd'
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1
  },
  messageText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 20
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end'
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#0058be',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center'
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  secondaryBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700'
  }
});
