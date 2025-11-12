'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import type { RecycleFormData } from '../../recycle/page';
import { useAuth } from '../../contexts/AuthContext';
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

  // ✅ Get authenticated user data
  const { user, isAuthenticated } = useAuth();
  const { accountId, walletInterface } = useWalletInterface();

  const isConnected = !!(accountId && walletInterface && isAuthenticated);

  const calculateEarnings = () => {
    if (!formData.category || !formData.weight) return 0;
    return Number.parseFloat(formData.weight) * formData.category.rate;
  };
  console.log(isSubmitting);

  const estimatedEarnings = calculateEarnings();

  // Auto-submit on component mount
  useEffect(() => {
    if (isConnected && user && submitStatus === 'pending') {
      console.log('🔍 DEBUG: Starting auto-submit with user:', user.userData?.name);
      console.log('🔍 DEBUG: FormData at confirmation:', formData);
      console.log('🔍 DEBUG: Selected Rider ID:', formData.selectedRiderId);

      handleFullSubmission();
    } else if (!isConnected && submitStatus === 'pending') {
      setError('Wallet not connected or user not authenticated');
      setSubmitStatus('error');
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, user, submitStatus]);

  /**
   * Full submission flow with real user data
   */
  const handleFullSubmission = async () => {
    if (!isConnected || !user || !formData.category || !formData.weight) {
      setError('Missing required data for submission');
      setSubmitStatus('error');
      return;
    }

    // ✅ Validate user data exists
    if (!user.userData?.userId) {
      setError('User data not found. Please reconnect your wallet.');
      setSubmitStatus('error');
      return;
    }

    // ✅ Early validation of rider selection
    if (!formData.selectedRiderId || !formData.selectedDriver) {
      console.error('❌ Missing rider selection data:', {
        selectedRiderId: formData.selectedRiderId,
        selectedDriver: formData.selectedDriver,
      });
      setError('No rider selected. Please go back and select a rider for pickup.');
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

      // ✅ Use real user data from AuthContext
      const userId = user.userData.userId;
      const userName = user.userData.name || 'User';

      // TODO: Add phoneNumber to user data or fetch from backend
      // For now, we'll need to get this from user profile
      const userPhone = '+2341234567890'; // Placeholder - should come from user profile

      const selectedRiderId = formData.selectedRiderId;

      if (!selectedRiderId || typeof selectedRiderId !== 'number') {
        console.error('❌ Invalid rider ID at pickup creation:', selectedRiderId);
        throw new Error('Invalid rider selection. Please go back and select a rider.');
      }

      const pickupPayload = {
        userId: userId,
        itemId: blockchainResult.itemId || 1,
        customerName: userName,
        customerPhoneNumber: userPhone,
        pickupAddress: formData.address,
        pickupCoordinates: formData.pickupCoordinates,
        itemCategory: formData.category.id,
        itemWeight: parseFloat(formData.weight),
        itemDescription: formData.description || '',
        itemImages: formData.photos || [],
        estimatedEarnings: estimatedEarnings,
        riderId: selectedRiderId,
      };

      console.log('🔍 DEBUG: Final pickup payload with real user:', pickupPayload);

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
        let errorMessage = pickupData.message || 'Failed to create pickup request';

        if (pickupData.received) {
          console.error('❌ Server received payload:', pickupData.received);
          errorMessage += '\n\nPlease check that you selected a rider properly.';
        }

        throw new Error(errorMessage);
      }

      // Store pickup data
      setTrackingId(pickupData.data.trackingId || pickupData.data.pickupId);
      setRiderName(pickupData.data.riderName || formData.selectedDriver || 'Assigned Rider');

      console.log('✅ Pickup created successfully:', trackingId);

      // ==================== SUCCESS ====================
      setSubmitStatus('success');
      setLoadingMessage('');
    } catch (err) {
      console.error('❌ Submission error:', err);
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

            {/* ✅ User info during loading */}
            {user?.userData && (
              <div className="mt-4 rounded bg-slate-700 p-2 text-xs text-gray-400">
                <div>User: {user.userData.name}</div>
                <div>User ID: {user.userData.userId}</div>
                <div>Role: {user.primaryRole}</div>
              </div>
            )}
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
              <p className="font-inter text-sm whitespace-pre-line text-red-400">{error}</p>
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
              <span className="text-gray-600">User:</span>
              <span className="font-medium text-gray-800">{user?.userData?.name || 'User'}</span>
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
              <span className="text-gray-600">Wallet:</span>
              <span className="font-medium text-gray-800">
                {user?.walletAddress?.slice(0, 10)}...
              </span>
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
            className="font-inter bg-linear-gradient-to-r flex items-center justify-center rounded-lg from-yellow-400 to-green-500 px-6 py-3 font-semibold text-black transition-all hover:from-yellow-500 hover:to-green-600"
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
