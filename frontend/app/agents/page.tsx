'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import StatCard, { StatCardProps } from '../components/ui/statCard';
import { useAuth } from '../contexts/AuthContext';
import {
  Truck,
  DollarSign,
  Star,
  CheckCircle,
  Phone,
  MapPin,
  User,
  Navigation,
  Eye,
  TrendingUp,
  Activity,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface AgentStats {
  totalPickups: number;
  totalEarnings: number;
  weeklyPickups: number;
  rating: number;
  completionRate: number;
}

interface Pickup {
  trackingId: string;
  pickupId: string;
  customerName: string;
  customerPhoneNumber: string;
  pickupAddress: string;
  itemCategory: string;
  itemWeight: number;
  estimatedEarnings: number;
  pickUpStatus: string;
  requestedAt: string;
}

export default function AgentDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [activePickups, setActivePickups] = useState<Pickup[]>([]);
  const [availableJobs, setAvailableJobs] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Get authenticated user data - FIXED: Added hasRole to destructured values
  const { user, isAuthenticated, hasRole } = useAuth();

  // Get rider ID from auth context
  const RIDER_ID = user?.riderData?.riderId;

  const fetchActivePickups = useCallback(async () => {
    if (!RIDER_ID) {
      setError('Rider ID not found');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${baseUrl}/agents/${RIDER_ID}/pickups/active`);
      if (response.ok) {
        const data = await response.json();
        setActivePickups(data.data.pickups);
      } else {
        setError('Failed to load active pickups');
      }
    } catch (err) {
      console.error('Error loading pickups:', err);
      setError('Error loading pickups');
    } finally {
      setLoading(false);
    }
  }, [RIDER_ID]);

  const fetchAvailableJobs = useCallback(async () => {
    if (!RIDER_ID) {
      setError('Rider ID not found');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${baseUrl}/agents/${RIDER_ID}/pickups/available`);
      if (response.ok) {
        const data = await response.json();
        setAvailableJobs(data.data.jobs);
      } else {
        setError('Failed to load available jobs');
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Error loading jobs');
    } finally {
      setLoading(false);
    }
  }, [RIDER_ID]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!RIDER_ID) {
        setError('Rider ID not found');
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/agents/${RIDER_ID}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    if (RIDER_ID) {
      fetchStats();
    }
  }, [RIDER_ID]);

  useEffect(() => {
    if (activeTab === 'active-pickups') {
      fetchActivePickups();
    }
  }, [activeTab, fetchActivePickups]);

  useEffect(() => {
    if (activeTab === 'available-jobs') {
      fetchAvailableJobs();
    }
  }, [activeTab, fetchAvailableJobs]);

  const handleAcceptJob = async (pickupId: string) => {
    if (!RIDER_ID) {
      alert('Rider ID not found');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/agents/${RIDER_ID}/pickups/${pickupId}/accept`, {
        method: 'POST',
      });
      if (response.ok) {
        alert('Job accepted successfully!');
        fetchAvailableJobs();
        fetchActivePickups();
      } else {
        alert('Failed to accept job');
      }
    } catch (err) {
      console.error('Error accepting job:', err);
      alert('Error accepting job');
    }
  };

  const handleUpdateStatus = async (pickupId: string, status: string) => {
    if (!RIDER_ID) {
      alert('Rider ID not found');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/agents/${RIDER_ID}/pickups/${pickupId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        alert('Status updated successfully!');
        fetchActivePickups();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status');
    }
  };

  // Show loading state or redirect if not authenticated as rider
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has rider role - FIXED: Now using hasRole function from AuthContext
  if (!hasRole('Rider')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <h2 className="mb-4 text-2xl font-bold text-red-400">Access Denied</h2>
          <p className="text-gray-600">You need rider privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  // Check if rider data exists
  if (!user.riderData?.riderId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
          <h2 className="mb-4 text-2xl font-bold text-yellow-400">Rider Setup Required</h2>
          <p className="text-gray-600">
            Please complete your rider registration or wait for approval.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Status: {user.riderData?.approvalStatus || 'Not registered'}
          </div>
        </div>
      </div>
    );
  }

  const statsData: StatCardProps[] = [
    {
      icon: Truck,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
      title: 'Total Pickups',
      titleColor: 'text-green-600',
      value: stats?.totalPickups.toString() || '0',
      valueColor: 'text-green-600',
      subtitle: `+${stats?.weeklyPickups || 0} this week`,
      subtitleColor: 'text-green-500',
      backgroundColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      icon: DollarSign,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      title: 'Total Earnings',
      titleColor: 'text-blue-600',
      value: `$${stats?.totalEarnings.toFixed(2) || '0.00'}`,
      valueColor: 'text-blue-600',
      subtitle: 'Lifetime earnings',
      subtitleColor: 'text-blue-500',
      backgroundColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      icon: Star,
      iconColor: 'text-yellow-600',
      iconBgColor: 'bg-yellow-100',
      title: 'Rating',
      titleColor: 'text-yellow-600',
      value: stats?.rating.toString() || '0',
      valueColor: 'text-yellow-600',
      subtitle: 'Excellent service',
      subtitleColor: 'text-yellow-500',
      backgroundColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      icon: CheckCircle,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100',
      title: 'Completion Rate',
      titleColor: 'text-purple-600',
      value: `${stats?.completionRate || 0}%`,
      valueColor: 'text-purple-600',
      subtitle: 'Great performance',
      subtitleColor: 'text-purple-500',
      backgroundColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Eye },
    { id: 'active-pickups', label: 'Active Pickups', icon: Activity },
    { id: 'available-jobs', label: 'Available Jobs', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
      <div className="dashboard-container min-h-screen bg-linear-to-br from-teal-900 via-slate-900 to-black p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6 lg:space-y-8">
          {/* Header with Real Rider Data */}
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-green-400 to-green-600 lg:h-20 lg:w-20">
                <User className="h-8 w-8 text-white lg:h-10 lg:w-10" />
              </div>
              <div>
                <h1 className="text-primary font-space-grotesk mb-2 flex items-center gap-3 text-2xl font-bold lg:text-3xl">
                  Agent Dashboard <Truck className="h-6 w-6 text-green-400 lg:h-8 lg:w-8" />
                </h1>
                <p className="secondary-text font-inter text-lg">
                  Welcome {user.userData?.name || 'Agent'}
                </p>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-400">
                  <span>Rider ID: {RIDER_ID}</span>
                  <span>•</span>
                  <span>Status: {user.riderData?.riderStatus || 'Unknown'}</span>
                  <span>•</span>
                  <span>Approval: {user.riderData?.approvalStatus || 'Pending'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {statsData.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          <div className="tab-nav flex gap-1 overflow-x-auto rounded-lg bg-[#1a2928] p-1">
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

          <div className="space-y-6">
            {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
            {activeTab === 'active-pickups' && (
              <ActivePickupsTab
                pickups={activePickups}
                loading={loading}
                error={error}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
            {activeTab === 'available-jobs' && (
              <AvailableJobsTab
                jobs={availableJobs}
                loading={loading}
                error={error}
                onAcceptJob={handleAcceptJob}
              />
            )}
            {activeTab === 'analytics' && <AnalyticsTab stats={stats} />}
          </div>
        </div>
      </div>
    </AppLayout>
  );

  function DashboardTab({ stats }: { stats: AgentStats | null }) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary h-5 w-5" />
            <h3 className="text-primary font-space-grotesk font-semibold text-white">
              Weekly Progress
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Pickups Completed</span>
              <span className="font-medium text-white">{stats?.weeklyPickups || 0} / 25</span>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-700">
              <div
                className="h-3 rounded-full bg-green-500"
                style={{ width: `${((stats?.weeklyPickups || 0) / 25) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-6">
          <div className="text-primary mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5" />
            <h3 className="text-primary font-space-grotesk font-semibold text-white">
              Performance
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="font-space-grotesk text-xl font-bold text-green-600">
                {stats?.rating || 0}
              </p>
              <p className="font-inter text-sm text-green-600">Rating</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="font-space-grotesk text-xl font-bold text-blue-600">
                {stats?.completionRate || 0}%
              </p>
              <p className="font-inter text-sm text-blue-600">Completion</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ActivePickupsTab({
    pickups,
    loading,
    error,
    onUpdateStatus,
  }: {
    pickups: Pickup[];
    loading: boolean;
    error: string;
    onUpdateStatus: (pickupId: string, status: string) => void;
  }) {
    if (loading) {
      return (
        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-12 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-green-400" />
          <p className="text-gray-300">Loading active pickups...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-500/30 bg-black p-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      );
    }

    if (pickups.length === 0) {
      return (
        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-12 text-center">
          <Truck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-400">No active pickups at the moment</p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-6">
        <h3 className="font-space-grotesk mb-6 font-semibold text-white">
          Active Pickup Orders ({pickups.length})
        </h3>

        <div className="space-y-4">
          {pickups.map((pickup) => (
            <div
              key={pickup.pickupId}
              className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-space-grotesk font-medium text-white">
                    {pickup.customerName}
                  </h4>
                  <p className="flex items-center gap-1 text-sm text-gray-400">
                    <MapPin className="h-3 w-3" />
                    {pickup.pickupAddress}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Weight: {pickup.itemWeight}kg | {pickup.itemCategory}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">${pickup.estimatedEarnings}</p>
                  <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
                    {pickup.pickUpStatus}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${pickup.pickupAddress}`)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
                >
                  <Navigation className="h-4 w-4" />
                  Navigate
                </button>
                <button
                  onClick={() => alert(`Call ${pickup.customerPhoneNumber}`)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </button>
                {pickup.pickUpStatus === 'InTransit' && (
                  <button
                    onClick={() => onUpdateStatus(pickup.pickupId, 'PickedUp')}
                    className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
                  >
                    Collected
                  </button>
                )}
                {pickup.pickUpStatus === 'PickedUp' && (
                  <button
                    onClick={() => onUpdateStatus(pickup.pickupId, 'Delivered')}
                    className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-700"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function AvailableJobsTab({
    jobs,
    loading,
    error,
    onAcceptJob,
  }: {
    jobs: Pickup[];
    loading: boolean;
    error: string;
    onAcceptJob: (pickupId: string) => void;
  }) {
    if (loading) {
      return (
        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-12 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-green-400" />
          <p className="text-gray-300">Loading available jobs...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-500/30 bg-black p-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      );
    }

    if (jobs.length === 0) {
      return (
        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-12 text-center">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-400">No available jobs at the moment</p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-6">
        <h3 className="font-space-grotesk mb-6 font-semibold text-white">
          Available Pickup Jobs ({jobs.length})
        </h3>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.pickupId}
              className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-space-grotesk font-medium text-white">{job.customerName}</h4>
                  <p className="flex items-center gap-1 text-sm text-gray-400">
                    <MapPin className="h-3 w-3" />
                    {job.pickupAddress}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Est. Weight: {job.itemWeight}kg | {job.itemCategory}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">Est. ${job.estimatedEarnings}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onAcceptJob(job.pickupId)}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
                >
                  Accept Job
                </button>
                <button className="rounded-lg bg-gray-600 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function AnalyticsTab({ stats }: { stats: AgentStats | null }) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-white" />
            <h3 className="font-space-grotesk font-semibold text-white">Performance Metrics</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-400">Completion Rate</span>
                <span className="font-medium text-white">{stats?.completionRate || 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${stats?.completionRate || 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-400">Customer Rating</span>
                <span className="font-medium text-white">{stats?.rating || 0}/5</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700">
                <div
                  className="h-2 rounded-full bg-yellow-500"
                  style={{ width: `${((stats?.rating || 0) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-6">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-400" />
            <h3 className="font-space-grotesk font-semibold text-white">Earnings Summary</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="font-space-grotesk text-2xl font-bold text-green-600">
                ${stats?.totalEarnings.toFixed(2) || '0.00'}
              </p>
              <p className="font-inter text-sm text-green-600">Total Earned</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="font-space-grotesk text-2xl font-bold text-blue-600">
                {stats?.totalPickups || 0}
              </p>
              <p className="font-inter text-sm text-blue-600">Total Pickups</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
