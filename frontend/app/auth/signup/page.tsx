'use client';

import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/layout/AppLayout';

interface UserRole {
  id: 'recycler' | 'agent' | 'vendor';
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  selected: boolean;
}

export default function SignupMainPage(): React.JSX.Element {
  const [selectedRole, setSelectedRole] = useState<'recycler' | 'agent' | 'vendor'>('recycler');
  const router = useRouter();

  const userRoles: UserRole[] = [
    {
      id: 'recycler',
      title: 'Recycler',
      description: 'Earn rewards by recycling waste materials',
      icon: '♻️',
      bgColor: 'bg-green-50',
      selected: selectedRole === 'recycler',
    },
    {
      id: 'agent',
      title: 'Pickup Agent',
      description: 'Collect recyclables and earn income',
      icon: '🚛',
      bgColor: 'bg-blue-50',
      selected: selectedRole === 'agent',
    },
    {
      id: 'vendor',
      title: 'Vendor',
      description: 'Sell sustainable products made from recycled materials',
      icon: '🏪',
      bgColor: 'bg-purple-50',
      selected: selectedRole === 'vendor',
    },
  ];

  const handleContinue = () => {
    switch (selectedRole) {
      case 'recycler':
        router.push('/auth/signup/recycler');
        break;
      case 'agent':
        router.push('/auth/signup/agent');
        break;
      case 'vendor':
        router.push('/auth/signup/vendor');
        break;
    }
  };

  return (
    <AppLayout showHeader={true} showFooter={false} showSidebar={false}>
      <div className="body-gradient flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500">
              <div className="h-8 w-8 rounded-lg bg-white"></div>
            </div>
            <h1 className="font-space-grotesk text-2xl font-bold text-white">Join EcoCleans</h1>
            <p className="font-inter text-gray-300">Start your sustainable journey today</p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl bg-white p-6">
            {/* Progress Header */}
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-space-grotesk text-xl font-bold text-black">Create Account</h2>
                <span className="font-inter text-sm text-gray-500">Step 2 of 4</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-1/2 rounded-full bg-green-500"></div>
              </div>
            </div>

            {/* Role Selection Content */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-space-grotesk mb-2 text-lg font-semibold text-black">
                  Choose Your Role
                </h3>
                <p className="font-inter text-sm text-gray-600">
                  Select how you want to participate in the Pick'n'Get ecosystem
                </p>
              </div>

              <div className="space-y-3">
                {userRoles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      role.selected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {role.selected && (
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}

                      <div
                        className={`h-10 w-10 ${role.bgColor} flex items-center justify-center rounded-lg`}
                      >
                        <span className="text-lg">{role.icon}</span>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-space-grotesk font-semibold text-black">
                          {role.title}
                        </h4>
                        <p className="font-inter text-sm text-gray-600">{role.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <div className="mt-6">
              <button
                onClick={handleContinue}
                className="font-space-grotesk flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-600"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Sign In Link */}
            <p className="font-inter mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="#" className="text-green-500 hover:underline">
                Sign in here
              </a>
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex items-center justify-center gap-8 text-center">
            <div className="text-white">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="font-inter text-xs">Earn ECO Tokens</p>
            </div>
            <div className="text-white">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="font-inter text-xs">Verified Platform</p>
            </div>
            <div className="text-white">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="font-inter text-xs">Secure & Private</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
