'use client';

import React, { useState, useContext, ChangeEvent } from 'react';
import { Check, Loader2, AlertCircle, Wallet, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MetamaskContext } from '../../../contexts/MetamaskContext';
import { WalletConnectContext } from '../../../contexts/WalletConnectContext';
import { useWalletInterface } from '../../../services/wallets/useWalletInterface';
import { WalletInterface } from '../../../services/wallets/walletInterface';
import AppLayout from '../../../components/layout/AppLayout';

interface VendorFormData {
  name: string;
  businessName: string;
  country: string;
  phoneNumber: string;
}

const createWalletData = (
  accountId: string,
  walletInterface: WalletInterface | null,
  network: string = 'testnet',
): [string, WalletInterface | null, string] => {
  return [accountId, walletInterface, network];
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';

export default function VendorSignupPage(): React.JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [contractResult, setContractResult] = useState<{
    success: boolean;
    txHash?: string;
    registrationId?: number;
    error?: string;
  } | null>(null);
  const router = useRouter();

  const metamaskCtx = useContext(MetamaskContext);
  const walletConnectCtx = useContext(WalletConnectContext);
  const { accountId, walletInterface } = useWalletInterface();

  const isConnected = !!(accountId && walletInterface);

  const [vendorForm, setVendorForm] = useState<VendorFormData>({
    name: '',
    businessName: '',
    country: '',
    phoneNumber: '',
  });

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setVendorForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContinue = (): void => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2 && isConnected) {
      setCurrentStep(3);
    } else if (currentStep === 2 && !isConnected) {
      setError('Please connect your wallet to continue');
    }
  };

  const validateForm = (): string | null => {
    if (!vendorForm.name.trim()) return 'Name is required';
    if (!vendorForm.businessName.trim()) return 'Business name is required';
    if (!vendorForm.country.trim()) return 'Country is required';
    if (!vendorForm.phoneNumber.trim()) return 'Phone number is required';
    if (vendorForm.phoneNumber.trim().length < 4) {
      return 'Phone number must be at least 4 characters';
    }
    return null;
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    setLoadingMessage('Preparing registration...');

    try {
      if (!isConnected || !accountId) {
        throw new Error('Wallet not connected');
      }

      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      // Step 1: Register on Smart Contract FIRST
      setLoadingMessage('Registering on blockchain...');

      const producerData = {
        name: vendorForm.name,
        country: vendorForm.country,
        phoneNumber: vendorForm.phoneNumber,
      };

      const walletData = createWalletData(accountId, walletInterface);
      // Call smart contract registerProducer
      const { registerProducer } = await import('../../../services/productService');
      const contractResult = await registerProducer(walletData, producerData);

      if (!contractResult.success) {
        throw new Error(contractResult.error || 'Blockchain registration failed');
      }

      // ✅ Check if already saved by productService
      if (contractResult.web2Saved) {
        console.log('✅ Already saved to backend by productService');
        setSuccess(
          `Registration successful! Transaction: ${contractResult.txHash?.substring(0, 10)}...`,
        );
        // Skip duplicate save, go straight to redirect
        setTimeout(() => router.push('/vendors'), 2000);
        return; // ✅ Exit early
      }

      // Otherwise save to backend
      setLoadingMessage('Saving to database...');
      setContractResult(contractResult);
      console.log(contractResult);
      const response = await fetch(`${BACKEND_URL}/products/producers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: contractResult.registrationId || Date.now(),
          walletAddress: accountId,
          name: vendorForm.name,
          businessName: vendorForm.businessName || vendorForm.name,
          country: vendorForm.country,
          phoneNumber: vendorForm.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('⚠️ Backend save failed (blockchain succeeded)');
        // Continue anyway - blockchain is source of truth
      } else {
        console.log('✅ Backend save successful:', data);
      }

      setLoadingMessage('');
      setSuccess(
        `Registration successful! Transaction: ${contractResult.txHash?.substring(0, 10)}...`,
      );

      // Show HashScan link
      const hashscanLink = `https://hashscan.io/testnet/transaction/${contractResult.txHash}`;
      console.log('🔗 View on HashScan:', hashscanLink);

      setTimeout(() => {
        router.push('/vendors');
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setLoadingMessage('');
      setError(errorMessage);
    } finally {
      if (!success) {
        setIsLoading(false);
      }
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
        connected: walletConnectCtx.isConnected,
      };
    }
    return {
      type: 'None',
      address: '',
      connected: false,
    };
  };

  const getStepContent = (): React.JSX.Element | null => {
    const walletStatus = getWalletStatus();

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-space-grotesk mb-2 text-lg font-semibold text-black">
                Become a Vendor
              </h3>
              <p className="font-inter text-sm text-gray-600">
                Sell sustainable products made from recycled materials on our marketplace
              </p>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-space-grotesk font-semibold text-black">Vendor Account</h4>
                  <p className="font-inter text-sm text-gray-600">
                    List and sell eco-friendly products to our sustainable community
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="h-4 w-4 text-purple-500" />
                <span>List products on blockchain</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="h-4 w-4 text-purple-500" />
                <span>Receive payments in HBAR</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="h-4 w-4 text-purple-500" />
                <span>Track sales and analytics</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-space-grotesk mb-2 text-lg font-semibold text-black">
                Connect Wallet
              </h3>
              <p className="font-inter text-sm text-gray-600">
                Connect your Hedera wallet to continue with vendor registration
              </p>
            </div>

            {!walletStatus.connected ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Wallet className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-inter text-gray-600">No wallet connected</p>
                <div className="font-inter mb-4 text-sm text-gray-500">
                  Please use the wallet connection in the header to connect your wallet, then return
                  to continue registration.
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="font-space-grotesk w-full rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  Refresh Page
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <Check className="h-8 w-8 text-purple-500" />
                </div>
                <p className="font-inter text-purple-600">Wallet Connected Successfully</p>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-700">
                    Connected via {walletStatus.type}
                  </p>
                  <p className="font-mono text-xs text-gray-500">{walletStatus.address}</p>
                </div>
                <p className="font-inter text-sm text-gray-500">
                  Ready to proceed with registration
                </p>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-space-grotesk mb-2 text-lg font-semibold text-black">
                Vendor Information
              </h3>
              <p className="font-inter text-sm text-gray-600">
                Please provide your business details
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={vendorForm.name}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={vendorForm.businessName}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  name="country"
                  value={vendorForm.country}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Nigeria"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={vendorForm.phoneNumber}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your phone number"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Used for order notifications and customer support
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout showHeader={true} showFooter={false} showSidebar={false}>
      <div className="body-gradient flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500">
              <Store className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-space-grotesk text-2xl font-bold text-white">
              Vendor Registration
            </h1>
            <p className="font-inter text-gray-300">Start selling sustainable products today</p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl bg-white p-6">
            {/* Progress Header */}
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-space-grotesk text-xl font-bold text-black">Become a Vendor</h2>
                <span className="font-inter text-sm text-gray-500">Step {currentStep} of 3</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Success Display */}
            {success && contractResult?.txHash && (
              <div className="mt-4">
                <a
                  href={`https://hashscan.io/testnet/transaction/${contractResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-blue-500 hover:text-blue-600 hover:underline"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  View Transaction on HashScan
                </a>
              </div>
            )}
            {/* Step Content */}
            {getStepContent()}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {currentStep < 3 ? (
                <button
                  onClick={handleContinue}
                  disabled={currentStep === 2 && !isConnected}
                  className="font-space-grotesk flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !isConnected}
                  className="font-space-grotesk flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {loadingMessage || 'Registering...'}
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              )}

              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isLoading}
                  className="font-space-grotesk w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  ← Back
                </button>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex items-center justify-center gap-8 text-center">
            <div className="text-white">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="font-inter text-xs">Blockchain Verified</p>
            </div>
            <div className="text-white">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="font-inter text-xs">HBAR Payments</p>
            </div>
            <div className="text-white">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="font-inter text-xs">Global Marketplace</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
