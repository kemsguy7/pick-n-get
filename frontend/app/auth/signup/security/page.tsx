'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

export default function SecurityPage() {
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [newsletterChecked, setNewsletterChecked] = useState(false);

  return (
    <div className="body-gradient flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500">
            <div className="h-8 w-8 rounded-lg bg-white"></div>
          </div>
          <h1 className="font-space-grotesk text-2xl font-bold text-white">Join Pick-n-Get</h1>
          <p className="font-inter text-gray-300">Start your sustainable journey today</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white p-6">
          {/* Progress Header */}
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-space-grotesk text-xl font-bold text-black">Create Account</h2>
              <span className="font-inter text-sm text-gray-500">Step 3 of 3</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 w-full rounded-full bg-green-500"></div>
            </div>
          </div>

          {/* Security & Preferences */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-space-grotesk mb-2 text-lg font-semibold text-black">
                Security & Preferences
              </h3>
              <p className="font-inter text-sm text-gray-600">
                Secure your account and set preferences
              </p>
            </div>

            <div className="space-y-4">
              {/* Terms Agreement */}
              <label className="flex cursor-pointer items-start gap-3">
                <div
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    agreementChecked
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setAgreementChecked(!agreementChecked)}
                >
                  {agreementChecked && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="font-inter text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-green-500 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-green-500 hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>

              {/* Newsletter Subscription */}
              <label className="flex cursor-pointer items-start gap-3">
                <div
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    newsletterChecked
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setNewsletterChecked(!newsletterChecked)}
                >
                  {newsletterChecked && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="font-inter text-sm text-gray-700">
                  Subscribe to our newsletter for eco-tips and platform updates
                </span>
              </label>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-4">
              <button className="font-space-grotesk flex-1 rounded-xl bg-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300">
                Back
              </button>
              <button
                className={`font-space-grotesk flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors ${
                  agreementChecked
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }`}
                disabled={!agreementChecked}
              >
                ✓ Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
