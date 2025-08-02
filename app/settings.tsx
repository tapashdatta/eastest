// app/settings.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import SettingsScreen from '@/screens/settings/SettingsScreen';

export default function Settings() {
  console.log('🔧 Settings page component loaded');
  
  return (
    <View style={styles.container}>
      <SettingsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});