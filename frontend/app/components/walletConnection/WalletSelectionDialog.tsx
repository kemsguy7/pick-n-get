'use client';

import { connectToMetamask } from '../../../app/services/wallets/metamask/metamaskClient';
import { openWalletConnectModal } from '../../../app/services/wallets/walletconnect/walletConnectClient';

import MetamaskLogo from '../../../public/metamask-logo.svg';
import WalletConnectLogo from '../../../public/walletconnect-logo.svg';

interface WalletSelectionDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onClose: (value: string) => void;
}

export const WalletSelectionDialog = (props: WalletSelectionDialogProps) => {
  const { open, setOpen } = props;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg">
        <h3 className="mb-4 text-center text-xl font-semibold text-white">Connect Wallet</h3>
        <div className="space-y-3">
          <button
            onClick={() => {
              openWalletConnectModal();
              setOpen(false);
            }}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-white/10 p-3 font-medium text-white transition-colors duration-200 hover:bg-white/20"
          >
            <img src={WalletConnectLogo} alt="walletconnect logo" className="-ml-1.5 h-6 w-6" />
            WalletConnect
          </button>

          <button
            onClick={async () => {
              console.log('MetaMask button clicked');
              try {
                const accounts = await connectToMetamask();
                console.log('Connection result:', accounts);

                // Force close dialog on any successful interaction
                // The state update will be handled by the MetaMaskClient
                if (accounts && accounts.length > 0) {
                  // Add small delay to ensure state updates
                  setTimeout(() => {
                    setOpen(false);
                  }, 100);
                }
              } catch (error) {
                console.error('Error connecting to MetaMask:', error);
              }
            }}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-white/10 p-3 font-medium text-white transition-colors duration-200 hover:bg-white/20"
          >
            <img src={MetamaskLogo} alt="metamask logo" className="h-6 w-6 p-1 pr-0" />
            Metamask
          </button>
        </div>

        <button
          onClick={() => setOpen(false)}
          className="mt-4 w-full py-2 text-white/70 transition-colors duration-200 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
