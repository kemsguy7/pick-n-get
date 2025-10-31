'use client';

import React, { useContext, useEffect, useState } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MetamaskContext } from '../../../contexts/MetamaskContext';
import { WalletConnectContext } from '../../../contexts/WalletConnectContext';
import { useWalletInterface } from '../../../services/wallets/useWalletInterface';

import { WalletInterface } from '../../../services/wallets/walletInterface';
import { checkRiderRegistration } from '../../../services/riderService';
import { useAgentSignup } from '../../../contexts/AgentSignupContext';
import AppLayout from '../../../components/layout/AppLayout';

// Declare window.ethereum for TypeScript

// Convert wallet interface data to format expected by riderService
const createWalletData = (
  accountId: string,
  walletInterface: WalletInterface | null,
  network: string = 'testnet',
): [string, WalletInterface | null, string] => {
  return [accountId, walletInterface, network];
};

export default function AgentSignupStep1(): React.JSX.Element {
  const router = useRouter();

  // Get wallet contexts
  const metamaskCtx = useContext(MetamaskContext);
  const walletConnectCtx = useContext(WalletConnectContext);
  const { accountId, walletInterface } = useWalletInterface();

  // Get signup context
  const { updateWalletInfo, setCurrentStep, signupData } = useAgentSignup();

  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const [registrationError, setRegistrationError] = useState('');

  const isConnected = !!(
    (accountId && walletInterface) ||
    metamaskCtx.metamaskAccountAddress ||
    walletConnectCtx.accountId
  );

  useEffect(() => {
    setCurrentStep(1);
  }); //removed dependency array

  useEffect(() => {
    if (isConnected && accountId && walletInterface) {
      const currentWalletAddress = signupData.walletAddress;
      if (!currentWalletAddress || currentWalletAddress !== accountId) {
        const walletType = metamaskCtx.metamaskAccountAddress ? 'MetaMask' : 'WalletConnect';
        updateWalletInfo(accountId, walletType);
      }

      if (!isCheckingRegistration && !registrationError) {
        checkExistingRegistration();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, walletInterface, isConnected]);

  const checkExistingRegistration = async (): Promise<void> => {
    setIsCheckingRegistration(true);
    setRegistrationError('');

    try {
      console.log('Checking existing rider registration...');

      const walletData = createWalletData(accountId!, walletInterface!);
      const result = await checkRiderRegistration(walletData);

      if (result.isRegistered) {
        console.log('Rider already registered, redirecting...');

        if (result.riderStatus === 0) {
          // Pending
          router.push('/agents/pending');
        } else if (result.riderStatus === 1) {
          // Approved
          router.push('/dashboard');
        } else if (result.riderStatus === 2) {
          // Rejected
          router.push('/agents/rejected');
        } else if (result.riderStatus === 3) {
          // Banned
          router.push('/agents/banned');
        } else {
          router.push('/dashboard');
        }
      } else {
        console.log('No existing registration found, proceeding with signup');
      }
    } catch (error) {
      console.error('Error checking registration:', error);
      setRegistrationError(
        'Failed to check existing registration. You can still proceed with signup.',
      );
    } finally {
      setIsCheckingRegistration(false);
    }
  };

  const handleContinue = () => {
    console.log('Continue button clicked!');
    console.log('Values:', {
      isConnected,
      isCheckingRegistration,
      buttonDisabled: !isConnected || isCheckingRegistration,
    });

    if (isConnected && !isCheckingRegistration) {
      console.log('Conditions met, navigating...'); // You should see this
      console.log('About to call router.push');
      router.push('/auth/signup/agent/personal-info');
      console.log('router.push called');
    } else {
      console.log('Navigation blocked');
    }
  };

  const getWalletStatus = () => {
    if (metamaskCtx.metamaskAccountAddress) {
      return {
        type: 'MetaMask',
        address: metamaskCtx.metamaskAccountAddress,
        connected: true,
      };
    } else if (walletConnectCtx.accountId) {
      return {
        type: 'WalletConnect',
        address: walletConnectCtx.accountId,
        connected: true,
      };
    } else if (accountId) {
      return {
        type: 'Connected',
        address: accountId,
        connected: true,
      };
    }
    return {
      type: 'None',
      address: '',
      connected: false,
    };
  };

  const walletStatus = getWalletStatus();

  return (
    <AppLayout showHeader={true} showFooter={false} showSidebar={false}>
      <div className="body-gradient flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500">
              <div className="h-8 w-8 rounded-lg bg-white"></div>
            </div>
            <h1 className="font-space-grotesk text-2xl font-bold text-white">Join EcoCleans</h1>
            <p className="font-inter text-gray-300">Start your sustainable journey today</p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl bg-white p-6">
            {/* Progress Header */}
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-space-grotesk text-xl font-bold text-black">Create Account</h2>
                <span className="font-inter text-sm text-gray-500">Step 1 of 4</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-1/4 rounded-full bg-green-500"></div>
              </div>
            </div>

            {/* Error Display */}
            {registrationError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-700">{registrationError}</span>
              </div>
            )}

            {/* Wallet Connection Content */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-space-grotesk mb-2 text-lg font-semibold text-black">
                  Connect Your Wallet
                </h3>
                <p className="font-inter text-sm text-gray-600">
                  Securely connect using your Web3 wallet to register as an agent
                </p>
              </div>

              {isCheckingRegistration ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                  <p className="font-inter text-blue-600">Checking existing registration...</p>
                  <p className="font-inter text-sm text-gray-500">
                    Please wait while we verify your account status
                  </p>
                </div>
              ) : !walletStatus.connected ? (
                <div className="space-y-4">
                  {/* Wallet Connection Instructions */}
                  <div className="space-y-3">
                    <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-gray-300">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                        <span className="text-sm font-bold text-orange-600">M</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-inter font-medium text-gray-800">MetaMask</span>
                        <p className="text-xs text-gray-500">
                          Use the wallet connection button in the header
                        </p>
                      </div>
                      {typeof window !== 'undefined' && !window.ethereum && (
                        <span className="text-xs text-gray-500">Not Installed</span>
                      )}
                    </div>

                    <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-gray-300">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                        <span className="text-sm font-bold text-blue-600">W</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-inter font-medium text-gray-800">WalletConnect</span>
                        <p className="text-xs text-gray-500">
                          Use the wallet connection button in the header
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="mb-2 text-sm font-medium text-blue-800">How to connect:</p>
                    <ol className="list-inside list-decimal space-y-1 text-xs text-blue-700">
                      <li>Use the "Connect Wallet" button in the header above</li>
                      <li>Choose your preferred wallet (MetaMask or WalletConnect)</li>
                      <li>Approve the connection in your wallet</li>
                      <li>Return here to continue registration</li>
                    </ol>
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={() => window.location.reload()}
                    className="font-inter w-full rounded-xl bg-gray-100 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    Refresh Page
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="font-inter font-medium text-green-600">
                    Wallet Connected Successfully
                  </p>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-700">
                      Connected via {walletStatus.type}
                    </p>
                    <p className="font-mono text-xs break-all text-gray-500">
                      {walletStatus.address}
                    </p>
                  </div>
                  <p className="font-inter text-sm text-gray-500">
                    Ready to proceed with agent registration
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleContinue}
                disabled={!isConnected || isCheckingRegistration}
                className="font-space-grotesk flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isCheckingRegistration ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking Registration...
                  </>
                ) : (
                  'Continue →'
                )}
              </button>

              <button
                onClick={() => router.back()}
                disabled={isCheckingRegistration}
                className="font-space-grotesk w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                ← Back
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 space-y-2">
              <p className="font-inter text-center text-sm text-gray-600">
                Want to register as a recycler instead?{' '}
                <span
                  className="cursor-pointer text-green-500 hover:underline"
                  onClick={() => router.push('/auth/signup/recycler')}
                >
                  Sign up here
                </span>
              </p>
              <div className="flex items-center justify-center">
                <span className="font-inter cursor-pointer text-sm text-green-500">
                  Join the sustainable revolution
                </span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="font-inter text-center text-xs text-blue-700">
                <strong>Security:</strong> Your wallet connection is secure and encrypted. We never
                store your private keys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
