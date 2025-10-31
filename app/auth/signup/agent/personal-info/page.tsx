'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, AlertCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAgentSignup } from '../../../../contexts/AgentSignupContext';
import AppLayout from '../../../../components/layout/AppLayout';

export default function AgentSignupStep2(): React.JSX.Element {
  const router = useRouter();
  const { signupData, updatePersonalInfo, setCurrentStep, markStepCompleted, canProceedToStep } =
    useAgentSignup();

  console.log('🔄 Component re-render - Personal Info Page');
  console.log('📊 Current signup data:', signupData);

  const [errors, setErrors] = useState<string[]>([]);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Set current step when component mounts
  useEffect(() => {
    setCurrentStep(2);
  }); // Empty dependency array

  // Check if user can access this step
  useEffect(() => {
    if (!canProceedToStep(2)) {
      console.log('Cannot proceed to step 2, redirecting to step 1');
      router.push('/auth/signup/agent');
    }
  }); // Empty dependency array - only check once on mount

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Add this guard to prevent unnecessary updates
    if (signupData.personalInfo[name as keyof typeof signupData.personalInfo] === value) {
      return; // Don't update if value hasn't changed
    }

    console.log(`🔄 Input changed: ${name} = ${value}`);

    // Mark field as touched
    setTouchedFields((prev) => new Set([...prev, name]));

    // Update the context
    updatePersonalInfo({ [name]: value });

    // Clear errors when user starts typing
    if (errors.length > 0) {
      validateForm({ ...signupData.personalInfo, [name]: value });
    }
  };

  const validateForm = (data = signupData.personalInfo): string[] => {
    const newErrors: string[] = [];

    if (!data.firstName.trim()) newErrors.push('First name is required');
    if (!data.lastName.trim()) newErrors.push('Last name is required');
    if (!data.phoneNumber.trim()) newErrors.push('Phone number is required');
    if (!data.homeAddress.trim()) newErrors.push('Home address is required');

    // Validate phone number range )

    if (data.phoneNumber && data.phoneNumber.trim().length < 4) {
      newErrors.push('Phone number must be at least 4 characters');
    }
    // Validate name lengths
    if (data.firstName && data.firstName.length < 2) {
      newErrors.push('First name must be at least 2 characters');
    }
    if (data.lastName && data.lastName.length < 2) {
      newErrors.push('Last name must be at least 2 characters');
    }

    // Validate address length
    if (data.homeAddress && data.homeAddress.length < 10) {
      newErrors.push('Home address must be at least 10 characters');
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleContinue = () => {
    // Mark all fields as touched for validation display
    const allFields = new Set(['firstName', 'lastName', 'phoneNumber', 'homeAddress']);
    setTouchedFields(allFields);

    const validationErrors = validateForm();
    if (validationErrors.length === 0) {
      markStepCompleted(2);
      router.push('/auth/signup/agent/vehicle');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getFieldError = (fieldName: string): string | null => {
    if (!touchedFields.has(fieldName)) return null;
    return errors.find((error) => error.toLowerCase().includes(fieldName.toLowerCase())) || null;
  };

  const isFormValid = () => {
    const data = signupData.personalInfo;

    // Check if all required fields are filled
    const hasRequiredFields =
      data.firstName.trim() &&
      data.lastName.trim() &&
      data.phoneNumber.trim() &&
      data.homeAddress.trim();

    // Fix the phone number validation logic
    const phoneNum = data.phoneNumber;
    const isValidPhone = data.phoneNumber.trim() && phoneNum.length >= 4;

    // Check minimum lengths
    const isValidLength =
      data.firstName.length >= 2 && data.lastName.length >= 2 && data.homeAddress.length >= 10;

    return hasRequiredFields && isValidPhone && isValidLength;
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
                <div className="h-2 w-2/4 rounded-full bg-green-500"></div>
              </div>
            </div>

            {/* Error Display */}
            {errors.length > 0 && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    Please fix the following errors:
                  </span>
                </div>
                <ul className="space-y-1 text-sm text-red-600">
                  {errors.map((error, index) => (
                    <li key={index} className="text-xs">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Wallet Status */}
            {signupData.walletConnected && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-wrap text-green-700">
                  Wallet connected: {signupData.walletAddress?.substring(0, 6)}...
                  {signupData.walletAddress?.substring(-4)}
                </span>
              </div>
            )}

            {/* Personal Information Content */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-space-grotesk mb-2 text-lg font-semibold text-black">
                  Personal Information
                </h3>
                <p className="font-inter text-sm text-gray-600">
                  Tell us about yourself to complete your agent profile
                </p>
              </div>

              <div className="space-y-4">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-inter mb-1 block text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={signupData.personalInfo.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className={`font-inter w-full rounded-lg border px-3 py-2.5 focus:border-transparent focus:ring-2 focus:ring-green-500 ${
                        getFieldError('firstName') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {getFieldError('firstName') && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError('firstName')}</p>
                    )}
                  </div>
                  <div>
                    <label className="font-inter mb-1 block text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={signupData.personalInfo.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className={`font-inter w-full rounded-lg border px-3 py-2.5 focus:border-transparent focus:ring-2 focus:ring-green-500 ${
                        getFieldError('lastName') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {getFieldError('lastName') && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError('lastName')}</p>
                    )}
                  </div>
                </div>

                {/* User ID Number (Phone Number for blockchain) */}
                <div>
                  <label className="font-inter mb-1 block text-sm font-medium text-black">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="number"
                      name="phoneNumber"
                      value={signupData.personalInfo.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="123"
                      min="4"
                      className={`font-inter w-full rounded-lg border py-2.5 pr-3 pl-10 text-black focus:border-transparent focus:ring-2 focus:ring-green-500 ${
                        getFieldError('phoneNumber')
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter Your Valid Phone Number. This will be your identification number in the
                    system.
                  </p>
                  {getFieldError('phoneNumber') && (
                    <p className="mt-1 text-xs text-red-500">{getFieldError('phoneNumber')}</p>
                  )}
                </div>

                {/* Home Address */}
                <div>
                  <label className="font-inter mb-1 block text-sm font-medium text-gray-700">
                    Home Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                    <textarea
                      name="homeAddress"
                      value={signupData.personalInfo.homeAddress}
                      onChange={handleInputChange}
                      placeholder="123 Housing Estate, Cape Town"
                      rows={3}
                      className={`font-inter w-full resize-none rounded-lg border py-2.5 pr-3 pl-10 text-black focus:border-transparent focus:ring-2 focus:ring-green-500 ${
                        getFieldError('homeAddress')
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-black">
                    This field must be at least 10 characters long.
                  </p>
                  {getFieldError('homeAddress') && (
                    <p className="mt-1 text-xs text-red-500">{getFieldError('homeAddress')}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="font-inter mb-1 block text-sm font-medium text-gray-700">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="country"
                      value={signupData.personalInfo.country}
                      onChange={handleInputChange}
                      className="font-inter w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 focus:border-transparent focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Ghana">Ghana</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Tanzania">Tanzania</option>
                    </select>
                    <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 transform">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleContinue}
                disabled={!isFormValid()}
                className="font-space-grotesk flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Vehicle Information →
              </button>

              <button
                onClick={handleBack}
                className="font-space-grotesk w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                ← Back
              </button>
            </div>

            {/* Form Progress Indicator */}
            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <div className="mb-1 flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>
                  {Math.round(
                    (Object.values(signupData.personalInfo).filter((val) => val.trim()).length /
                      5) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-gray-200">
                <div
                  className="h-1 rounded-full bg-green-500 transition-all duration-300"
                  style={{
                    width: `${Math.min((Object.values(signupData.personalInfo).filter((val) => val.trim()).length / 5) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
