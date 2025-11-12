'use client';

import React, { useState, useEffect, useContext, ChangeEvent } from 'react';
import { Check, Loader2, AlertCircle, Wallet, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MetamaskContext } from '../../../contexts/MetamaskContext';
import { WalletConnectContext } from '../../../contexts/WalletConnectContext';
import { useWalletInterface } from '../../../services/wallets/useWalletInterface';
import { registerUser, checkUserRegistration, UserData } from '../../../services/userService';
import { WalletInterface } from '../../../services/wallets/walletInterface';
import { validateFile, uploadToHedera } from '../../../apis/hederaApi';
import { saveUserToBackend } from '../../../apis/backendApi';
import AppLayout from '../../../components/layout/AppLayout';
import Image from 'next/image';

interface UserFormData {
  name: string;
  homeAddress: string;
  phoneNumber: string;
  profilePicture?: File;
}

interface UploadProgress {
  uploading: boolean;
  progress: number;
  fileId: string;
  error: string;
}

const createWalletData = (
  accountId: string,
  walletInterface: WalletInterface | null,
  network: string = 'testnet',
): [string, WalletInterface | null, string] => {
  return [accountId, walletInterface, network];
};

export default function SignupPage(): React.JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const router = useRouter();

  const metamaskCtx = useContext(MetamaskContext);
  const walletConnectCtx = useContext(WalletConnectContext);
  const { accountId, walletInterface } = useWalletInterface();

  const isConnected = !!(accountId && walletInterface);

  const [userForm, setUserForm] = useState<UserFormData>({
    name: '',
    homeAddress: '',
    phoneNumber: '',
    profilePicture: undefined,
  });

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    uploading: false,
    progress: 0,
    fileId: '',
    error: '',
  });

  const checkExistingRegistration = async (): Promise<void> => {
    try {
      if (!accountId || !walletInterface) return;

      const walletData = createWalletData(accountId, walletInterface);
      const result = await checkUserRegistration(walletData);
      if (result.isRegistered) {
        setSuccess('User already registered! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  useEffect(() => {
    if (isConnected && accountId) {
      checkExistingRegistration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, accountId]);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setUserForm((prev) => ({ ...prev, profilePicture: undefined }));
      setUploadProgress({ uploading: false, progress: 0, fileId: '', error: '' });
      return;
    }

    const validation = validateFile(file, {
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    });

    if (!validation.isValid) {
      setUploadProgress({
        uploading: false,
        progress: 0,
        fileId: '',
        error: validation.errors?.[0] || 'Invalid file',
      });
      return;
    }

    setUploadProgress({ uploading: true, progress: 10, fileId: '', error: '' });

    try {
      console.log('📤 Uploading profile picture to Hedera...');

      const uploadResult = await uploadToHedera(file, (progress) => {
        setUploadProgress((prev) => ({
          ...prev,
          progress,
        }));
      });

      if (uploadResult.success) {
        console.log('✅ Upload successful:', uploadResult.fileId);
        setUploadProgress({
          uploading: false,
          progress: 100,
          fileId: uploadResult.fileId!,
          error: '',
        });
        setUserForm((prev) => ({ ...prev, profilePicture: file }));
      } else {
        setUploadProgress({
          uploading: false,
          progress: 0,
          fileId: '',
          error: uploadResult.error || 'Upload failed',
        });
      }
    } catch (error) {
      setUploadProgress({
        uploading: false,
        progress: 0,
        fileId: '',
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  };

  const handleContinue = (): void => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2 && isConnected) {
      setCurrentStep(3);
    } else if (currentStep === 2 && !isConnected) {
      setError('Please connect your wallet to continue');
    }
  };

  const validateForm = (): string | null => {
    if (!userForm.name.trim()) return 'Name is required';
    if (!userForm.homeAddress.trim()) return 'Home address is required';
    if (!userForm.phoneNumber.trim()) return 'Phone number is required';

    if (userForm.phoneNumber.trim().length < 4) {
      return 'Phone number must be at least 4 characters';
    }

    return null;
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    setLoadingMessage('Preparing transaction...');

    try {
      if (!isConnected || !accountId) {
        throw new Error('Wallet not connected');
      }

      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      setLoadingMessage('Checking existing registration...');

      const userData: UserData = {
        name: userForm.name,
        homeAddress: userForm.homeAddress,
        phoneNumber: userForm.phoneNumber,
        profilePicture: uploadProgress.fileId || undefined, // Hedera File ID
      };

      const walletData = createWalletData(accountId, walletInterface);

      // Step 1: Register on smart contract
      setLoadingMessage('Submitting transaction to blockchain...');
      const contractResult = await registerUser(walletData, userData);

      if (!contractResult.success) {
        throw new Error(contractResult.error || 'Contract registration failed');
      }

      console.log('✅ Contract registration successful:', contractResult.txHash);

      // Step 2: Save to backend
      setLoadingMessage('Saving user data to backend...');

      try {
        const backendResult = await saveUserToBackend({
          walletAddress: accountId,
          name: userForm.name,
          phoneNumber: userForm.phoneNumber,
          homeAddress: userForm.homeAddress,
          profilePicture: uploadProgress.fileId || undefined,
        });

        console.log('✅ Backend save successful:', backendResult);
      } catch (backendError) {
        console.warn('⚠️ Backend save failed (non-critical):', backendError);
        // Continue even if backend fails - contract is source of truth
      }

      setLoadingMessage('');
      setSuccess(`Registration successful! Transaction: ${contractResult.txHash}`);

      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred during registration';
      setLoadingMessage('');
      setError(errorMessage);
    } finally {
      if (!success) {
        setIsLoading(false);
      }
    }
  };

  const getWalletStatus = () => {
    if (metamaskCtx.metamaskAccountAddress) {
      return {
        type: 'MetaMask',
        address: metamaskCtx.metamaskAccountAddress,
        connected: true,
      };
    } else if (walletConnectCtx.accountId) {
      return {
        type: 'WalletConnect',
        address: walletConnectCtx.accountId,
        connected: walletConnectCtx.isConnected,
      };
    }
    return {
      type: 'None',
      address: '',
      connected: false,
    };
  };

  const getStepContent = (): React.JSX.Element | null => {
    const walletStatus = getWalletStatus();

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-space-grotesk mb-2 text-lg font-semibold text-black">
                Welcome to Pick'n'Get
              </h3>
              <p className="font-inter text-sm text-gray-600">
                Join our recycling platform to earn rewards by recycling waste materials
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                  <div className="h-6 w-6 rounded bg-white"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-space-grotesk font-semibold text-black">Recycler Account</h4>
                  <p className="font-inter text-sm text-gray-600">
                    Earn ECO tokens by recycling waste materials and contributing to a sustainable
                    future
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500" />
                <span>Earn rewards for recycling</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500" />
                <span>Track your environmental impact</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500" />
                <span>Get pickup services for your recyclables</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-space-grotesk mb-2 text-lg font-semibold text-black">
                Connect Wallet
              </h3>
              <p className="font-inter text-sm text-gray-600">
                Connect your Hedera wallet to continue with registration
              </p>
            </div>

            {!walletStatus.connected ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Wallet className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-inter text-gray-600">No wallet connected</p>
                <div className="font-inter mb-4 text-sm text-gray-500">
                  Please use the wallet connection in the header to connect your wallet, then return
                  to continue registration.
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="font-space-grotesk w-full rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  Refresh Page
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <p className="font-inter text-green-600">Wallet Connected Successfully</p>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-700">
                    Connected via {walletStatus.type}
                  </p>
                  <p className="font-mono text-xs text-gray-500">{walletStatus.address}</p>
                </div>
                <p className="font-inter text-sm text-gray-500">
                  Ready to proceed with registration
                </p>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-space-grotesk mb-2 text-lg font-semibold text-black">
                Your Information
              </h3>
              <p className="font-inter text-sm text-gray-600">
                Please provide your details to complete registration
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={userForm.name}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-transparent focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Home Address</label>
                <textarea
                  name="homeAddress"
                  value={userForm.homeAddress}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-transparent focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your complete home address"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={userForm.phoneNumber}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-transparent focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your phone number"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter a valid phone number (at least 4 characters)
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Profile Picture (Optional)
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                  disabled={uploadProgress.uploading}
                />

                {uploadProgress.uploading ? (
                  <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-4 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                    <p className="mt-2 text-sm text-blue-600">
                      Uploading to Hedera... {uploadProgress.progress}%
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-blue-200">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${uploadProgress.progress}%` }}
                      />
                    </div>
                  </div>
                ) : uploadProgress.fileId ? (
                  <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4 text-center">
                    <Check className="mx-auto h-8 w-8 text-green-500" />
                    <p className="mt-2 text-sm font-medium text-green-600">
                      {userForm.profilePicture?.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Uploaded to Hedera File Service</p>
                    <p className="mt-1 font-mono text-xs break-all text-green-600">
                      File ID: {uploadProgress.fileId}
                    </p>
                    <button
                      onClick={() => {
                        setUserForm((prev) => ({ ...prev, profilePicture: undefined }));
                        setUploadProgress({ uploading: false, progress: 0, fileId: '', error: '' });
                      }}
                      className="mx-auto mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                ) : uploadProgress.error ? (
                  <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
                    <p className="mt-2 text-sm text-red-600">{uploadProgress.error}</p>
                    <label
                      htmlFor="profilePicture"
                      className="mt-2 inline-block cursor-pointer text-xs text-blue-500 hover:underline"
                    >
                      Try Again
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="profilePicture"
                    className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-gray-400"
                  >
                    <div className="rounded-full bg-gray-100 p-3">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-700">Upload Profile Picture</p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB (Optional)</p>
                  </label>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout showHeader={true} showFooter={false} showSidebar={false}>
      <div className="body-gradient flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500">
              <Image src="/PickLogo.png" width={200} height={200} alt="Pick-n-Get Logo" />
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
                <span className="font-inter text-sm text-gray-500">Step {currentStep} of 3</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Success Display */}
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            )}

            {/* Step Content */}
            {getStepContent()}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {currentStep < 3 ? (
                <button
                  onClick={handleContinue}
                  disabled={currentStep === 2 && !isConnected}
                  className="font-space-grotesk flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !isConnected}
                  className="font-space-grotesk flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {loadingMessage || 'Registering on Blockchain...'}
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              )}

              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isLoading}
                  className="font-space-grotesk w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  ← Back
                </button>
              )}
            </div>
          </div>
          {/* Trust Indicators */}
          <div className="mt-8 flex items-center justify-center gap-8 text-center">
            <div className="text-white">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="font-inter text-xs">Blockchain Verified</p>
            </div>
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
              <p className="font-inter text-xs">Secure & Private</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
