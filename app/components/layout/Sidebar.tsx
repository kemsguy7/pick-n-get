
'use client';

import React, { useState, useEffect} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Recycle, 
  Wallet, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Gift, 
  Settings,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';
import { useLayout } from './LayoutProvider';


interface SidebarProps {
  className?: string;
}



const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {

  //state to track active link  
  const [isActive, setIsActive] = useState<string>('');

  console.log(isActive);
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useLayout();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Recycle, label: 'Recycle', path: '/recycle' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: ShoppingBag, label: 'EcoShop', path: '/shop' },
    { icon: TrendingUp, label: 'Tracking', path: '/tracking' },
    { icon: Users, label: 'Agents', path: '/agents' },
    { icon: Gift, label: 'Rewards', path: '/rewards' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];


  // update active item when pathname changes (for browser navigation) 
 useEffect(() => { 
    setIsActive(pathname);
 }, [pathname])

  const handleNavigation = (path: string) => {

    // Set the clicked item as active immediately
    setIsActive(path);

    // Navigate to the new Route
    router.push(path);

    // Close sidebar on mobile after navigation 
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logging out...');
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 z-50 transform transition-transform font-space-grotesk duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${className}
      `}>
        <div 
          className="h-full w-full backdrop-blur-[30px]"
          style={{
            background: 'linear-gradient(162.26deg, #0D1B1E 10.67%, #142E2C 50.23%)',
            boxShadow: '-3px -3px 10px 0px #FFFFFF1A inset'
          }}
        >
          {/* Mobile Close Button */}
          <div className="flex justify-end p-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="px-4 pb-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-lg
                      transition-all duration-200 font-space-grotesk font-medium
                      ${isActive 
                        ? 'bg-[#1ED76033] text-primary border border-[#1ED7601A]' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-white/10" />

            {/* Help & Support */}
            <div className="space-y-2">
              <button
                onClick={() => handleNavigation('/help')}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                  transition-all duration-200 font-inter font-medium
                  ${pathname === '/help'
                    ? 'bg-primary-green/20 text-primary-green border border-primary-green/30' 
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                  }
                `}
              >
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Help & Support</span>
              </button>

              <button
                onClick={handleLogout}
                className="
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                  transition-all duration-200 font-inter font-medium
                  text-white/60 hover:text-red-400 hover:bg-red-400/10
                "
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Log Out</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;