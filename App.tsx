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
  const [isLoaded, setIsLoaded] = useState(false);

  // Function to load data properly
  const refreshData = async () => {
    try {
      const data = await getSignages();
      setSignageList(data || []);
    } catch (e) {
      console.error("Failed to load data", e);
      setSignageList([]);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    refreshData();
    
    // Check URL params for "public" mode (untuk Smart TV)
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
  
  // Navigation Handlers
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

  if (!isLoaded) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-sans">
            <div className="text-center">
                <p className="mb-2">Menghubungkan Database...</p>
                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
        </div>
      );
  }

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
