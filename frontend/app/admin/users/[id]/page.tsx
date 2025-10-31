'use client';
import { useState } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../../components/layout/AppLayout';

interface UserDetails {
  name: string;
  userId: string;
  email: string;
  phone: string;
  role: string;
  country: string;
  itemsRecycled: number;
  status: string;
  balance: string;
}

export default function ManageUserPage() {
  const router = useRouter();
  const [currentAction, setCurrentAction] = useState<
    'default' | 'approve' | 'pay' | 'ban' | 'delete' | 'success'
  >('default');
  const [actionType, setActionType] = useState<'approve' | 'pay' | 'ban' | 'delete'>('approve');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [banReason, setBanReason] = useState('');

  const userDetails: UserDetails = {
    name: 'Adaora Okafor',
    userId: '#U001',
    email: 'adaoraokafor@example.com',
    phone: '+234 812 345 6789',
    role: 'Recycler',
    country: 'Nigeria',
    itemsRecycled: 12,
    status: 'Active',
    balance: '120 HBAR',
  };

  const handleAction = (action: 'approve' | 'pay' | 'ban' | 'delete') => {
    setActionType(action);
    setCurrentAction(action);
    // Clear form data when switching actions
    setPaymentAmount('');
    setBanReason('');
  };

  const handleConfirmAction = () => {
    setCurrentAction('success');
  };

  const handleCancelAction = () => {
    setCurrentAction('default');
    // Clear form data
    setPaymentAmount('');
    setBanReason('');
  };

  const handleBackToUsers = () => {
    // Navigate back to admin dashboard and set users tab as active
    router.push('/admin?tab=users');
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
            <p className="font-inter mb-6 text-gray-400">Check documents and confirm approval.</p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmAction}
                className="gradient-button font-inter rounded-lg px-6 py-2 font-semibold text-black transition-all duration-200 hover:shadow-lg"
              >
                Confirm Approval
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
                <label className="font-inter mb-2 block text-sm text-gray-400">Amount:</label>
                <input
                  type="text"
                  placeholder="Enter Amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-[#1a2928] px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmAction}
                  className="font-inter flex-1 rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  Confirm Payment
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
              <textarea
                placeholder="Enter Reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-600 bg-[#1a2928] px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmAction}
                  className="font-inter flex-1 rounded-lg bg-red-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Confirm Ban
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
              This action cannot be undone. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmAction}
                className="font-inter rounded-lg bg-red-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-600"
              >
                Confirm Delete
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

          {/* User Info Card */}
          <div className="rounded-xl border border-slate-700/50 bg-black p-8">
            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Name:</span>
                  <span className="text-primary font-space-grotesk text-lg font-semibold">
                    {userDetails.name}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Email:</span>
                  <span className="font-inter text-white">{userDetails.email}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Phone:</span>
                  <span className="font-inter text-white">{userDetails.phone}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Role:</span>
                  <span className="font-inter text-white">{userDetails.role}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">User ID:</span>
                  <span className="text-primary font-space-grotesk text-lg font-semibold">
                    {userDetails.userId}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Country:</span>
                  <span className="font-inter text-white">{userDetails.country}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Items Recycled:</span>
                  <span className="font-inter text-white">{userDetails.itemsRecycled}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Status:</span>
                  <span className="text-primary rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-medium">
                    {userDetails.status}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-inter text-gray-400">Balance:</span>
                  <span className="font-inter text-white">{userDetails.balance}</span>
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
