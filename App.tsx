import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { PublicDashboard } from './components/PublicDashboard';
import { SignageView } from './components/SignageView';
import { SignageData } from './types';
import { getSignages } from './utils/storage';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'viewer' | 'public'>('dashboard');
  const [selectedSignage, setSelectedSignage] = useState<SignageData | null>(null);
  const [signageList, setSignageList] = useState<SignageData[]>([]);

  const refreshData = async () => {
    const data = await getSignages();
    setSignageList(data);
  };

  useEffect(() => {
    refreshData();
    // Check URL params for "public" mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'public') {
      setView('public');
    }
  }, []);

  const handleSelectSignage = (data: SignageData) => {
    setSelectedSignage(data);
    setView('viewer');
  };

  const handleBack = () => {
    // If we came from public list, go back there
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'public') {
      setView('public');
    } else {
      setView('dashboard');
    }
    setSelectedSignage(null);
  };
  
  // Navigation Handlers
  const switchToPublic = () => {
    // Update URL without reload to allow bookmarking
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'public');
    window.history.pushState({}, '', url);
    setView('public');
  };

  const switchToAdmin = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('mode');
    window.history.pushState({}, '', url);
    setView('dashboard');
  };

  if (view === 'viewer' && selectedSignage) {
    return (
      <SignageView 
        data={selectedSignage} 
        onBack={handleBack}
      />
    );
  }

  if (view === 'public') {
    return (
      <PublicDashboard 
        signages={signageList}
        onSelect={handleSelectSignage}
        onGoToAdmin={switchToAdmin}
      />
    );
  }

  return (
    <AdminDashboard 
      signages={signageList}
      onRefresh={refreshData}
      onSelect={handleSelectSignage}
      onSwitchToPublic={switchToPublic}
    />
  );
}
