// app/(tabs)/account.tsx
import React, { useState } from 'react';
import MyAccount from '@/screens/myaccount/MyProfile';
import DonationHistoryScreen from '@/screens/myaccount/FullDonationHistory';
import DevicesScreen from '@/screens/myaccount/MyDevices';

export default function AccountPage() {
  const [currentView, setCurrentView] = useState<'account' | 'donations' | 'devices'>('account');

  // Function to switch to donation history
  const showDonationHistory = () => {
    setCurrentView('donations');
  };

  // Function to switch to devices
  const showDevices = () => {
    setCurrentView('devices');
  };

  // Function to go back to account
  const showAccount = () => {
    setCurrentView('account');
  };

  if (currentView === 'donations') {
    return <DonationHistoryScreen onBack={showAccount} />;
  }

  if (currentView === 'devices') {
    return <DevicesScreen onBack={showAccount} />;
  }

  return <MyAccount onShowDonationHistory={showDonationHistory} onShowDevices={showDevices} />;
}