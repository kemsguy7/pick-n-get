'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';

interface RegistrationResult {
  txHash?: string;
  riderId?: number;
  web2Saved?: boolean;
  web2Error?: string;
  timestamp?: string;
}

export default function RegistrationSuccessPage() {
  const router = useRouter();
  const [registrationData, setRegistrationData] = useState<RegistrationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  useEffect(() => {
    // Get registration data from sessionStorage (set by AgentSignupContext)
    const savedData = sessionStorage.getItem('registrationResult');

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as RegistrationResult;
        console.log('Loaded registration result from sessionStorage:', parsedData);
        setRegistrationData(parsedData);
      } catch (error) {
        console.error('Failed to parse registration data:', error);
      }
    } else {
      console.warn('No registration data found in sessionStorage');
    }

    // Detect network from environment or default to testnet
    const envNetwork = process.env.NEXT_PUBLIC_HEDERA_NETWORK as 'testnet' | 'mainnet' | undefined;
    if (envNetwork) {
      setNetwork(envNetwork);
    }

    // Countdown timer for auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/agents');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleCopyTxHash = async () => {
    if (registrationData?.txHash) {
      try {
        await navigator.clipboard.writeText(registrationData.txHash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const getHashScanUrl = (txHash: string) => {
    const baseUrl =
      network === 'mainnet' ? 'https://hashscan.io/mainnet' : 'https://hashscan.io/testnet';
    return `${baseUrl}/transaction/${txHash}`;
  };

  // If no registration data, show a fallback message
  if (!registrationData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-yellow-50 via-white to-orange-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
          <h2 className="mb-4 text-2xl font-bold text-gray-900">No Registration Data Found</h2>
          <p className="mb-6 text-gray-600">
            We couldn't find your registration information. This page should only be accessed after
            completing registration.
          </p>
          <button
            onClick={() => router.push('/auth/signup/agent')}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Success Card */}
        <div className="rounded-2xl bg-white p-8 text-center shadow-xl md:p-12">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Registration Successful! 🎉
          </h1>

          <p className="mb-8 text-lg text-gray-600">
            Your rider registration has been submitted successfully on the Hedera DLT.
          </p>

          {/* Transaction Details */}
          {registrationData.txHash && (
            <div className="mb-6 rounded-xl border-2 border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-700 uppercase">
                Blockchain Transaction
              </h3>

              {/* Transaction Hash */}
              <div className="mb-4 rounded-lg bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Transaction Hash:</span>
                  <button
                    onClick={handleCopyTxHash}
                    className="flex items-center gap-1 text-xs text-blue-600 transition-colors hover:text-blue-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <code className="block font-mono text-xs break-all text-gray-800 md:text-sm">
                  {registrationData.txHash}
                </code>
              </div>

              {/* View on HashScan Button */}
              <a
                href={getHashScanUrl(registrationData.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 hover:shadow-md"
              >
                <ExternalLink className="h-4 w-4" />
                View on HashScan
              </a>

              {/* Network Badge */}
              <div className="mt-3">
                <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                  {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
                </span>
              </div>
            </div>
          )}

          {/* Rider ID */}
          {registrationData.riderId && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="mb-1 text-sm text-gray-600">Your Rider ID</p>
              <p className="text-2xl font-bold text-blue-600">#{registrationData.riderId}</p>
            </div>
          )}

          {/* Backend Sync Status */}
          <div className="mb-8 space-y-3">
            {/* Blockchain Status - Always Success if we have txHash */}
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
              <span className="text-sm font-medium text-gray-700">Blockchain Registration</span>
              <span className="flex items-center gap-2 font-semibold text-green-600">
                <CheckCircle className="h-5 w-5" />
                Success
              </span>
            </div>

            {/* Database Sync Status */}
            <div
              className={`flex items-center justify-between rounded-lg border p-4 ${
                registrationData.web2Saved
                  ? 'border-green-200 bg-green-50'
                  : registrationData.web2Error
                    ? 'border-red-200 bg-red-50'
                    : 'border-yellow-200 bg-yellow-50'
              }`}
            >
              <span className="text-sm font-medium text-gray-700">Database Sync</span>
              <span
                className={`flex items-center gap-2 font-semibold ${
                  registrationData.web2Saved
                    ? 'text-green-600'
                    : registrationData.web2Error
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }`}
              >
                {registrationData.web2Saved ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Synced
                  </>
                ) : registrationData.web2Error ? (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    Failed
                  </>
                ) : (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
                    Processing
                  </>
                )}
              </span>
            </div>

            {/* Show error message if web2 save failed */}
            {registrationData.web2Error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-left">
                <p className="mb-1 text-xs font-medium text-red-800">Database Error:</p>
                <p className="text-sm text-red-600">{registrationData.web2Error}</p>
                <p className="mt-2 text-xs text-gray-600">
                  Don't worry! Your blockchain registration is successful. Contact support with your
                  transaction hash if needed.
                </p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-6 text-left">
            <h4 className="mb-2 font-semibold text-gray-900">📋 What's Next?</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">✓</span>
                <span>Your application is under review</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-600">⏰</span>
                <span>Admin approval typically takes 24-48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-purple-600">📧</span>
                <span>You'll receive a notification once approved</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">🚀</span>
                <span>After approval, you can start accepting deliveries</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => router.push('/agents')}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 hover:shadow-md"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
            >
              Back to Home
            </button>
          </div>

          {/* Auto-redirect notice */}
          <p className="mt-6 text-sm text-gray-500">
            Redirecting to dashboard in{' '}
            <span className="font-semibold text-gray-700">{countdown}</span> seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
