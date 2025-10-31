/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, ReactNode } from 'react';
import { WalletConnectContextType } from '../types/wallet';

const defaultValue: WalletConnectContextType = {
  accountId: '',
  setAccountId: () => {},
  isConnected: false,
  setIsConnected: () => {},
  // Add the optional methods to match the type
  connectWallet: undefined,
  disconnectWallet: undefined,
};

export const WalletConnectContext = createContext<WalletConnectContextType>(defaultValue);

export const WalletConnectContextProvider = (props: { children: ReactNode | undefined }) => {
  const [accountId, setAccountId] = useState(defaultValue.accountId);
  const [isConnected, setIsConnected] = useState(defaultValue.isConnected);

  // Addeed empty function placeholders to match the type
  const connectWallet = async (): Promise<void> => {};

  const disconnectWallet = (): void => {
    //  disconnect logic
  };

  return (
    <WalletConnectContext.Provider
      value={{
        accountId,
        setAccountId,
        isConnected,
        setIsConnected,
        connectWallet,
        disconnectWallet,
      }}
    >
      {props.children}
    </WalletConnectContext.Provider>
  );
};
