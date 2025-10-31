// export interface MetamaskContextType {
//   metamaskAccountAddress: string | null;
//   connectMetamask?: () => Promise<void>;
//   disconnectMetamask?: () => void;
//   isMetamaskConnected: boolean;
// }

// export interface WalletConnectContextType {
//   accountId: string;
//   setAccountId: (newValue: string) => void;
//   isConnected: boolean;
//   setIsConnected: (newValue: boolean) => void;
//   connectWallet?: () => Promise<void>;
//   disconnectWallet?: () => void;
// }

// types/wallet.ts
export interface MetamaskContextType {
  metamaskAccountAddress: string;
  setMetamaskAccountAddress: (newValue: string) => void;
  isMetamaskConnected: boolean;
  connectMetamask?: () => Promise<void>;
  disconnectMetamask?: () => void;
}

// export interface WalletConnectContextType {
//   accountId: string;
//   setAccountId: (newValue: string) => void;
//   isConnected: boolean;
//   setIsConnected: (newValue: boolean) => void;
//   connectWallet?: () => Promise<void>;
//   disconnectWallet?: () => void;
// }
export interface WalletConnectContextType {
  accountId: string;
  setAccountId: (newValue: string) => void;
  isConnected: boolean;
  setIsConnected: (newValue: boolean) => void;
  connectWallet?: () => Promise<void>;
  disconnectWallet?: () => void;
}