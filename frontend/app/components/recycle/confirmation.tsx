'use client';

import { useState, useContext, useEffect } from 'react';
import { Check, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import type { RecycleFormData } from '../../recycle/page';
import { MetamaskContext } from '../../contexts/MetamaskContext';
import { WalletConnectContext } from '../../contexts/WalletConnectContext';
import { useWalletInterface } from '../../services/wallets/useWalletInterface';
import { recycleItem, RecycleItemData } from '../../services/recycleService';
import { WalletInterface } from '../../services/wallets/walletInterface';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface ConfirmationProps {
  formData: RecycleFormData;
  onReset: () => void;
}

const createWalletData = (
  accountId: string,
  walletInterface: WalletInterface | null,
  network: string = 'testnet',
): [string, WalletInterface | null, string] => {
  return [accountId, walletInterface, network];
};

export default function Confirmation({ formData, onReset }: ConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'pending' | 'blockchain' | 'pickup' | 'success' | 'error'
  >('pending');
  const [error, setError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [itemId, setItemId] = useState<number>(0);
  const [trackingId, setTrackingId] = useState<string>('');
  const [riderName, setRiderName] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Get wallet contexts
  const metamaskCtx = useContext(MetamaskContext);
  const walletConnectCtx = useContext(WalletConnectContext);
  const { accountId, walletInterface } = useWalletInterface();

  const isConnected = !!(accountId && walletInterface);
  console.log(isSubmitting);

  const calculateEarnings = () => {
    if (!formData.category || !formData.weight) return 0;
    return Number.parseFloat(formData.weight) * formData.category.rate;
  };

  const estimatedEarnings = calculateEarnings();

  // Auto-submit on component mount
  useEffect(() => {
    if (isConnected && submitStatus === 'pending') {
      handleFullSubmission();
    } else if (!isConnected && submitStatus === 'pending') {
      setError('Wallet not connected');
      setSubmitStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, submitStatus]);

  /**
   * Full submission flow:
   * 1. Submit to blockchain (recycleItem)
   * 2. Create pickup in database with rider assignment
   */
  const handleFullSubmission = async () => {
    if (!isConnected || !formData.category || !formData.weight) {
      setError('Missing required data for submission');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // ==================== STEP 1: BLOCKCHAIN SUBMISSION ====================
      setSubmitStatus('blockchain');
      setLoadingMessage('Submitting to blockchain...');

      const recycleData: RecycleItemData = {
        type: formData.category.id,
        weight: parseFloat(formData.weight),
        description: formData.description || `${formData.category.name} - ${formData.weight}kg`,
      };

      const walletData = createWalletData(accountId!, walletInterface!);
      const blockchainResult = await recycleItem(walletData, recycleData);

      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error || 'Blockchain submission failed');
      }

      // Store blockchain data
      setTxHash(blockchainResult.txHash || '');
      setItemId(blockchainResult.itemId || 1);

      console.log('✅ Blockchain submission successful:', blockchainResult.txHash);

      // ==================== STEP 2: CREATE PICKUP REQUEST ====================
      setSubmitStatus('pickup');
      setLoadingMessage('Creating pickup request...');

      // Get user data from wallet context
      // const userId = metamaskCtx.userBlockchainId || walletConnectCtx.userBlockchainId || 1;
      // const userName = metamaskCtx.userName || walletConnectCtx.userName || 'User';
      // const userPhone = metamaskCtx.userPhone || '+234000000000';

      console.log('🔍 DEBUG: FormData in confirmation:', formData);
      console.log('🔍 DEBUG: Selected Rider ID from formData:', formData.selectedRiderId);

      const userId = 1; // TODO: Get from user context after login
      const userName = 'Test User';
      const userPhone = '+2341234567890';

      // Get selected rider ID from formData (it's stored during rider selection)
      const selectedRiderId = formData.selectedRiderId;

      // Validate riderId exists and is a number
      if (!selectedRiderId || typeof selectedRiderId !== 'number') {
        console.error('❌ Invalid rider ID:', selectedRiderId);
        console.error('❌ Full formData:', formData);
        throw new Error('No rider selected. Please go back and select a rider.');
      }

      const pickupPayload = {
        userId: userId,
        itemId: blockchainResult.itemId || 1,
        customerName: userName,
        customerPhoneNumber: userPhone,
        pickupAddress: formData.address,
        pickupCoordinates: formData.pickupCoordinates, // ✅ Add this
        itemCategory: formData.category.id,
        itemWeight: parseFloat(formData.weight),
        itemDescription: formData.description || '',
        itemImages: formData.photos || [],
        estimatedEarnings: estimatedEarnings,
        riderId: selectedRiderId,
      };

      console.log('🔍 DEBUG: Final pickup payload:', pickupPayload);
      console.log('🔍 DEBUG: riderId type:', typeof pickupPayload.riderId);
      console.log('🔍 DEBUG: riderId value:', pickupPayload.riderId);

      const pickupResponse = await fetch(`${baseUrl}/pickups/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pickupPayload),
      });

      console.log('🔍 DEBUG: Pickup response status:', pickupResponse.status);

      const pickupData = await pickupResponse.json();
      console.log('🔍 DEBUG: Pickup response data:', pickupData);

      if (!pickupResponse.ok) {
        throw new Error(pickupData.message || 'Failed to create pickup request');
      }

      // Store pickup data
      setTrackingId(pickupData.data.pickupId);
      setRiderName(pickupData.data.riderName);

      console.log('✅ Pickup created successfully:', pickupData.data.pickupId);

      // ==================== SUCCESS ====================
      setSubmitStatus('success');
      setLoadingMessage('');
    } catch (err) {
      console.error('Submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setLoadingMessage('');
      setError(errorMessage);
      setSubmitStatus('error');
    } finally {
      if (submitStatus !== 'success') {
        setIsSubmitting(false);
      }
    }
  };

  const getWalletStatus = () => {
    if (metamaskCtx.metamaskAccountAddress) {
      return { type: 'MetaMask', address: metamaskCtx.metamaskAccountAddress };
    } else if (walletConnectCtx.accountId) {
      return { type: 'WalletConnect', address: walletConnectCtx.accountId };
    }
    return { type: 'None', address: '' };
  };

  const walletStatus = getWalletStatus();

  // ==================== LOADING STATES ====================
  if (submitStatus === 'pending' || submitStatus === 'blockchain' || submitStatus === 'pickup') {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 text-center backdrop-blur-sm">
          <div className="mb-8">
            <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-green-400" />
            <h2 className="font-space-grotesk mb-4 text-2xl font-bold text-white">
              {submitStatus === 'blockchain' && 'Submitting to Blockchain...'}
              {submitStatus === 'pickup' && 'Creating Pickup Request...'}
              {submitStatus === 'pending' && 'Preparing submission...'}
            </h2>
            <p className="font-inter text-gray-300">{loadingMessage}</p>
            <p className="font-inter mt-2 text-sm text-gray-400">Please don't close this window.</p>
          </div>

          {/* Submission Progress */}
          <div className="mx-auto max-w-md rounded-xl bg-black/60 p-6">
            <h3 className="font-space-grotesk mb-4 font-semibold text-white">Progress</h3>
            <div className="font-inter space-y-3 text-left text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">Form data validated</span>
              </div>
              <div className="flex items-center gap-2">
                {submitStatus === 'blockchain' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                ) : txHash ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-400" />
                )}
                <span className="text-gray-300">Blockchain submission</span>
              </div>
              <div className="flex items-center gap-2">
                {submitStatus === 'pickup' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                ) : trackingId ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-400" />
                )}
                <span className="text-gray-300">Rider assignment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (submitStatus === 'error') {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 text-center backdrop-blur-sm">
          <div className="mb-8">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
            <h2 className="font-space-grotesk mb-4 text-2xl font-bold text-red-400">
              Submission Failed
            </h2>
            <p className="font-inter mb-4 text-gray-300">
              There was an error processing your recycling request.
            </p>

            {/* Error Details */}
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <p className="font-inter text-sm text-red-400">{error}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={() => {
                setSubmitStatus('pending');
                setError('');
                handleFullSubmission();
              }}
              className="font-inter rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
            >
              Try Again
            </button>
            <button
              onClick={onReset}
              className="font-inter rounded-lg bg-gray-500 px-6 py-3 text-white transition-colors hover:bg-gray-600"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== SUCCESS STATE ====================
  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 text-center backdrop-blur-sm">
        <div className="mb-8">
          <Check className="mx-auto mb-4 h-16 w-16 text-green-400" />
          <h2 className="font-space-grotesk mb-4 text-3xl font-bold text-green-400">
            Pickup Request Submitted Successfully! 🎉
          </h2>
          <p className="font-inter text-gray-300">
            Your recycling item has been recorded on the blockchain.
          </p>
          <p className="font-inter text-gray-300">{riderName} will contact you soon for pickup.</p>
        </div>

        {/* Blockchain Confirmation */}
        {txHash && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <h3 className="font-space-grotesk mb-2 font-semibold text-green-400">
              Blockchain Confirmation
            </h3>
            <div className="font-inter flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-gray-300">Transaction:</span>
              <code className="max-w-xs truncate font-mono text-xs text-green-400">{txHash}</code>
              <a
                href={`https://hashscan.io/testnet/transaction/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}

        {/* Request Summary */}
        <div className="mx-auto mb-8 max-w-md rounded-xl bg-white/95 p-6 text-left">
          <h3 className="font-space-grotesk mb-4 text-center text-lg font-semibold text-gray-800">
            Request Summary
          </h3>
          <div className="font-inter space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tracking ID:</span>
              <span className="font-mono font-bold text-green-600">{trackingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium text-gray-800">{formData.category?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Weight:</span>
              <span className="font-medium text-gray-800">{formData.weight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Earning:</span>
              <span className="font-semibold text-green-600">₦{estimatedEarnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Assigned Rider:</span>
              <span className="font-medium text-gray-800">{riderName}</span>
            </div>
            {itemId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Blockchain Item ID:</span>
                <span className="font-medium text-gray-800">#{itemId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Submitted via:</span>
              <span className="font-medium text-gray-800">{walletStatus.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-orange-600">Pending Pickup</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={() => (window.location.href = `/tracking?id=${trackingId}`)}
            className="font-inter flex items-center justify-center rounded-lg bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            Track Pickup Status
          </button>
          <button
            onClick={onReset}
            className="font-inter flex items-center justify-center rounded-lg bg-gradient-to-r from-yellow-400 to-green-500 px-6 py-3 font-semibold text-black transition-all hover:from-yellow-500 hover:to-green-600"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Submit Another Item
          </button>
        </div>
      </div>
    </div>
  );
}
