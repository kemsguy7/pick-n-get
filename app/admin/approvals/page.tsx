'use client';
import { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  BarChart3,
  Settings,
  AlertCircle,
  Loader2,
  X,
  ChevronRight,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import StatCard, { StatCardProps } from '../../components/ui/statCard';
import { WalletInterface } from '../../services/wallets/walletInterface';
import { useWalletInterface } from '../../services/wallets/useWalletInterface';
import { approveRider, banRider } from '../../services/adminService';

// ✅ NEW: Real pending rider interface
interface PendingRider {
  riderId: number;
  name: string;
  phoneNumber: string;
  vehicleNumber: string;
  vehicleType: string;
  country: string;
  capacity: number;
  homeAddress: string;
  walletAddress?: string;
  approvalStatus: string;
  riderStatus: string;
  submissionDate: string;
  vehicleMakeModel?: string;
  vehiclePlateNumber?: string;
  vehicleColor?: string;
  documents: {
    profileImage?: string;
    driversLicense?: string;
    vehicleRegistration?: string;
    insuranceCertificate?: string;
    vehiclePhotos?: string;
  };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';

// Convert wallet interface data to format expected by adminService
const createWalletData = (
  accountId: string,
  walletInterface: WalletInterface | null,
  network: string = 'testnet',
): [string, WalletInterface | null, string] => {
  return [accountId, walletInterface, network];
};

export default function AdminApprovalsPage() {
  const [activeTab, setActiveTab] = useState('approvals');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'ban' | null>(null);

  // ✅ NEW: State for real pending riders
  const [pendingRiders, setPendingRiders] = useState<PendingRider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0,
    avgApprovalTime: '2.5 hrs',
  });

  const { accountId, walletInterface } = useWalletInterface();

  // Determine connection status
  const isConnected = !!(accountId && walletInterface);

  // ✅ NEW: Fetch pending riders from backend
  const fetchPendingRiders = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching pending riders from backend...');

      const response = await fetch(`${BACKEND_URL}/admin/riders/pending`);
      const data = await response.json();

      if (data.status === 'success') {
        setPendingRiders(data.data.riders);
        setStats((prev) => ({ ...prev, pending: data.data.count }));
        console.log(`✅ Loaded ${data.data.count} pending riders`);
      } else {
        throw new Error(data.message || 'Failed to fetch pending riders');
      }
    } catch (error) {
      console.error('❌ Error fetching pending riders:', error);
      setErrorMessage('Failed to load pending riders');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Load pending riders on component mount
  useEffect(() => {
    fetchPendingRiders();
  }, []);

  // Stats data for approvals page
  const statsData: StatCardProps[] = [
    {
      icon: Users,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-100',
      title: 'Pending Approvals',
      titleColor: 'text-orange-600',
      value: stats.pending.toString(),
      valueColor: 'text-orange-600',
      subtitle: `${pendingRiders.filter((r) => r.vehicleType === 'Car').length} cars, ${pendingRiders.filter((r) => r.vehicleType === 'Bike').length} bikes`,
      subtitleColor: 'text-orange-500',
      backgroundColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      icon: CheckCircle,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      title: 'Approved Today',
      titleColor: 'text-blue-600',
      value: stats.approvedToday.toString(),
      valueColor: 'text-blue-600',
      subtitle: 'Blockchain synced',
      subtitleColor: 'text-blue-500',
      backgroundColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      icon: X,
      iconColor: 'text-red-600',
      iconBgColor: 'bg-red-100',
      title: 'Rejected Today',
      titleColor: 'text-red-600',
      value: stats.rejectedToday.toString(),
      valueColor: 'text-red-600',
      subtitle: 'Reasons documented',
      subtitleColor: 'text-red-500',
      backgroundColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      icon: Users,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
      title: 'Avg. Approval Time',
      titleColor: 'text-green-600',
      value: stats.avgApprovalTime,
      valueColor: 'text-green-600',
      subtitle: 'Down 30% this week',
      subtitleColor: 'text-green-500',
      backgroundColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-100 text-orange-600 border border-orange-200';
      case 'Approved':
        return 'bg-green-100 text-green-600 border border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-600 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  // ✅ UPDATED: Handle approve with backend sync
  const handleApprove = async (rider: PendingRider) => {
    if (!isConnected) {
      setErrorMessage('Please connect your wallet first');
      return;
    }

    console.log(`🎯 Starting approval process for rider ID: ${rider.riderId}`);

    setIsProcessing(true);
    setProcessingId(rider.riderId);
    setActionType('approve');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Step 1: Approve on blockchain
      const walletData = createWalletData(accountId!, walletInterface!);
      const blockchainResult = await approveRider(walletData, rider.riderId);

      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error || 'Blockchain approval failed');
      }

      console.log('✅ Blockchain approval successful');

      // Step 2: Sync with backend
      console.log('🔄 Syncing approval with backend...');
      const backendResponse = await fetch(`${BACKEND_URL}/admin/riders/${rider.riderId}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approve',
          adminWallet: accountId,
        }),
      });

      const backendResult = await backendResponse.json();

      if (backendResult.status === 'success') {
        setSuccessMessage(
          `✅ Successfully approved ${rider.name}! Blockchain Tx: ${blockchainResult.txHash?.substring(0, 10)}...`,
        );
        console.log(`🎉 Full approval completed for ${rider.name}`);

        // Refresh the pending riders list
        await fetchPendingRiders();
      } else {
        console.warn('⚠️ Blockchain approved but backend sync failed:', backendResult.message);
        setSuccessMessage(
          `⚠️ Blockchain approved but backend sync failed: ${blockchainResult.message}`,
        );
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve rider';
      console.error('❌ Approval error:', error);
      setErrorMessage(errorMessage);
    } finally {
      setIsProcessing(false);
      setProcessingId(null);
      setActionType(null);
    }
  };

  // ✅ UPDATED: Handle reject with backend sync
  const handleReject = async (rider: PendingRider) => {
    if (!isConnected) {
      setErrorMessage('Please connect your wallet first');
      return;
    }

    console.log(`🎯 Starting rejection process for rider ID: ${rider.riderId}`);

    setIsProcessing(true);
    setProcessingId(rider.riderId);
    setActionType('ban');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Step 1: Ban on blockchain
      const walletData = createWalletData(accountId!, walletInterface!);
      const blockchainResult = await banRider(walletData, rider.riderId);

      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error || 'Blockchain rejection failed');
      }

      console.log('✅ Blockchain rejection successful');

      // Step 2: Sync with backend
      console.log('🔄 Syncing rejection with backend...');
      const backendResponse = await fetch(`${BACKEND_URL}/admin/riders/${rider.riderId}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'reject',
          adminWallet: accountId,
        }),
      });

      const backendResult = await backendResponse.json();

      if (backendResult.status === 'success') {
        setSuccessMessage(
          `✅ Successfully rejected ${rider.name}! Blockchain Tx: ${blockchainResult.txHash?.substring(0, 10)}...`,
        );
        console.log(`🎉 Full rejection completed for ${rider.name}`);

        // Refresh the pending riders list
        await fetchPendingRiders();
      } else {
        console.warn('⚠️ Blockchain rejected but backend sync failed:', backendResult.message);
        setSuccessMessage(
          `⚠️ Blockchain rejected but backend sync failed: ${backendResult.message}`,
        );
      }

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: unknown) {
      console.error('❌ Rejection error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to reject rider');
    } finally {
      setIsProcessing(false);
      setProcessingId(null);
      setActionType(null);
    }
  };

  return (
    <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
      <div className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6 lg:space-y-8">
          {/* Header Section */}
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-green-gradient font-space-grotesk mb-2 bg-transparent bg-clip-text text-3xl font-bold md:text-4xl lg:text-5xl">
                Pending Approvals
              </h1>
              <p className="secondary-text font-inter text-lg">
                Review and approve agent applications
              </p>
            </div>
            <div className="flex gap-3">
              {!isConnected ? (
                <div className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-100 px-6 py-2 text-sm font-medium text-orange-700">
                  <AlertCircle className="h-4 w-4" />
                  Connect wallet to manage approvals
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-100 px-6 py-2 text-sm font-medium text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Connected: {accountId?.substring(0, 8)}...
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {statsData.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-700">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-700">{errorMessage}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto rounded-lg bg-[#1a2928] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-primary bg-[#EDFFF3]'
                    : 'lighter-green-text hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Pending Approvals Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-space-grotesk text-xl font-semibold text-white">
                Review Applications ({isLoading ? '...' : pendingRiders.length})
              </h3>
              <button
                onClick={fetchPendingRiders}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Refresh
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                <span className="ml-2 text-gray-400">Loading pending riders...</span>
              </div>
            )}

            {/* No Pending Riders */}
            {!isLoading && pendingRiders.length === 0 && (
              <div className="rounded-xl border border-slate-700/50 bg-black/80 p-12 text-center">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-gray-500" />
                <h3 className="mb-2 text-lg font-semibold text-white">No Pending Approvals</h3>
                <p className="text-gray-400">All rider applications have been processed.</p>
              </div>
            )}

            {/* Approval Cards */}
            {!isLoading && pendingRiders.length > 0 && (
              <div className="space-y-4">
                {pendingRiders.map((rider) => (
                  <div
                    key={rider.riderId}
                    className="rounded-xl border border-slate-700/50 bg-black/80 p-6 transition-all hover:border-green-500/30"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-1 items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-700">
                          <span className="text-lg font-bold text-white">
                            {rider.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="font-space-grotesk text-lg font-semibold text-white">
                              {rider.name}
                            </h4>
                            <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                              {rider.vehicleType}
                            </span>
                          </div>
                          <p className="font-inter mb-1 text-sm text-gray-400">
                            {rider.phoneNumber}
                          </p>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-inter text-gray-500">{rider.country}</span>
                            <span className="text-gray-600">•</span>
                            <span className="font-inter text-gray-500">{rider.vehicleNumber}</span>
                            <span className="text-gray-600">•</span>
                            <span className="font-inter text-gray-500">
                              Capacity: {rider.capacity}kg
                            </span>
                            <span className="text-gray-600">•</span>
                            <span className="font-inter text-gray-500">
                              Rider ID: #{rider.riderId}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-lg px-3 py-1 text-xs font-medium ${getStatusBadge(rider.approvalStatus)}`}
                        >
                          {rider.approvalStatus}
                        </span>
                        <span className="font-inter text-sm whitespace-nowrap text-gray-400">
                          {new Date(rider.submissionDate).toLocaleDateString()}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`/admin/riders/${rider.riderId}`, '_blank')}
                            className="flex items-center gap-1 rounded-lg border border-slate-600 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                          >
                            Review
                            <ChevronRight className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleApprove(rider)}
                            disabled={isProcessing || !isConnected}
                            className="flex min-w-[100px] items-center justify-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                          >
                            {isProcessing &&
                            processingId === rider.riderId &&
                            actionType === 'approve' ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleReject(rider)}
                            disabled={isProcessing || !isConnected}
                            className="flex min-w-[100px] items-center justify-center gap-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                          >
                            {isProcessing &&
                            processingId === rider.riderId &&
                            actionType === 'ban' ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Rejecting...
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4" />
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
