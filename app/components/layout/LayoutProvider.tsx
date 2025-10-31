/* eslint-disable react-refresh/only-export-components */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AllWalletsProvider } from '../../services/wallets/AllWalletsProvider';
import { AgentSignupProvider } from '../../contexts/AgentSignupContext';
import { AuthProvider } from '../../contexts/AuthContext';
interface LayoutContextType {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const setSidebarOpen = (open: boolean) => setIsSidebarOpen(open);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Close sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AllWalletsProvider>
      <AuthProvider>
        <AgentSignupProvider>
          <LayoutContext.Provider value={{ isSidebarOpen, setSidebarOpen, toggleSidebar }}>
            {children}
          </LayoutContext.Provider>
        </AgentSignupProvider>
      </AuthProvider>
    </AllWalletsProvider>
  );
};
