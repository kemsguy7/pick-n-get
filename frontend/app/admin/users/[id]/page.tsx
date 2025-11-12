'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  User,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { useWalletInterface } from '../../../services/wallets/useWalletInterface';
import { WalletInterface } from '../../../services/wallets/walletInterface';
import { approveRider, banRider } from '../../../services/adminService';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';

interface UserData {
  riderId: number;
  name: string;
  phoneNumber: string;
  vehicleNumber: string;
  homeAddress: string;
  walletAddress?: string;
  riderStatus: string;
  vehicleType: string;
  approvalStatus: string;
  country: string;
  capacity: number;
  vehicleMakeModel?: string;
  vehiclePlateNumber?: string;
  vehicleColor?: string;
  documents?: {
    profileImage?: string;
    driversLicense?: string;
    vehicleRegistration?: string;
    insuranceCertificate?: string;
    vehiclePhotos?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Helper function to create wallet data
const createWalletData = (
  accountId: string,
  walletInterface: WalletInterface | null,
  network: string = 'testnet',
): [string, WalletInterface | null, string] => {
  return [accountId, walletInterface, network];
};

export default function ManageUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { accountId, walletInterface } = useWalletInterface();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentAction, setCurrentAction] = useState<
    'default' | 'approve' | 'pay' | 'ban' | 'delete' | 'success'
  >('default');
  const [actionType, setActionType] = useState<'approve' | 'pay' | 'ban' | 'delete'>('approve');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [banReason, setBanReason] = useState('');

  const isConnected = !!(accountId && walletInterface);

  // ✅ FETCH REAL USER DATA
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log(`👤 Fetching user data for ID: ${userId}`);

      const response = await fetch(`${BACKEND_URL}/riders/${userId}`);
      const data = await response.json();

