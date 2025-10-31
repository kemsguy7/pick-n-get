'use client';
import { Suspense, useState, useEffect, useCallback } from 'react';
import {
  Users,
  CheckCircle,
  BarChart3,
  Settings,
  TrendingUp,
  AlertTriangle,
  Info,
  Clock,
  DollarSign,
  X,
  Loader2,
  ChevronRight,
  Search,
  ArrowLeft,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import StatCard, { StatCardProps } from '../components/ui/statCard';
import { useRouter, useSearchParams } from 'next/navigation';
import { WalletInterface } from '../services/wallets/walletInterface';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { approveRider, banRider } from '../services/adminService';
import DocumentReviewModal from '../components/modals/DocumentReviewModal';

import { getContractBalance, fundContract, updateMaterialPrice } from '../services/adminService';

// ✅ FIXED TYPES - Replace 'any' with proper interfaces
interface User {
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
  createdAt: string;
  updatedAt: string;
  submissionDate: string;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRiders: number;
  activeAgents: number;
  verifiedVendors: number;
  pendingApprovals: number;
  platformRevenue: string;
  totalEarnings: number;
  userGrowthRate: string;
  pickupGrowthRate: string;
  approvedToday: number;
  rejectedToday: number;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  priority: string;
}

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
  documents?: {
    profileImage?: string;
    driversLicense?: string;
    vehicleRegistration?: string;
    insuranceCertificate?: string;
    vehiclePhotos?: string;
  };
}

