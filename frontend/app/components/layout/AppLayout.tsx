'use client';

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = false,
  showHeader = true,
  showFooter = false,
  className = '',
}) => {
  // const { isSidebarOpen } = useLayout();

  return (
    <div className={`min-h-screen ${className}`}>
      {showHeader && <Header showSidebarToggle={showSidebar} />}

      <div className="flex">
        {showSidebar && <Sidebar />}

        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${showSidebar ? 'ml-0 lg:ml-6' : ''} ${showHeader && !showSidebar ? 'pt-0' : ''} `}
        >
          {children}
        </main>
      </div>

      {showFooter && (
        <div className={`${showSidebar ? 'ml-0' : ''} mt-16`}>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default AppLayout;
