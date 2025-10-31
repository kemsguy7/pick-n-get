'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, Bell, Wallet, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLayout } from './LayoutProvider';
import { useWalletInterface } from '../../../app/services/wallets/useWalletInterface';
import { useAuth } from '../../contexts/AuthContext';
import { WalletSelectionDialog } from '../walletConnection/WalletSelectionDialog';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  className?: string;
  showSidebarToggle?: boolean;
}

const Header: React.FC<HeaderProps> = ({ className = '', showSidebarToggle = false }) => {
  const [activeLink, setActiveLink] = useState('Home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toggleSidebar } = useLayout();
  const { accountId, walletInterface } = useWalletInterface();

  // ✅ ADD AUTH HOOK
  const { user, login, logout, isLoading } = useAuth();

  // Mock data for demo - replace with real data later
  const walletData = {
    balance: '2,450',
    co2Saved: '23.4kg',
    notifications: 2,
    userName: user?.userData?.name || 'User',
    userAvatar: user?.userData?.profileImage || '/api/placeholder/32/32',
  };

  const navLinks = ['Home', 'Recycle', 'How It Works', 'Features', 'Shop', 'FAQs', 'Contact'];

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  // ✅ AUTO-LOGIN WHEN WALLET CONNECTS
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (accountId && !user && !isLoading) {
        console.log('🔗 Wallet connected, attempting login...');
        try {
          await login(accountId);
        } catch (error) {
          console.error('❌ Auto-login failed:', error);
        }
      }
    };

    handleWalletConnection();
  }, [accountId, user, isLoading, login]);

  // Close wallet dialog when connected
  useEffect(() => {
    if (accountId) {
      setOpen(false);
    }
  }, [accountId]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const theme = newTheme ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  // ✅ UPDATED CONNECT/DISCONNECT HANDLER
  const handleConnect = async () => {
    if (accountId) {
      // Disconnect wallet AND logout
      walletInterface?.disconnect();
      logout();
    } else {
      setOpen(true);
    }
  };

  const getDisplayAddress = () => {
    if (!accountId) return '';

    // Shorten the address for display
    if (accountId.length > 10) {
      return `${accountId.slice(0, 6)}...${accountId.slice(-4)}`;
    }
    return accountId;
  };

  const handleLinkClick = (link: string) => {
    setActiveLink(link);
    setIsMobileMenuOpen(false);

    switch (link) {
      case 'Home':
        router.push('/');
        break;
      case 'How It Works':
        router.push('/how-it-works');
        break;
      case 'Features':
        router.push('/features');
        break;
      case 'Shop':
        router.push('/shop');
        break;
      case 'FAQs':
        router.push('/faqs');
        break;
      case 'Contact':
        router.push('/contact');
        break;
      case 'Recycle':
        router.push('/recycle');
        break;
      default:
        router.push('/');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className={`header-gradient backdrop-blur-custom relative z-50 ${className}`}>
        <div className="mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex h-14 items-center justify-between sm:h-16 lg:h-20">
            {/* Left Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Sidebar Toggle (only show when sidebar is enabled) */}
              {showSidebarToggle && (
                <button
                  onClick={toggleSidebar}
                  className="menu-button rounded-lg p-1.5 text-white transition-colors duration-200 hover:bg-white/20 sm:p-2 lg:hidden"
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}

              {/* Logo */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center sm:h-10">
                  <Link href="/" passHref>
                    <Image src="/EcoCleanLogo.png" width={150} height={150} alt="EcoCleans Logo" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Center - Navigation Links */}
            <nav className={`hidden items-center gap-1 space-x-2 lg:flex xl:gap-3`}>
              {navLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => handleLinkClick(link)}
                  className={`nav-link focus-visible rounded-lg px-2 py-2 text-sm transition-all duration-200 xl:px-3 xl:text-base ${
                    activeLink === link
                      ? 'active-link text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  } `}
                >
                  {link}
                </button>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="focus-visible flex-shrink-0 rounded-full p-1.5 transition-colors duration-200 hover:bg-white/20 sm:p-2"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                ) : (
                  <Moon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                )}
              </button>

              {/* Wallet Connected State - ✅ NOW USES AUTH USER */}
              {user && accountId ? (
                <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
                  {/* Token Balance */}
                  <div className="hidden flex-shrink-0 items-center gap-1 rounded-lg border border-green-500/30 bg-green-500/20 px-2 py-1 sm:flex">
                    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-green-400"></div>
                    <span className="text-xs font-medium whitespace-nowrap text-green-400">
                      {walletData.balance}ECO
                    </span>
                  </div>

                  {/* CO2 Saved */}
                  <div className="hidden flex-shrink-0 items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/20 px-2 py-1 lg:flex">
                    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-400"></div>
                    <span className="text-xs font-medium whitespace-nowrap text-blue-400">
                      {walletData.co2Saved}CO₂
                    </span>
                  </div>

                  {/* Notification Bell */}
                  <button className="relative flex-shrink-0 rounded-full p-1.5 transition-colors duration-200 hover:bg-white/20 sm:p-2">
                    <Bell className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                    {walletData.notifications > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                        {walletData.notifications}
                      </span>
                    )}
                  </button>

                  {/* User Profile / Wallet Info */}
                  <div className="group relative">
                    <div className="flex max-w-[120px] flex-shrink-0 cursor-pointer items-center gap-1 rounded-lg p-1 transition-colors duration-200 hover:bg-white/10 sm:gap-2">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-purple-400 to-blue-400 sm:h-8 sm:w-8">
                        <Wallet className="h-4 w-4 text-white" />
                      </div>
                      <div className="hidden text-left sm:block">
                        <div className="truncate text-xs font-medium text-white">
                          {user.primaryRole}
                        </div>
                        <div className="truncate text-xs text-white/70">{getDisplayAddress()}</div>
                      </div>
                    </div>

                    {/* Disconnect Dropdown */}
                    <div className="invisible absolute top-full right-0 mt-2 w-48 rounded-lg border border-white/20 bg-white/10 opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:visible group-hover:opacity-100">
                      <div className="p-2">
                        <div className="mb-2 border-b border-white/20 pb-2">
                          <p className="text-xs text-white/70">Roles:</p>
                          <p className="text-xs font-medium text-white">{user.roles.join(', ')}</p>
                        </div>
                        <button
                          onClick={handleConnect}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-white/10"
                        >
                          <LogOut className="h-4 w-4" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Connect Wallet Button */
                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="gradient-button focus-visible flex-shrink-0 rounded-lg px-2 py-1 text-xs font-semibold whitespace-nowrap transition-all duration-200 hover:shadow-lg disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-sm lg:text-base"
                >
                  {isLoading ? 'Loading...' : 'Connect Wallet'}
                </button>
              )}

              {/* Mobile Menu Toggle (only show when no sidebar) */}
              {!showSidebarToggle && (
                <button
                  onClick={toggleMobileMenu}
                  className="focus-visible menu-button p-1.5 sm:p-2 lg:hidden"
                  aria-label="Toggle menu"
                >
                  <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
                    <div className="hamburger-line"></div>
                    <div className="hamburger-line"></div>
                    <div className="hamburger-line"></div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {!showSidebarToggle && isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-white"
                aria-label="Close menu"
              >
                <div className="hamburger open">
                  <div className="hamburger-line"></div>
                  <div className="hamburger-line"></div>
                  <div className="hamburger-line"></div>
                </div>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Wallet Selection Dialog */}
      <WalletSelectionDialog open={open} setOpen={setOpen} onClose={() => setOpen(false)} />

      {/* Mobile Menu (only show when no sidebar) */}
      {!showSidebarToggle && (
        <div
          className={`mobile-menu-container fixed top-14 right-0 left-0 z-50 transform transition-all duration-300 ease-in-out sm:top-16 lg:hidden ${
            isMobileMenuOpen
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-full opacity-0'
          } `}
        >
          <div className="header-gradient backdrop-blur-custom border-t border-white/10">
            <nav className="mx-auto max-w-[90vw] px-4 py-4">
              <div className="flex flex-col space-y-2">
                {/* Mobile Wallet Info (when connected) - ✅ SHOWS USER ROLES */}
                {user && accountId && (
                  <div className="mb-2 flex items-center justify-between rounded-lg bg-white/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-blue-400">
                        <Wallet className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.primaryRole}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-white/70">{getDisplayAddress()}</span>
                          <span className="text-green-400">{walletData.balance}ECO</span>
                          <span className="text-blue-400">{walletData.co2Saved}CO₂</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleConnect} className="text-xs text-red-400">
                      Disconnect
                    </button>
                  </div>
                )}

                {navLinks.map((link, index) => (
                  <button
                    key={link}
                    onClick={() => handleLinkClick(link)}
                    className={`nav-link focus-visible transform rounded-lg px-4 py-3 text-left transition-all duration-200 hover:scale-105 ${
                      activeLink === link
                        ? 'active-link text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    } `}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {link}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