interface RecentActivity {
  type: string;
  message: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';

const createWalletData = (
  accountId: string,
  walletInterface: WalletInterface | null,
  network: string = 'testnet',
): [string, WalletInterface | null, string] => {
  return [accountId, walletInterface, network];
};

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMaterial, setSelectedMaterial] = useState('Paper & Cardboard');
  const [pricePerKg, setPricePerKg] = useState('$10/kg');
  const [fundingAmount, setFundingAmount] = useState('$1000');
  const [showExpandedUsers, setShowExpandedUsers] = useState(false);
  const [showExpandedApprovals, setShowExpandedApprovals] = useState(false);

  // ✅ DYNAMIC DATA STATE WITH PROPER TYPES
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRiders: 0,
    activeAgents: 0,
    verifiedVendors: 0,
    pendingApprovals: 0,
    platformRevenue: '$0',
    totalEarnings: 0,
    userGrowthRate: '+0.0%',
    pickupGrowthRate: '+0.0%',
    approvedToday: 0,
    rejectedToday: 0,
  });

  const [pendingRiders, setPendingRiders] = useState<PendingRider[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  // Document review modal state
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedRiderForReview, setSelectedRiderForReview] = useState<PendingRider | null>(null);

  // Approval state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'ban' | null>(null);

  const { accountId, walletInterface } = useWalletInterface();
  const isConnected = !!(accountId && walletInterface);

  // ✅ FIXED: Use useCallback for memoized functions
  const fetchDashboardStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      console.log('📊 Fetching dashboard stats...');

      const response = await fetch(`${BACKEND_URL}/admin/stats/dashboard`);
      const data = await response.json();

      if (data.status === 'success') {
        setDashboardStats(data.data);
        console.log('✅ Dashboard stats loaded');
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      setErrorMessage('Failed to load dashboard statistics');
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchPendingRiders = useCallback(async () => {
    try {
      setIsLoadingPending(true);
      console.log('🔍 Fetching pending riders...');

      const response = await fetch(`${BACKEND_URL}/admin/riders/pending`);
      const data = await response.json();

      if (data.status === 'success') {
        setPendingRiders(data.data.riders);
        console.log(`✅ Loaded ${data.data.count} pending riders`);
      } else {
        throw new Error(data.message || 'Failed to fetch pending riders');
      }
    } catch (error) {
      console.error('❌ Error fetching pending riders:', error);
      setErrorMessage('Failed to load pending riders');
    } finally {
      setIsLoadingPending(false);
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    try {
      setIsLoadingActivity(true);
      console.log('📈 Fetching recent activity...');

      const response = await fetch(`${BACKEND_URL}/admin/activity/recent?limit=5`);
      const data = await response.json();

      if (data.status === 'success') {
        setRecentActivity(data.data.activities);
        console.log('✅ Recent activity loaded');
      } else {
        throw new Error(data.message || 'Failed to fetch recent activity');
      }
    } catch (error) {
      console.error('❌ Error fetching recent activity:', error);
    } finally {
      setIsLoadingActivity(false);
    }
  }, []);

  const fetchSystemAlerts = useCallback(async () => {
    try {
      console.log('🚨 Fetching system alerts...');

      const response = await fetch(`${BACKEND_URL}/admin/alerts/system`);
      const data = await response.json();

      if (data.status === 'success') {
        setSystemAlerts(data.data.alerts);
        console.log('✅ System alerts loaded');
      } else {
        throw new Error(data.message || 'Failed to fetch system alerts');
      }
    } catch (error) {
      console.error('❌ Error fetching system alerts:', error);
    }
  }, []);

  // Handle tab query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'users', 'approvals', 'analytics', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // ✅ FIXED: Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchDashboardStats(),
        fetchPendingRiders(),
        fetchRecentActivity(),
        fetchSystemAlerts(),
      ]);
    };

    loadData();
  }, [fetchDashboardStats, fetchPendingRiders, fetchRecentActivity, fetchSystemAlerts]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(`/admin?tab=${tabId}`, { scroll: false });
  };

  // ✅ DYNAMIC STATS DATA
  const statsData: StatCardProps[] = [
    {
      icon: Users,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
      title: 'Total Users',
      titleColor: 'text-green-600',
      value: isLoadingStats ? '...' : dashboardStats.totalUsers.toLocaleString(),
      valueColor: 'text-green-600',
      subtitle: dashboardStats.userGrowthRate + ' from last month',
      subtitleColor: 'text-green-500',
      backgroundColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      icon: TrendingUp,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      title: 'Active Agents',
      titleColor: 'text-blue-600',
      value: isLoadingStats ? '...' : dashboardStats.activeAgents.toString(),
      valueColor: 'text-blue-600',
      subtitle: '89% completion rate',
      subtitleColor: 'text-blue-500',
      backgroundColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      icon: CheckCircle,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100',
      title: 'Verified Vendors',
      titleColor: 'text-purple-600',
      value: isLoadingStats ? '...' : dashboardStats.verifiedVendors.toString(),
      valueColor: 'text-purple-600',
      subtitle: '4.8 avg rating',
      subtitleColor: 'text-purple-500',
      backgroundColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      icon: DollarSign,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
      title: 'Platform Revenue',
      titleColor: 'text-green-600',
      value: isLoadingStats ? '...' : dashboardStats.platformRevenue,
      valueColor: 'text-green-600',
      subtitle: dashboardStats.pickupGrowthRate + ' from last month',
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

  // ✅ HANDLE DOCUMENT REVIEW
  const handleReviewDocuments = (rider: PendingRider) => {
    setSelectedRiderForReview(rider);
    setDocumentModalOpen(true);
  };

  // ✅ APPROVAL HANDLERS
  const handleApprove = async (rider: PendingRider) => {
    if (!isConnected) {
      setErrorMessage('Please connect your wallet first');
      return;
    }

    console.log(`🎯 Starting approval process for rider ID: ${rider.riderId}`);

    setIsProcessing(true);
    setProcessingId(rider.riderId.toString());
    setActionType('approve');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const walletData = createWalletData(accountId!, walletInterface!);
      const result = await approveRider(walletData, rider.riderId);

      if (result.success) {
        setSuccessMessage(
          `✅ Successfully approved ${rider.name}! Transaction: ${result.txHash?.substring(0, 10)}...`,
        );
        console.log(`🎉 Approval successful for ${rider.name}`);

        // Refresh data after approval
        await Promise.all([fetchPendingRiders(), fetchDashboardStats()]);

        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(result.error || 'Approval failed');
      }
    } catch (error) {
      console.error('❌ Approval error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve rider';
      setErrorMessage(errorMessage);
    } finally {
      setIsProcessing(false);
      setProcessingId(null);
      setActionType(null);
    }
  };

  const handleReject = async (rider: PendingRider) => {
    if (!isConnected) {
      setErrorMessage('Please connect your wallet first');
      return;
    }

    console.log(`🎯 Starting rejection process for rider ID: ${rider.riderId}`);

    setIsProcessing(true);
    setProcessingId(rider.riderId.toString());
    setActionType('ban');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const walletData = createWalletData(accountId!, walletInterface!);
      const result = await banRider(walletData, rider.riderId);

      if (result.success) {
        setSuccessMessage(
          `✅ Successfully rejected ${rider.name}! Transaction: ${result.txHash?.substring(0, 10)}...`,
        );
        console.log(`🎉 Rejection successful for ${rider.name}`);

        // Refresh data after rejection
        await Promise.all([fetchPendingRiders(), fetchDashboardStats()]);

        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(result.error || 'Rejection failed');
      }
    } catch (error) {
      console.error('❌ Rejection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject rider';
      setErrorMessage(errorMessage);
    } finally {
      setIsProcessing(false);
      setProcessingId(null);
      setActionType(null);
    }
  };

  // ✅ EXPANDED USERS VIEW - Full users list with pagination and management
  function ExpandedUsersView() {
    const [expandedUsers, setExpandedUsers] = useState<User[]>([]);
    const [isLoadingExpanded, setIsLoadingExpanded] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 12;

    // ✅ FIXED: Use useCallback and proper dependency
    const fetchAllUsers = useCallback(async () => {
      try {
        setIsLoadingExpanded(true);
        console.log('👥 Fetching all users for expanded view...');

        const response = await fetch(`${BACKEND_URL}/riders`);
        const data = await response.json();

        if (data.status === 'success') {
          setExpandedUsers(data.data || []);
          console.log(`✅ Loaded ${data.data?.length || 0} users for expanded view`);
        } else {
          throw new Error(data.message || 'Failed to fetch users');
        }
      } catch (error) {
        console.error('❌ Error fetching expanded users:', error);
        setErrorMessage('Failed to load all users');
      } finally {
        setIsLoadingExpanded(false);
      }
    }, []);

    // ✅ FIXED: Proper dependency array
    useEffect(() => {
      fetchAllUsers();
    }, [fetchAllUsers]);

    // Filter and search users
    const filteredUsers = expandedUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phoneNumber.includes(searchQuery) ||
        user.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.country.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || user.approvalStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

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

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-space-grotesk text-2xl font-semibold text-white">All Users</h3>
            <p className="font-inter text-gray-400">
              {filteredUsers.length} of {expandedUsers.length} users
            </p>
          </div>
          <button
            onClick={() => setShowExpandedUsers(false)}
            className="flex items-center gap-2 rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-white hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-600 bg-[#1a2928] py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-600 bg-[#1a2928] px-3 py-2 text-white focus:border-green-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="available">Available</option>
              <option value="off-line">Off-line</option>
              <option value="on-trip">On Trip</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingExpanded && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <span className="ml-2 text-gray-400">Loading all users...</span>
          </div>
        )}

        {/* No Users */}
        {!isLoadingExpanded && filteredUsers.length === 0 && (
          <div className="rounded-xl border border-slate-700/50 bg-black/80 p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-500" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              {searchQuery || statusFilter !== 'all' ? 'No users found' : 'No users registered'}
            </h3>
            <p className="text-gray-400">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Users will appear here once they register.'}
            </p>
          </div>
        )}

        {/* Users Grid */}
        {!isLoadingExpanded && paginatedUsers.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedUsers.map((user) => (
                <div
                  key={user.riderId}
                  className="rounded-xl border border-slate-700/50 bg-black p-6 transition-all hover:border-green-500/30"
                >
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-blue-400">
                      <span className="text-lg font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h4 className="font-space-grotesk truncate text-lg font-semibold text-white">
                          {user.name}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(user.approvalStatus)}`}
                        >
                          {user.approvalStatus}
                        </span>
                      </div>
                      <p className="font-inter text-sm text-gray-400">{user.country}</p>
                      <p className="font-inter text-sm text-gray-500">#{user.riderId}</p>
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-gray-400">Vehicle:</span>
                      <span className="font-semibold text-white">{user.vehicleType}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Capacity:</span>
                      <span className="font-semibold text-green-400">{user.capacity}kg</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Phone:</span>
                      <span className="font-semibold text-white">{user.phoneNumber}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Status:</span>
                      <span className="font-semibold text-white">{user.riderStatus}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => handleReviewDocuments(user)}
                      className="w-full rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                    >
                      View Documents
                    </button>
                    <button
                      onClick={() => router.push(`/admin/users/${user.riderId}`)}
                      className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                    >
                      Manage User
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-green-600 text-white'
                            : 'border border-slate-600 bg-transparent text-white hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ✅ EXPANDED APPROVALS VIEW - Full approvals list with management
  function ExpandedApprovalsView() {
    const [allPendingRiders, setAllPendingRiders] = useState<PendingRider[]>([]);
    const [isLoadingAllPending, setIsLoadingAllPending] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [vehicleFilter, setVehicleFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ridersPerPage = 6;

    // ✅ FIXED: Use useCallback
    const fetchAllPendingRiders = useCallback(async () => {
      try {
        setIsLoadingAllPending(true);
        console.log('🔍 Fetching all pending riders...');

        const response = await fetch(`${BACKEND_URL}/admin/riders/pending`);
        const data = await response.json();

        if (data.status === 'success') {
          setAllPendingRiders(data.data.riders || []);
          console.log(`✅ Loaded ${data.data.count || 0} pending riders`);
        } else {
          throw new Error(data.message || 'Failed to fetch pending riders');
        }
      } catch (error) {
        console.error('❌ Error fetching all pending riders:', error);
        setErrorMessage('Failed to load all pending riders');
      } finally {
        setIsLoadingAllPending(false);
      }
    }, []);

    // ✅ FIXED: Proper dependency
    useEffect(() => {
      fetchAllPendingRiders();
    }, [fetchAllPendingRiders]);

    // Get unique countries for filter
    const uniqueCountries = [...new Set(allPendingRiders.map((rider) => rider.country))];

    // Filter riders
    const filteredRiders = allPendingRiders.filter((rider) => {
      const matchesSearch =
        rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rider.phoneNumber.includes(searchQuery) ||
        rider.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesVehicle =
        vehicleFilter === 'all' || rider.vehicleType.toLowerCase() === vehicleFilter.toLowerCase();

      const matchesCountry = countryFilter === 'all' || rider.country === countryFilter;

      return matchesSearch && matchesVehicle && matchesCountry;
    });

    // Pagination
    const totalPages = Math.ceil(filteredRiders.length / ridersPerPage);
    const startIndex = (currentPage - 1) * ridersPerPage;
    const paginatedRiders = filteredRiders.slice(startIndex, startIndex + ridersPerPage);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-space-grotesk text-2xl font-semibold text-white">
              All Pending Approvals
            </h3>
            <p className="font-inter text-gray-400">
              {filteredRiders.length} of {allPendingRiders.length} pending riders
            </p>
          </div>
          <button
            onClick={() => setShowExpandedApprovals(false)}
            className="flex items-center gap-2 rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-white hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search riders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-600 bg-[#1a2928] py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={vehicleFilter}
              onChange={(e) => {
                setVehicleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-600 bg-[#1a2928] px-3 py-2 text-white focus:border-green-500 focus:outline-none"
            >
              <option value="all">All Vehicles</option>
              <option value="bike">Bike</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
            </select>

            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-600 bg-[#1a2928] px-3 py-2 text-white focus:border-green-500 focus:outline-none"
            >
              <option value="all">All Countries</option>
              {uniqueCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingAllPending && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <span className="ml-2 text-gray-400">Loading all pending approvals...</span>
          </div>
        )}

        {/* No Pending Riders */}
        {!isLoadingAllPending && filteredRiders.length === 0 && (
          <div className="rounded-xl border border-slate-700/50 bg-black/80 p-12 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-gray-500" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              {searchQuery || vehicleFilter !== 'all' || countryFilter !== 'all'
                ? 'No matching riders found'
                : 'No pending approvals'}
            </h3>
            <p className="text-gray-400">
              {searchQuery || vehicleFilter !== 'all' || countryFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'All rider applications have been processed.'}
            </p>
          </div>
        )}

        {/* Riders List */}
        {!isLoadingAllPending && paginatedRiders.length > 0 && (
          <>
            <div className="space-y-6">
              {paginatedRiders.map((rider) => (
                <div
                  key={rider.riderId}
                  className="rounded-xl border border-slate-700/50 bg-black/80 p-6 transition-all hover:border-green-500/30"
                >
                  <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700">
                      <span className="text-lg font-bold text-white">
                        {rider.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h4 className="font-inter text-lg font-medium text-white">{rider.name}</h4>
                        <span
                          className={`rounded-lg px-3 py-1 text-xs font-medium ${
                            rider.vehicleType === 'Car'
                              ? 'bg-blue-100 text-blue-800'
                              : rider.vehicleType === 'Bike'
                                ? 'bg-purple-100 text-purple-800'
                                : rider.vehicleType === 'Van'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {rider.vehicleType}
                        </span>
                      </div>
                      <p className="font-inter mb-1 text-sm font-normal text-white/80">
                        {rider.phoneNumber}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-white/80">
                        <span>{rider.country}</span>
                        <span>•</span>
                        <span>{rider.vehicleNumber}</span>
                        <span>•</span>
                        <span>Capacity: {rider.capacity}kg</span>
                        <span>•</span>
                        <span>Rider #{rider.riderId}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Applied: {new Date(rider.submissionDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReviewDocuments(rider)}
                      className="font-inter notification-border flex flex-1 items-center justify-center gap-2 rounded-lg border px-6 py-3 text-base font-normal text-white transition-colors hover:bg-gray-800"
                    >
                      Review Documents
                    </button>

                    <button
                      onClick={() => handleApprove(rider)}
                      disabled={isProcessing || !isConnected}
                      className="font-space-grotesk secondary-green-bg flex min-w-[140px] items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-medium text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-gray-600"
                    >
                      {isProcessing &&
                      processingId === rider.riderId.toString() &&
                      actionType === 'approve' ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 rounded-full text-black" />
                          Approve
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleReject(rider)}
                      disabled={isProcessing || !isConnected}
                      className="font-inter notification-border flex min-w-[140px] items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                    >
                      {isProcessing &&
                      processingId === rider.riderId.toString() &&
                      actionType === 'ban' ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <X className="error-border text-error font-space-grotesk h-5 w-5 rounded-full border" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-green-600 text-white'
                            : 'border border-slate-600 bg-transparent text-white hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
      <div className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6 lg:space-y-8">
          {/* Header Section */}
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-green-gradient font-space-grotesk mb-2 bg-transparent bg-clip-text text-3xl font-bold md:text-4xl lg:text-5xl">
                Welcome, Kemsguy
              </h1>
              <p className="secondary-text font-inter text-lg">
                Manage and monitor the EcoCleans platform
              </p>
            </div>
            <div className="flex gap-3">
              {!isConnected ? (
                <div className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-100 px-6 py-2 text-sm font-medium text-orange-700">
                  <AlertTriangle className="h-4 w-4" />
                  Connect wallet for admin actions
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
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-700">{errorMessage}</span>
              <button
                onClick={() => setErrorMessage('')}
                className="ml-auto rounded p-1 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* System Alerts */}
          <div className="rounded-2xl border border-orange-200 bg-[#FFF4E8E5] p-6">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="font-inter font-semibold text-[#FF8C00]">
                System Alerts ({systemAlerts.length})
              </h3>
            </div>

            <div className="space-y-3">
              {systemAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        alert.type === 'error'
                          ? 'bg-red-100'
                          : alert.type === 'warning'
                            ? 'bg-orange-100'
                            : 'bg-blue-100'
                      }`}
                    >
                      {alert.type === 'error' ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : alert.type === 'warning' ? (
                        <Info className="h-5 w-5 text-orange-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-inter text-base font-medium text-black">{alert.title}</p>
                      <p className="font-inter text-xs text-[#1E2A28CC]">{alert.message}</p>
                    </div>
                  </div>
                  <span className="font-inter text-xs text-[#1E2A28CC]">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto rounded-lg bg-[#1a2928] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && !showExpandedUsers && !showExpandedApprovals && (
              <OverviewTab />
            )}
            {activeTab === 'users' && !showExpandedApprovals && <UsersTab />}
            {activeTab === 'approvals' && !showExpandedUsers && <ApprovalsTab />}
            {activeTab === 'analytics' && !showExpandedUsers && !showExpandedApprovals && (
              <AnalyticsTab />
            )}
            {activeTab === 'settings' && !showExpandedUsers && !showExpandedApprovals && (
              <SettingsTab />
            )}

            {/* ✅ EXPANDED VIEWS */}
            {showExpandedUsers && <ExpandedUsersView />}
            {showExpandedApprovals && <ExpandedApprovalsView />}
          </div>
        </div>
      </div>

      {/* Document Review Modal */}
      {selectedRiderForReview && (
        <DocumentReviewModal
          isOpen={documentModalOpen}
          onClose={() => {
            setDocumentModalOpen(false);
            setSelectedRiderForReview(null);
          }}
          riderData={selectedRiderForReview}
        />
      )}
    </AppLayout>
  );

  // ✅ TAB COMPONENTS
  function OverviewTab() {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Environmental Impact */}
        <div className="rounded-2xl border border-slate-700/50 bg-black/80 p-6">
          <div className="mb-6 flex items-center gap-2">
            <BarChart3 className="text-primary h-5 w-5" />
            <h3 className="font-space-grotesk text-primary font-semibold">Environmental Impact</h3>
          </div>

          <div className="font-inter mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-4 text-center">
              <p className="text-primary text-base font-semibold">125.6T</p>
              <p className="font-inter text-primary text-xs font-normal">Materials Recycled</p>
            </div>
            <div className="text-info-darker rounded-2xl bg-white p-4 text-center">
              <p className="font-inter text-base font-bold">78.4T</p>
              <p className="font-inter text-xs font-normal">CO2 Saved</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white text-center">
            <div className="font-inter text-info-purple flex flex-col items-center gap-1 py-4 font-semibold">
              <div className="text-base font-semibold">3564</div>
              <div className="text-xs font-normal">Trees Equivalent</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="font-inter rounded-2xl border border-slate-700/50 bg-black/80 p-6">
          <div className="mb-6 flex items-center gap-2">
            <h3 className="text-base font-medium text-white">Recent Activity</h3>
            {isLoadingActivity && <Loader2 className="h-4 w-4 animate-spin text-green-500" />}
          </div>

          <div className="space-y-4">
            {recentActivity.slice(0, 3).map((activity, index) => (
              <div
                key={index}
                className="font-inter notification-border flex items-center justify-between rounded-lg border p-4 text-white"
              >
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-white">{activity.message}</div>
                  <div className="lighter-green-text text-xs font-normal">{activity.type}</div>
                </div>
                <div className="lighter-green-text text-xs font-normal">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function UsersTab() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // ✅ FIXED: Use useCallback for fetchUsers
    const fetchUsers = useCallback(async () => {
      try {
        setIsLoadingUsers(true);
        console.log('👥 Fetching users...');

        const response = await fetch(`${BACKEND_URL}/riders`);
        const data = await response.json();

        if (data.status === 'success') {
          setUsers(data.data || []);
          console.log(`✅ Loaded ${data.data?.length || 0} users`);
        } else {
          throw new Error(data.message || 'Failed to fetch users');
        }
      } catch (error) {
        console.error('❌ Error fetching users:', error);
        setErrorMessage('Failed to load users');
      } finally {
        setIsLoadingUsers(false);
      }
    }, []);

    // ✅ FIXED: Load users when tab becomes active
    useEffect(() => {
      fetchUsers();
    }, [fetchUsers]);

    const handleViewProfile = (userId: string) => {
      router.push(`/admin/users/${userId}/profile`);
    };

    const handleManageUser = (userId: string) => {
      router.push(`/admin/users/${userId}`);
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

    // Filter users based on search query
    const filteredUsers = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phoneNumber.includes(searchQuery) ||
        user.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-space-grotesk text-2xl font-semibold text-white">User Management</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-w-[250px] rounded-lg border border-slate-600 bg-[#1a2928] py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowExpandedUsers(true)}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              View All Users
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingUsers && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <span className="ml-2 text-gray-400">Loading users...</span>
          </div>
        )}

        {/* No Users */}
        {!isLoadingUsers && filteredUsers.length === 0 && (
          <div className="rounded-xl border border-slate-700/50 bg-black/80 p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-500" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              {searchQuery ? 'No users found' : 'No users registered'}
            </h3>
            <p className="text-gray-400">
              {searchQuery
                ? 'Try adjusting your search criteria.'
                : 'Users will appear here once they register.'}
            </p>
          </div>
        )}

        {/* User Cards */}
        {!isLoadingUsers && filteredUsers.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.slice(0, 9).map((user) => (
              <div
                key={user.riderId}
                className="rounded-xl border border-slate-700/50 bg-black p-6 transition-all hover:border-green-500/30"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-blue-400">
                    <span className="text-lg font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h4 className="font-space-grotesk truncate text-lg font-semibold text-white">
                        {user.name}
                      </h4>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(user.approvalStatus)}`}
                      >
                        {user.approvalStatus}
                      </span>
                    </div>
                    <p className="font-inter text-sm text-gray-400">{user.country}</p>
                    <p className="font-inter text-sm text-gray-500">#{user.riderId}</p>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-400">Vehicle:</span>
                    <span className="font-semibold text-white">{user.vehicleType}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Capacity:</span>
                    <span className="font-semibold text-green-400">{user.capacity}kg</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Phone:</span>
                    <span className="font-semibold text-white">{user.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Status:</span>
                    <span className="font-semibold text-white">{user.riderStatus}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleViewProfile(user.riderId.toString())}
                    className="w-full rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleManageUser(user.riderId.toString())}
                    className="w-full rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredUsers.length > 9 && (
          <div className="text-center">
            <button
              onClick={() => router.push('/admin/users')}
              className="gradient-button rounded-lg px-6 py-3 font-semibold text-black transition-all duration-200 hover:shadow-lg"
            >
              View All {users.length} Users
            </button>
          </div>
        )}
      </div>
    );
  }

  function ApprovalsTab() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-space-grotesk text-2xl font-bold text-white">
            Pending Approvals ({isLoadingPending ? '...' : pendingRiders.length})
          </h3>
          <button
            onClick={() => setShowExpandedApprovals(true)}
            className="gradient-button font-space-grotesk flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-black transition-all duration-200 hover:shadow-lg"
          >
            View All Approvals
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Loading State */}
        {isLoadingPending && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <span className="ml-2 text-gray-400">Loading pending approvals...</span>
          </div>
        )}

        {/* No Pending Approvals */}
        {!isLoadingPending && pendingRiders.length === 0 && (
          <div className="rounded-xl border border-slate-700/50 bg-black/80 p-12 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-gray-500" />
            <h3 className="mb-2 text-lg font-semibold text-white">No Pending Approvals</h3>
            <p className="text-gray-400">All rider applications have been processed.</p>
          </div>
        )}

        {/* Approval Cards - Show only first 3 */}
        {!isLoadingPending && pendingRiders.length > 0 && (
          <div className="space-y-4">
            {pendingRiders.slice(0, 3).map((rider) => (
              <div
                key={rider.riderId}
                className="rounded-xl border border-slate-700/50 bg-black/80 p-6 transition-all hover:border-green-500/30"
              >
                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700">
                    <span className="text-lg font-bold text-white">
                      {rider.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h4 className="font-inter text-lg font-medium text-white">{rider.name}</h4>
                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-medium ${
                          rider.vehicleType === 'Car'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {rider.vehicleType}
                      </span>
                    </div>
                    <p className="font-inter mb-1 text-sm font-normal text-white/80">
                      {rider.phoneNumber}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-white/80">
                      <span>{rider.country}</span>
                      <span>•</span>
                      <span>{rider.vehicleNumber}</span>
                      <span>•</span>
                      <span>Capacity: {rider.capacity}kg</span>
                      <span>•</span>
                      <span>Rider #{rider.riderId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {/* ✅ UPDATED REVIEW DOCUMENTS BUTTON */}
                  <button
                    onClick={() => handleReviewDocuments(rider)}
                    className="font-inter notification-border flex flex-1 items-center justify-center gap-2 rounded-lg border px-6 py-3 text-base font-normal text-white transition-colors hover:bg-gray-800"
                  >
                    Review Documents
                  </button>

                  <button
                    onClick={() => handleApprove(rider)}
                    disabled={isProcessing || !isConnected}
                    className="font-space-grotesk secondary-green-bg flex min-w-[140px] items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-medium text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-gray-600"
                  >
                    {isProcessing &&
                    processingId === rider.riderId.toString() &&
                    actionType === 'approve' ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 rounded-full text-black" />
                        Approve
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleReject(rider)}
                    disabled={isProcessing || !isConnected}
                    className="font-inter notification-border flex min-w-[140px] items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                  >
                    {isProcessing &&
                    processingId === rider.riderId.toString() &&
                    actionType === 'ban' ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <X className="error-border text-error font-space-grotesk h-5 w-5 rounded-full border" />
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function AnalyticsTab() {
    return (
      <div className="space-y-6">
        <h3 className="font-space-grotesk text-2xl font-semibold text-white">
          Analytics Dashboard
        </h3>
        <div className="rounded-xl border border-slate-700/50 bg-black/80 p-6">
          <p className="text-white">Analytics and reporting features coming soon...</p>
        </div>
      </div>
    );
  }

  function SettingsTab() {
    const [contractBalance, setContractBalance] = useState<string>('Loading...');
    const [isGettingBalance, setIsGettingBalance] = useState(false);
    const [isFunding, setIsFunding] = useState(false);
    const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

    // ✅ SIMPLIFIED - Using adminService
    const handleGetContractBalance = async () => {
      if (!isConnected) {
        setErrorMessage('Please connect your wallet first');
        return;
      }

      setIsGettingBalance(true);
      try {
        const walletData = createWalletData(accountId!, walletInterface!);
        const result = await getContractBalance(walletData);

        if (result.success) {
          setContractBalance(result.balance || '0 HBAR');
          setSuccessMessage('Contract balance retrieved successfully');
        } else {
          throw new Error(result.error);
        }

        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('❌ Error getting contract balance:', error);
        setErrorMessage(
          `Failed to get contract balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        setContractBalance('Error loading balance');
      } finally {
        setIsGettingBalance(false);
      }
    };

    // ✅ SIMPLIFIED - Using adminService
    const handleFundContract = async () => {
      if (!isConnected) {
        setErrorMessage('Please connect your wallet first');
        return;
      }

      const hbarAmount = parseFloat(fundingAmount.replace(/[^0-9.]/g, ''));
      if (!hbarAmount || hbarAmount <= 0) {
        setErrorMessage('Please enter a valid funding amount');
        return;
      }

      setIsFunding(true);
      try {
        const walletData = createWalletData(accountId!, walletInterface!);
        const result = await fundContract(walletData);

        if (result.success) {
          setSuccessMessage(
            `✅ Successfully funded contract with ${hbarAmount} HBAR! TX: ${result.txHash?.substring(0, 10)}...`,
          );
          setTimeout(() => handleGetContractBalance(), 3000);
        } else {
          throw new Error(result.error);
        }

        setTimeout(() => setSuccessMessage(''), 5000);
      } catch (error) {
        console.error('❌ Error funding contract:', error);
        setErrorMessage(
          `Failed to fund contract: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      } finally {
        setIsFunding(false);
      }
    };

    // ✅ SIMPLIFIED - Using adminService
    const handleUpdateMaterialPrice = async () => {
      if (!isConnected) {
        setErrorMessage('Please connect your wallet first');
        return;
      }

      const priceInHbar = parseFloat(pricePerKg.replace(/[^0-9.]/g, ''));
      if (!priceInHbar || priceInHbar <= 0) {
        setErrorMessage('Please enter a valid price greater than 0');
        return;
      }

      setIsUpdatingPrice(true);
      try {
        const walletData = createWalletData(accountId!, walletInterface!);
        const result = await updateMaterialPrice(walletData, selectedMaterial, priceInHbar);

        if (result.success) {
          setSuccessMessage(
            `✅ Successfully updated ${selectedMaterial} price to ${priceInHbar} HBAR/kg! TX: ${result.txHash?.substring(0, 10)}...`,
          );
        } else {
          throw new Error(result.error);
        }

        setTimeout(() => setSuccessMessage(''), 5000);
      } catch (error) {
        console.error('❌ Error updating price:', error);
        setErrorMessage(
          `Failed to update material price: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      } finally {
        setIsUpdatingPrice(false);
      }
    };

    // ✅ FIXED: Use useCallback and proper dependencies
    const initializeSettings = useCallback(() => {
      if (isConnected) {
        handleGetContractBalance();
      } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected]);

    // Load contract balance on settings tab
    useEffect(() => {
      initializeSettings();
    }, [initializeSettings]);

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Material Pricing */}
        <div className="rounded-xl border border-slate-700/50 bg-black p-6">
          <h3 className="text-primary font-space-grotesk mb-6 text-lg font-semibold">
            Material Pricing Management
          </h3>

          <div className="space-y-4">
            <div>
              <label className="font-inter mb-2 block text-sm text-gray-400">
                Select Material Type:
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-lg border border-slate-600 bg-[#1a2928] px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                disabled={isUpdatingPrice}
              >
                <option value="Paper & Cardboard">Paper & Cardboard</option>
                <option value="Plastic">Plastic</option>
                <option value="Metal">Metal</option>
                <option value="Glass">Glass</option>
                <option value="Electronic">Electronic</option>
                <option value="Textile">Textile</option>
              </select>
            </div>

            <div>
              <label className="font-inter mb-2 block text-sm text-gray-400">
                Price per Kg (HBAR):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 10.50"
                value={pricePerKg.replace(/[^0-9.]/g, '')}
                onChange={(e) => setPricePerKg(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-[#1a2928] px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                disabled={isUpdatingPrice}
              />
            </div>

            <button
              onClick={handleUpdateMaterialPrice}
              disabled={isUpdatingPrice || !isConnected}
              className="gradient-button font-inter w-full rounded-lg px-4 py-3 font-semibold text-black transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-600"
            >
              {isUpdatingPrice ? (
                <>
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Updating Price...
                </>
              ) : (
                'Update Material Price'
              )}
            </button>
          </div>
        </div>

        {/* Contract Management */}
        <div className="rounded-xl border border-slate-700/50 bg-black p-6">
          <h3 className="text-primary font-space-grotesk mb-6 text-lg font-semibold">
            Contract Management
          </h3>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-600 bg-[#1a2928] p-4">
              <div className="flex items-center justify-between">
                <span className="font-inter text-sm text-gray-400">Current Contract Balance:</span>
                <span className="font-space-grotesk text-lg font-semibold text-green-400">
                  {contractBalance}
                </span>
              </div>
            </div>

            <div>
              <label className="font-inter mb-2 block text-sm text-gray-400">
                Amount to Fund (HBAR):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 1000"
                value={fundingAmount.replace(/[^0-9.]/g, '')}
                onChange={(e) => setFundingAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-[#1a2928] px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                disabled={isFunding}
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleFundContract}
                disabled={isFunding || !isConnected}
                className="gradient-button font-inter w-full rounded-lg px-4 py-3 font-semibold text-black transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {isFunding ? (
                  <>
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Funding Contract...
                  </>
                ) : (
                  'Fund Contract'
                )}
              </button>

              <button
                onClick={handleGetContractBalance}
                disabled={isGettingBalance || !isConnected}
                className="text-primary font-inter w-full rounded-lg border border-slate-600 bg-gray-800 px-4 py-3 font-semibold transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {isGettingBalance ? (
                  <>
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Getting Balance...
                  </>
                ) : (
                  'Refresh Contract Balance'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-green-500" />
            <p className="text-white">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
