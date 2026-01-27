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
  const [isReady, setIsReady] = useState(false);

  // Load Data function
  const refreshData = async () => {
    // Fetch data (will grab local storage instantly if cloud is slow)
    const data = await getSignages();
    setSignageList(data || []);
    setIsReady(true);
  };

  useEffect(() => {
    refreshData();
    
    // Check URL Mode
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
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'public') {
      setView('public');
    } else {
      setView('dashboard');
    }
    setSelectedSignage(null);
  };
  
  const switchToPublic = () => {
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

  // Safe loading state
  if (!isReady) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-gray-400 font-medium animate-pulse">Memuat Data...</div>
        </div>
      );
  }

  // RENDER LOGIC
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