      if (data.status === 'success') {
        setUserData(data.data);
        console.log('✅ User data loaded:', data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);

  const handleAction = (action: 'approve' | 'pay' | 'ban' | 'delete') => {
    setActionType(action);
    setCurrentAction(action);
    setPaymentAmount('');
    setBanReason('');
    setError('');
    setSuccessMessage('');
  };

  const handleCancelAction = () => {
    setCurrentAction('default');
    setPaymentAmount('');
    setBanReason('');
    setError('');
    setSuccessMessage('');
  };

  const handleBackToUsers = () => {
    router.push('/admin?tab=users');
  };

  // ✅ REAL BLOCKCHAIN APPROVE FUNCTION
  const handleConfirmApprove = async () => {
    if (!isConnected || !userData) {
      setError('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    try {
      console.log(`🎯 Approving rider ID: ${userData.riderId}`);

      const walletData = createWalletData(accountId!, walletInterface!);
      const result = await approveRider(walletData, userData.riderId);

      if (result.success) {
        // Sync with backend
        const backendResponse = await fetch(
          `${BACKEND_URL}/admin/riders/${userData.riderId}/approval`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'approve',
              adminWallet: accountId,
            }),
          },
        );

        const backendResult = await backendResponse.json();

        if (backendResult.status === 'success') {
          setSuccessMessage(
            `✅ Successfully approved ${userData.name}! Blockchain Tx: ${result.txHash?.substring(0, 10)}...`,
          );
          setCurrentAction('success');

          // Refresh user data
          setTimeout(() => fetchUserData(), 2000);
        } else {
          console.warn('⚠️ Blockchain approved but backend sync failed');
          setSuccessMessage(`⚠️ Blockchain approved but backend sync failed`);
          setCurrentAction('success');
        }
      } else {
        throw new Error(result.error || 'Approval failed');
      }
    } catch (error) {
      console.error('❌ Approval error:', error);
      setError(error instanceof Error ? error.message : 'Failed to approve user');
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ REAL BLOCKCHAIN BAN FUNCTION
  const handleConfirmBan = async () => {
    if (!isConnected || !userData) {
      setError('Please connect your wallet first');
      return;
    }

    if (!banReason.trim()) {
      setError('Please provide a reason for banning this user');
      return;
    }

    setIsProcessing(true);
    try {
      console.log(`🎯 Banning rider ID: ${userData.riderId}`);

      const walletData = createWalletData(accountId!, walletInterface!);
      const result = await banRider(walletData, userData.riderId);

      if (result.success) {
        // Sync with backend
        const backendResponse = await fetch(
          `${BACKEND_URL}/admin/riders/${userData.riderId}/approval`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'reject',
              reason: banReason,
              adminWallet: accountId,
            }),
          },
        );

        const backendResult = await backendResponse.json();

        if (backendResult.status === 'success') {
          setSuccessMessage(
            `✅ Successfully banned ${userData.name}! Blockchain Tx: ${result.txHash?.substring(0, 10)}...`,
          );
          setCurrentAction('success');

          // Refresh user data
          setTimeout(() => fetchUserData(), 2000);
        } else {
          console.warn('⚠️ Blockchain banned but backend sync failed');
          setSuccessMessage(`⚠️ Blockchain banned but backend sync failed`);
          setCurrentAction('success');
        }
      } else {
        throw new Error(result.error || 'Ban failed');
      }
    } catch (error) {
      console.error('❌ Ban error:', error);
      setError(error instanceof Error ? error.message : 'Failed to ban user');
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ PAYMENT FUNCTION (placeholder - you can implement actual payment logic)
  const handleConfirmPayment = async () => {
    if (!paymentAmount.trim()) {
      setError('Please enter a payment amount');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccessMessage(`✅ Payment of ${paymentAmount} HBAR sent to ${userData?.name}!`);
      setCurrentAction('success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ DELETE FUNCTION (backend only)
  const handleConfirmDelete = async () => {
    if (!userData) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/admin/riders/${userData.riderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminWallet: accountId }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSuccessMessage(`✅ User ${userData.name} has been permanently deleted!`);
        setCurrentAction('success');
      } else {
        throw new Error(result.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
      case 'Approved':
        return 'bg-[#DCFCE7] text-green-600 border border-green-200';
      case 'Pending':
        return 'bg-orange-100 text-orange-600 border border-orange-200';
      case 'Off-line':
        return 'bg-gray-100 text-gray-600 border border-gray-200';
      case 'On-Trip':
        return 'bg-blue-100 text-blue-600 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  const renderActionContent = () => {
    switch (currentAction) {
      case 'approve':
        return (
          <div className="rounded-xl border border-slate-700/50 bg-black p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <h3 className="font-space-grotesk font-semibold text-white">Approve User</h3>
              </div>
              <button
                onClick={handleCancelAction}
                className="rounded-full p-1 transition-colors hover:bg-slate-700"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <p className="font-inter mb-6 text-gray-400">
              This will approve {userData?.name} on the blockchain and update their status to
              approved.
            </p>
            {!isConnected && (
              <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-orange-700">
                <AlertTriangle className="mr-2 inline h-4 w-4" />
                Please connect your wallet to approve users on the blockchain.
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleConfirmApprove}
                disabled={isProcessing || !isConnected}
                className="gradient-button font-inter flex items-center gap-2 rounded-lg px-6 py-2 font-semibold text-black transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Approval'
                )}
              </button>
              <button
                onClick={handleCancelAction}
                className="font-inter rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      case 'pay':
        return (
          <div className="rounded-xl border border-slate-700/50 bg-black p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-space-grotesk font-semibold text-white">Pay User</h3>
              <button
                onClick={handleCancelAction}
                className="rounded-full p-1 transition-colors hover:bg-slate-700"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-inter mb-2 block text-sm text-gray-400">
                  Amount (HBAR):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter Amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-[#1a2928] px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="font-inter flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Payment'
                  )}
                </button>
                <button
                  onClick={handleCancelAction}
                  className="font-inter rounded-lg bg-gray-600 px-6 py-3 text-white transition-colors hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );

      case 'ban':
        return (
          <div className="rounded-xl border border-slate-700/50 bg-black p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-space-grotesk font-semibold text-white">Ban User</h3>
              <button
                onClick={handleCancelAction}
                className="rounded-full p-1 transition-colors hover:bg-slate-700"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-inter mb-2 block text-sm text-gray-400">
                  Reason for Ban:
                </label>
                <textarea
                  placeholder="Enter reason for banning this user..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-600 bg-[#1a2928] px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
              </div>
              {!isConnected && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-orange-700">
                  <AlertTriangle className="mr-2 inline h-4 w-4" />
                  Please connect your wallet to ban users on the blockchain.
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmBan}
                  disabled={isProcessing || !isConnected}
                  className="font-inter flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Ban'
                  )}
                </button>
                <button
                  onClick={handleCancelAction}
                  className="font-inter rounded-lg bg-gray-600 px-6 py-3 text-white transition-colors hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );

      case 'delete':
        return (
          <div className="rounded-xl border border-slate-700/50 bg-black p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="font-space-grotesk font-semibold text-red-400">Delete User</h3>
              </div>
              <button
                onClick={handleCancelAction}
                className="rounded-full p-1 transition-colors hover:bg-slate-700"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <p className="font-inter mb-6 text-gray-400">
              This action cannot be undone. This will permanently delete {userData?.name} from the
              system. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={isProcessing}
                className="font-inter flex items-center justify-center gap-2 rounded-lg bg-red-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
              <button
                onClick={handleCancelAction}
                className="font-inter rounded-lg bg-gray-600 px-6 py-3 text-white transition-colors hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      case 'success': {
        const successMessages = {
          approve: 'User has been approved!',
          pay: 'Payment Sent Successfully!',
          ban: 'User has been banned!',
          delete: 'User deleted permanently!',
        };

        return (
          <div className="rounded-xl border border-slate-700/50 bg-black p-6">
            <div className="rounded-lg border border-green-600/30 bg-green-600/20 p-6 text-center">
              <CheckCircle className="mx-auto mb-3 h-8 w-8 text-green-400" />
              <p className="font-space-grotesk text-lg font-semibold text-green-400">
                {successMessages[actionType]}
              </p>
              {successMessage && <p className="mt-2 text-sm text-green-300">{successMessage}</p>}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleBackToUsers}
                className="font-inter flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Users
              </button>
              <button
                onClick={() => setCurrentAction('default')}
                className="font-inter rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              >
                Perform Another Action
              </button>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
            <p className="text-white">Loading user data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !userData) {
    return (
      <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
        <div className="min-h-screen p-4 lg:p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-primary font-space-grotesk text-2xl font-bold lg:text-3xl">
                Manage User
              </h1>
              <button
                onClick={handleBackToUsers}
                className="font-inter flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Users
              </button>
            </div>

            <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-12 text-center">
              <h3 className="mb-2 text-xl font-semibold text-red-400">User Not Found</h3>
              <p className="text-gray-400">{error || 'The requested user could not be found.'}</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
      <div className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-primary font-space-grotesk text-2xl font-bold lg:text-3xl">
              Manage User
            </h1>
            <button
              onClick={handleBackToUsers}
              className="font-inter flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-700">{error}</span>
              <button onClick={() => setError('')} className="ml-auto rounded p-1 hover:bg-red-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* User Info Card */}
          <div className="rounded-xl border border-slate-700/50 bg-black p-8">
            <div className="mb-8 flex items-start gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-blue-400">
                <span className="text-2xl font-bold text-white">
                  {userData.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="text-primary font-space-grotesk text-2xl font-bold">
                    {userData.name}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(userData.approvalStatus)}`}
                  >
                    {userData.approvalStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="h-4 w-4" />
                    <span className="text-sm">ID: #{userData.riderId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{userData.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{userData.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Joined: {new Date(userData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Vehicle Type:</span>
                  <span className="font-inter text-white">{userData.vehicleType}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Vehicle Number:</span>
                  <span className="font-inter text-white">{userData.vehicleNumber}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Capacity:</span>
                  <span className="font-inter text-white">{userData.capacity}kg</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Status:</span>
                  <span className="font-inter text-white">{userData.riderStatus}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Home Address:</span>
                  <span className="font-inter text-right text-white">{userData.homeAddress}</span>
                </div>
                {userData.walletAddress && (
                  <div className="flex justify-between py-2">
                    <span className="font-inter text-gray-400">Wallet:</span>
                    <span className="font-inter font-mono text-white">
                      {userData.walletAddress.substring(0, 10)}...
                      {userData.walletAddress.substring(userData.walletAddress.length - 8)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Last Updated:</span>
                  <span className="font-inter text-white">
                    {new Date(userData.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {currentAction === 'default' && (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <button
                  onClick={() => handleAction('pay')}
                  className="font-inter rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  Pay User
                </button>
                <button
                  onClick={() => handleAction('ban')}
                  className="font-inter rounded-lg bg-red-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Ban User
                </button>
                <button
                  onClick={() => handleAction('approve')}
                  className="gradient-button font-inter rounded-lg px-4 py-3 font-semibold text-black transition-all duration-200 hover:shadow-lg"
                >
                  Approve User
                </button>
                <button
                  onClick={() => handleAction('delete')}
                  className="font-inter rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Delete User
                </button>
              </div>
            )}
          </div>

          {/* Action Content */}
          {renderActionContent()}
        </div>
      </div>
    </AppLayout>
  );
}
