/* eslint-disable react-refresh/only-export-components */

import { createContext, useState, ReactNode } from 'react';
import { MetamaskContextType } from '../types/wallet';

const defaultValue: MetamaskContextType = {
  metamaskAccountAddress: '',
  setMetamaskAccountAddress: () => {},
  isMetamaskConnected: false,
};

export const MetamaskContext = createContext<MetamaskContextType>(defaultValue);

interface MetamaskContextProviderProps {
  children: ReactNode;
}

export const MetamaskContextProvider = ({ children }: MetamaskContextProviderProps) => {
  const [metamaskAccountAddress, setMetamaskAccountAddress] = useState<string>('');
  const [isMetamaskConnected, setIsMetamaskConnected] = useState<boolean>(false);

  const connectMetamask = async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = (await window.ethereum.request({
          method: 'eth_requestAccounts',
        })) as string[];
        setMetamaskAccountAddress(accounts[0]);
        setIsMetamaskConnected(true);
      } else {
        throw new Error('MetaMask is not installed');
      }
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
      throw error;
    }
  };

  const disconnectMetamask = (): void => {
    setMetamaskAccountAddress('');
    setIsMetamaskConnected(false);
  };

  return (
    <MetamaskContext.Provider
      value={{
        metamaskAccountAddress,
        setMetamaskAccountAddress,
        isMetamaskConnected,
        connectMetamask,
        disconnectMetamask,
      }}
    >
      {children}
    </MetamaskContext.Provider>
  );
};
