'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle } from 'lucide-react';
import { useAgentSignup } from '../../../contexts/AgentSignupContext';
import AppLayout from '../../../components/layout/AppLayout';

export default function SignupSuccessPage(): React.JSX.Element {
  const router = useRouter();
  const { signupData, resetSignupData } = useAgentSignup();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGoToDashboard = () => {
    resetSignupData();
    router.push('/dashboard');
  };

  return (
    <AppLayout showHeader={true} showFooter={false} showSidebar={false}>
      <div className="body-gradient flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-space-grotesk text-2xl font-bold text-white">Join EcoCleans</h1>
            <p className="font-inter text-gray-300">Start your sustainable journey today</p>
          </div>

          {/* Success Card */}
          <div className="rounded-2xl border border-gray-700/50 bg-gray-800/90 p-8 backdrop-blur-lg">
            <div className="space-y-6">
              {/* Success Icon and Message */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                  <Check className="h-10 w-10 text-green-400" />
                </div>
                <h2 className="font-space-grotesk mb-3 text-2xl font-bold text-green-400">
                  Account Successfully Created! 🎉
                </h2>
                <p className="font-inter leading-relaxed text-gray-300">
                  Your rider account has been registered on the blockchain and is pending approval.
                </p>
              </div>

              {/* Registration Details */}
              {signupData.personalInfo.firstName && (
                <div className="rounded-lg bg-gray-700/50 p-4">
                  <h3 className="font-inter mb-3 text-sm font-medium text-gray-300">
                    Registration Details:
                  </h3>
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium text-gray-200">
                        {signupData.personalInfo.firstName} {signupData.personalInfo.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>User ID:</span>
                      <span className="font-medium text-gray-200">
                        {signupData.personalInfo.phoneNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vehicle:</span>
                      <span className="font-medium text-gray-200 capitalize">
                        {signupData.vehicleInfo.vehicleType} -{' '}
                        {signupData.vehicleInfo.vehiclePlateNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium text-yellow-400">Pending Approval</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Web2 Sync Warning */}
              {signupData.web2Error && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                    <div className="text-xs text-yellow-200">
                      <p className="mb-1 font-medium">Backend Sync Pending</p>
                      <p className="text-yellow-300/80">
                        Your registration is saved on the blockchain, but backend synchronization
                        had an issue. Please contact support if this persists.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                <h3 className="font-inter mb-2 text-sm font-medium text-blue-300">Next Steps:</h3>
                <ol className="list-inside list-decimal space-y-1.5 text-xs text-blue-200/80">
                  <li>Your application will be reviewed by our admin team</li>
                  <li>You'll be notified once approved (usually within 24-48 hours)</li>
                  <li>Once approved, you can start accepting pickup requests</li>
                  <li>Track your earnings and rides from your dashboard</li>
                </ol>
              </div>

              {/* Auto-redirect countdown */}
              {countdown > 0 && (
                <div className="font-inter text-center text-sm text-gray-400">
                  Auto-redirecting in <span className="font-bold text-green-400">{countdown}</span>
                  s...
                </div>
              )}

              {/* Go to Dashboard Button */}
              <button
                onClick={handleGoToDashboard}
                className="font-space-grotesk w-full rounded-xl bg-gradient-to-r from-yellow-400 to-green-500 px-6 py-4 text-lg font-semibold text-black transition-all duration-200 hover:from-yellow-500 hover:to-green-600"
              >
                Go to Dashboard Now
              </button>

              {/* Additional Info */}
              <div className="text-center">
                <p className="font-inter text-xs text-gray-400">
                  Ready to save our environment and earn while doing it! 🌍
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
