'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/layout/AppLayout';
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useAuthStore } from '@/lib/authStore';

// Extend Window interface for recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

// Define Firebase Error interface
interface FirebaseError extends Error {
  code: string;
  message: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { setConfirmationResult } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'rider'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setupRecaptcha = (): RecaptchaVerifier => {
    const auth = getAuth(app);

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          setError('reCAPTCHA expired. Please try again.');
        },
      });
    }
    return window.recaptchaVerifier;
  };

  const handleSendOTP = async () => {
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    // Validate phone format
    if (!phone.startsWith('+')) {
      setError('Phone number must start with country code (e.g., +234...)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const auth = getAuth(app);
      const verifier = setupRecaptcha();

      console.log('Sending OTP to:', phone);
      const confirmation: ConfirmationResult = await signInWithPhoneNumber(auth, phone, verifier);

      setConfirmationResult(confirmation);
      localStorage.setItem('verificationId', confirmation.verificationId);
      localStorage.setItem('phoneNumber', phone);
      localStorage.setItem('role', role);

      console.log('✅ OTP sent successfully');
      router.push('/auth/verify');
    } catch (error) {
      console.error('❌ SMS not sent:', error);
      const firebaseError = error as FirebaseError;

      if (firebaseError.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(firebaseError.message || 'Failed to send OTP. Please try again.');
      }

      // Reset recaptcha
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showHeader={true} showFooter={false} showSidebar={false}>
      <div
        id="recaptcha-container"
        className="body-gradient flex min-h-screen items-center justify-center p-4"
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500">
              <div className="h-8 w-8 rounded-lg bg-white"></div>
            </div>
            <h1 className="font-space-grotesk text-2xl font-bold text-white">
              Welcome to Pick'n'Get
            </h1>
            <p className="font-inter text-gray-300">Sign in to your sustainable future</p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl bg-white p-6">
            <div className="mb-6">
              <h2 className="font-space-grotesk mb-2 text-lg font-semibold text-black">Sign In</h2>

              {/* Role Selection */}
              <div className="mb-4">
                <label className="font-inter mb-2 block text-sm font-medium text-black">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`rounded-lg border-2 p-3 text-center transition-all ${
                      role === 'user'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <div className="text-2xl">♻️</div>
                    <div className="font-inter mt-1 text-sm font-medium">Recycler</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('rider')}
                    className={`rounded-lg border-2 p-3 text-center transition-all ${
                      role === 'rider'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <div className="text-2xl">🚗</div>
                    <div className="font-inter mt-1 text-sm font-medium">Agent</div>
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="font-inter mb-2 block text-sm font-medium text-black">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+234 800 000 0000"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setError('');
                    }}
                    disabled={loading}
                    className="font-inter w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10 transition-colors focus:border-green-500 focus:outline-none disabled:bg-gray-100"
                  />
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400">
                    📞
                  </div>
                </div>
                <p className="font-inter mt-1 text-xs text-gray-500">
                  Include country code (e.g., +234 for Nigeria)
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
              )}

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="font-space-grotesk flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 space-y-2">
              <p className="font-inter text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <span
                  className="cursor-pointer text-green-500 hover:underline"
                  onClick={() => router.push('/auth/signup/recycler')}
                >
                  Sign up here
                </span>
              </p>
              <div className="flex items-center justify-center">
                <span className="font-inter cursor-pointer text-sm text-green-500">
                  Join the sustainable revolution
                </span>
              </div>
            </div>
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
