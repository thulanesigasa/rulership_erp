import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SvgIcon } from './src/components/SvgIcon';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen onNavigate={setActiveTab} />;
      case 'scanner':
        return <ScannerScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen onNavigate={setActiveTab} />;
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Active Main View Content */}
      <View style={styles.mainContainer}>
        {renderActiveScreen()}
      </View>

      {/* Bottom Tab Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'dashboard' ? styles.navItemActive : null]}
          onPress={() => setActiveTab('dashboard')}
        >
          <SvgIcon name="dashboard" size={20} color={activeTab === 'dashboard' ? '#0058be' : '#64748b'} />
          <Text style={[styles.navText, activeTab === 'dashboard' ? styles.navTextActive : null]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'scanner' ? styles.navItemActive : null]}
          onPress={() => setActiveTab('scanner')}
        >
          <SvgIcon name="barcode" size={20} color={activeTab === 'scanner' ? '#0058be' : '#64748b'} />
          <Text style={[styles.navText, activeTab === 'scanner' ? styles.navTextActive : null]}>Barcode</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'profile' ? styles.navItemActive : null]}
          onPress={() => setActiveTab('profile')}
        >
          <SvgIcon name="profile" size={20} color={activeTab === 'profile' ? '#0058be' : '#64748b'} />
          <Text style={[styles.navText, activeTab === 'profile' ? styles.navTextActive : null]}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'settings' ? styles.navItemActive : null]}
          onPress={() => setActiveTab('settings')}
        >
          <SvgIcon name="settings" size={20} color={activeTab === 'settings' ? '#0058be' : '#64748b'} />
          <Text style={[styles.navText, activeTab === 'settings' ? styles.navTextActive : null]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  navBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#0058be'
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 3
  },
  navTextActive: {
    color: '#0058be'
  }
});
