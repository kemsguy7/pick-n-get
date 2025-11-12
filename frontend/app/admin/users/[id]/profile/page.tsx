'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Shield, FileText } from 'lucide-react';
import AppLayout from '../../../../components/layout/AppLayout';

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
  documents: {
    profileImage?: string;
    driversLicense?: string;
    vehicleRegistration?: string;
    insuranceCertificate?: string;
    vehiclePhotos?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ FETCH REAL USER DATA
  const fetchUserData = async () => {
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
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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

  const handleBackToUsers = () => {
    router.push('/admin?tab=users');
  };

  if (isLoading) {
    return (
      <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
            <p className="text-white">Loading user profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !userData) {
    return (
      <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
        <div className="min-h-screen p-4 lg:p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-primary font-space-grotesk text-2xl font-bold lg:text-3xl">
                User Profile
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
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-primary font-space-grotesk text-2xl font-bold lg:text-3xl">
              User Profile
            </h1>
            <button
              onClick={handleBackToUsers}
              className="font-inter flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </button>
          </div>

          {/* User Profile Card */}
          <div className="rounded-xl border border-slate-700/50 bg-black p-6">
            <div className="mb-8 flex items-start gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-purple-400 to-blue-400">
                <span className="text-2xl font-bold text-white">
                  {userData.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
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

                <div className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm md:grid-cols-2">
                  <div className="flex justify-between">
                    <span className="font-inter text-gray-400">User ID:</span>
                    <span className="font-space-grotesk font-semibold text-white">
                      #{userData.riderId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-gray-400">Country:</span>
                    <span className="font-inter text-white">{userData.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-gray-400">Phone:</span>
                    <span className="font-inter text-white">{userData.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-gray-400">Vehicle Type:</span>
                    <span className="font-inter text-white">{userData.vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-gray-400">Vehicle Number:</span>
                    <span className="font-inter text-white">{userData.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-gray-400">Status:</span>
                    <span className="font-inter text-white">{userData.riderStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-gray-400">Capacity:</span>
                    <span className="font-inter text-white">{userData.capacity}kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-gray-400">Joined:</span>
                    <span className="font-inter text-white">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="mb-6 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
              <h3 className="mb-3 font-semibold text-white">Home Address</h3>
              <p className="text-gray-300">{userData.homeAddress}</p>
            </div>

            {/* Vehicle Details */}
            {(userData.vehicleMakeModel ||
              userData.vehiclePlateNumber ||
              userData.vehicleColor) && (
              <div className="mb-6 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
                <h3 className="mb-3 font-semibold text-white">Vehicle Details</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {userData.vehicleMakeModel && (
                    <div>
                      <span className="block text-sm text-gray-400">Make/Model:</span>
                      <span className="text-white">{userData.vehicleMakeModel}</span>
                    </div>
                  )}
                  {userData.vehiclePlateNumber && (
                    <div>
                      <span className="block text-sm text-gray-400">Plate Number:</span>
                      <span className="text-white">{userData.vehiclePlateNumber}</span>
                    </div>
                  )}
                  {userData.vehicleColor && (
                    <div>
                      <span className="block text-sm text-gray-400">Color:</span>
                      <span className="text-white">{userData.vehicleColor}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wallet Address */}
            {userData.walletAddress && (
              <div className="mb-6 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
                <h3 className="mb-3 font-semibold text-white">Wallet Information</h3>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="font-mono text-sm text-gray-300">
                    {userData.walletAddress.substring(0, 10)}...
                    {userData.walletAddress.substring(userData.walletAddress.length - 8)}
                  </span>
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
              <h3 className="mb-4 font-semibold text-white">Submitted Documents</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {Object.entries(userData.documents).map(
                  ([docType, docValue]) =>
                    docValue && (
                      <div
                        key={docType}
                        className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/50 p-3"
                      >
                        <FileText className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-white capitalize">
                          {docType.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
