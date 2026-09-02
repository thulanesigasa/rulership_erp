import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Pure Native React Native Icon Component for Rulership ERP
 * Uses 100% React Native View & Text primitives.
 * Zero external native binary dependencies, zero font file errors, zero Fabric bundler bugs.
 */
export function SvgIcon({ name, size = 20, color = '#0058be' }) {
  const iconBoxStyle = {
    width: size,
    height: size,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  };

  switch (name) {
    case 'dashboard':
      return (
        <View style={iconBoxStyle}>
          <View style={{ flexDirection: 'row', gap: 2, marginBottom: 2 }}>
            <View style={{ width: size * 0.4, height: size * 0.4, backgroundColor: color, borderRadius: 2 }} />
            <View style={{ width: size * 0.4, height: size * 0.4, backgroundColor: color, borderRadius: 2 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            <View style={{ width: size * 0.4, height: size * 0.4, backgroundColor: color, borderRadius: 2 }} />
            <View style={{ width: size * 0.4, height: size * 0.4, backgroundColor: color, borderRadius: 2 }} />
          </View>
        </View>
      );
    case 'barcode':
      return (
        <View style={iconBoxStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, height: size * 0.8 }}>
            <View style={{ width: 2, height: '100%', backgroundColor: color }} />
            <View style={{ width: 1, height: '100%', backgroundColor: color }} />
            <View style={{ width: 3, height: '100%', backgroundColor: color }} />
            <View style={{ width: 1, height: '100%', backgroundColor: color }} />
            <View style={{ width: 2, height: '100%', backgroundColor: color }} />
            <View style={{ width: 3, height: '100%', backgroundColor: color }} />
          </View>
        </View>
      );
    case 'profile':
      return (
        <View style={iconBoxStyle}>
          <View style={{ width: size * 0.45, height: size * 0.45, borderRadius: size * 0.225, backgroundColor: color, marginBottom: 1 }} />
          <View style={{ width: size * 0.8, height: size * 0.35, borderTopLeftRadius: size * 0.4, borderTopRightRadius: size * 0.4, backgroundColor: color }} />
        </View>
      );
    case 'settings':
      return (
        <View style={iconBoxStyle}>
          <View style={{ width: size * 0.75, height: size * 0.75, borderRadius: size * 0.375, borderWidth: 3, borderColor: color, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size * 0.25, height: size * 0.25, borderRadius: size * 0.125, backgroundColor: color }} />
          </View>
        </View>
      );
    case 'plus':
      return (
        <View style={iconBoxStyle}>
          <View style={{ position: 'absolute', width: size * 0.7, height: 2, backgroundColor: color }} />
          <View style={{ position: 'absolute', width: 2, height: size * 0.7, backgroundColor: color }} />
        </View>
      );
    case 'minus':
      return (
        <View style={iconBoxStyle}>
          <View style={{ width: size * 0.7, height: 2, backgroundColor: color }} />
        </View>
      );
    case 'cart':
      return (
        <View style={iconBoxStyle}>
          <View style={{ width: size * 0.75, height: size * 0.55, borderWidth: 2, borderColor: color, borderRadius: 3, marginBottom: 2 }}>
            <View style={{ position: 'absolute', top: -4, left: 3, width: size * 0.35, height: 4, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderWidth: 1.5, borderColor: color, borderBottomWidth: 0 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: color }} />
            <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: color }} />
          </View>
        </View>
      );
    case 'check':
      return (
        <View style={iconBoxStyle}>
          <Text style={{ color, fontSize: size * 0.85, fontWeight: '900', lineHeight: size }}>✓</Text>
        </View>
      );
    case 'users':
      return (
        <View style={iconBoxStyle}>
          <View style={{ flexDirection: 'row', gap: -3, alignItems: 'center' }}>
            <View style={{ width: size * 0.35, height: size * 0.35, borderRadius: size * 0.175, backgroundColor: color }} />
            <View style={{ width: size * 0.45, height: size * 0.45, borderRadius: size * 0.225, backgroundColor: color }} />
          </View>
        </View>
      );
    case 'refresh':
      return (
        <View style={iconBoxStyle}>
          <Text style={{ color, fontSize: size * 0.85, fontWeight: '900', lineHeight: size }}>↻</Text>
        </View>
      );
    case 'close':
      return (
        <View style={iconBoxStyle}>
          <Text style={{ color, fontSize: size * 0.85, fontWeight: '900', lineHeight: size }}>✕</Text>
        </View>
      );
    case 'receipt':
      return (
        <View style={iconBoxStyle}>
          <View style={{ width: size * 0.65, height: size * 0.8, borderWidth: 2, borderColor: color, borderRadius: 2, padding: 2, justifyContent: 'space-around' }}>
            <View style={{ width: '100%', height: 1.5, backgroundColor: color }} />
            <View style={{ width: '80%', height: 1.5, backgroundColor: color }} />
            <View style={{ width: '60%', height: 1.5, backgroundColor: color }} />
          </View>
        </View>
      );
    default:
      return (
        <View style={iconBoxStyle}>
          <View style={{ width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3, borderWidth: 2, borderColor: color }} />
        </View>
      );
  }
}
