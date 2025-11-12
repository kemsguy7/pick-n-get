'use client';

import React, { useState, useEffect } from 'react';
import { Check, Loader2, AlertCircle, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAgentSignup } from '../../../../contexts/AgentSignupContext';
import { useWalletInterface } from '../../../../services/wallets/useWalletInterface';
import { WalletInterface } from '../../../../services/wallets/walletInterface';
import Image from 'next/image';

import {
  registerRider,
  validateRiderData,
  RiderData,
  VehicleType,
} from '../../../../services/riderService';
import AppLayout from '../../../../components/layout/AppLayout';
import { uploadToHedera, validateFile } from '../../../../apis/hederaApi';
interface DocumentUploadForm {
  driversLicense: File | null;
  vehicleRegistration: File | null;
  insuranceCertificate: File | null;
  vehiclePhotos: File | null;
  profilePhoto: File | null;
}

interface UploadProgress {
  driversLicense: { uploading: boolean; progress: number; cid?: string; error?: string };
  vehicleRegistration: { uploading: boolean; progress: number; cid?: string; error?: string };
  insuranceCertificate: { uploading: boolean; progress: number; cid?: string; error?: string };
  vehiclePhotos: { uploading: boolean; progress: number; cid?: string; error?: string };
  profilePhoto: { uploading: boolean; progress: number; cid?: string; error?: string };
}

// Convert wallet interface data to format expected by riderService
const createWalletData = (
  accountId: string,
  walletInterface: WalletInterface | null,
  network: string = 'testnet',
): [string, WalletInterface | null, string] => {
  return [accountId, walletInterface, network];
};

export default function AgentSignupStep4(): React.JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = useState<DocumentUploadForm>({
    driversLicense: null,
    vehicleRegistration: null,
    insuranceCertificate: null,
    vehiclePhotos: null,
    profilePhoto: null,
  });

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    driversLicense: { uploading: false, progress: 0 },
    vehicleRegistration: { uploading: false, progress: 0 },
    insuranceCertificate: { uploading: false, progress: 0 },
    vehiclePhotos: { uploading: false, progress: 0 },
    profilePhoto: { uploading: false, progress: 0 },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { accountId, walletInterface } = useWalletInterface();

  // Determine connection status
  const isConnected = !!(accountId && walletInterface);

  // Get signup context
  const {
    signupData,
    updateDocumentInfo,
    setCurrentStep,
    markStepCompleted,
    canProceedToStep,
    updateWeb2Status,
    updateRegistrationResult,
  } = useAgentSignup();

  // Set current step when component mounts
  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  // Check if user can access this step
  useEffect(() => {
    if (!canProceedToStep(4)) {
      console.log('Cannot proceed to step 4, redirecting...');
      router.push('/auth/signup/agent/vehicle');
    }
  }, [canProceedToStep, router]);

  // useEffect(() => {
  //   // Test IPFS connection when component mounts
  //   const testConnection = async () => {
  //     try {
  //       const connection = await testPinataConnection();
  //       if (!connection.success) {
  //         console.error('❌ IPFS connection failed:', connection.error);
  //         setError('IPFS service unavailable. Please try again later.');
  //       }
  //     } catch (error) {
  //       console.error('❌ IPFS connection test error:', error);
  //     }
  //   };

  //   testConnection();
  // }, []);

  const handleFileUpload = async (fieldName: keyof DocumentUploadForm, file: File | null) => {
    console.log(`📁 File upload initiated for ${fieldName}:`, file?.name);

    if (!file) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
      setUploadProgress((prev) => ({
        ...prev,
        [fieldName]: { uploading: false, progress: 0 },
      }));

      // Remove from context as well
      updateDocumentInfo({ [fieldName]: undefined });
      return;
    }

    // Validate file before upload
    const validation = await validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    });

    if (!validation.isValid) {
      console.error(`❌ File validation failed for ${fieldName}:`, validation.errors);
      setUploadProgress((prev) => ({
        ...prev,
        [fieldName]: {
          uploading: false,
          progress: 0,
          error: validation.errors?.[0] || 'File validation failed',
        },
      }));
      return;
    }

    // Start upload process
    setFormData((prev) => ({
      ...prev,
      [fieldName]: file,
    }));

    setUploadProgress((prev) => ({
      ...prev,
      [fieldName]: { uploading: true, progress: 10 },
    }));

    try {
      console.log(`🚀 Starting Hedera File Service upload for ${fieldName}...`);

      // Upload to Hedera with progress tracking
      const uploadResult = await uploadToHedera(file, (progress) => {
        setUploadProgress((prev) => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            uploading: true,
            progress: progress,
          },
        }));
      });

      if (uploadResult.success) {
        console.log(`✅ Hedera upload successful for ${fieldName}:`, uploadResult.fileId);
        setUploadProgress((prev) => ({
          ...prev,
          [fieldName]: {
            uploading: false,
            progress: 100,
            cid: uploadResult.fileId, // Store fileId as 'cid' for compatibility
          },
        }));

        // Update context with uploaded file info
        updateDocumentInfo({
          [fieldName]: {
            file,
            cid: uploadResult.fileId!,
            url: `hedera://file/${uploadResult.fileId}`,
          },
        });
      } else {
        console.error(`❌ Hedera upload failed for ${fieldName}:`, uploadResult.error);
        setUploadProgress((prev) => ({
          ...prev,
          [fieldName]: {
            uploading: false,
            progress: 0,
            error: uploadResult.error || 'Upload failed',
          },
        }));
      }
    } catch (error) {
      console.error(`💥 Upload error for ${fieldName}:`, error);
      const ErrorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadProgress((prev) => ({
        ...prev,
        [fieldName]: {
          uploading: false,
          progress: 0,
          error: ErrorMessage,
        },
      }));
    }
  };
  const removeFile = (fieldName: keyof DocumentUploadForm) => {
    console.log(`🗑️ Removing file for ${fieldName}`);
    setFormData((prev) => ({
      ...prev,
      [fieldName]: null,
    }));
    setUploadProgress((prev) => ({
      ...prev,
      [fieldName]: { uploading: false, progress: 0 },
    }));
  };

  const validateRequiredDocuments = (): string | null => {
    const required = [
      'driversLicense',
      'vehicleRegistration',
      'vehiclePhotos',
      'profilePhoto',
    ] as const;

    for (const field of required) {
      // Check both current upload progress and context data
      const hasCID = uploadProgress[field].cid || signupData.documentInfo?.[field]?.cid;

      if (!hasCID) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        return `${fieldName} is required`;
      }
    }

    return null;
  };

  // Add this helper function above your component
  const getVehicleType = (vehicleType: string): VehicleType => {
    console.log('🔧 Converting vehicle type:', vehicleType);

    // Convert to lowercase for consistent matching
    const normalizedType = vehicleType.toLowerCase().trim();

    // Map form values to VehicleType enum
    const typeMap: { [key: string]: VehicleType } = {
      bike: VehicleType.Bike, // 0
      car: VehicleType.Car, // 1
      truck: VehicleType.Truck, // 2
      van: VehicleType.Van, // 3
    };

    const mappedType = typeMap[normalizedType];

    if (mappedType === undefined) {
      console.error('❌ Invalid vehicle type:', vehicleType);
      console.log('📋 Available vehicle types:', Object.keys(typeMap));
      throw new Error(
        `Invalid vehicle type: ${vehicleType}. Must be one of: ${Object.keys(typeMap).join(', ')}`,
      );
    }

    console.log('✅ Vehicle type mapped to:', mappedType, `(${VehicleType[mappedType]})`);
    return mappedType;
  };

  const handleCreateAccount = async () => {
    console.log('🎯 Starting account creation process...');

    setIsLoading(true);
    setError('');
    setSuccess('');
    setLoadingMessage('Validating documents...');

    try {
      if (!isConnected || !accountId) {
        throw new Error('Wallet not connected');
      }

      // Validate required documents
      const documentError = validateRequiredDocuments();
      if (documentError) {
        throw new Error(documentError);
      }

      setLoadingMessage('Preparing rider registration data...');

      // Get form data from context
      const { personalInfo, vehicleInfo, documentInfo } = signupData;

      // Debug output
      console.log('🚗 Vehicle Info from context:', vehicleInfo);
      console.log('📄 Document Info from context:', documentInfo);
      console.log('👤 Personal Info from context:', personalInfo);

      // Validate all required data is present
      if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.phoneNumber) {
        throw new Error('Personal information is incomplete');
      }

      if (!vehicleInfo.vehiclePlateNumber || !vehicleInfo.vehicleMakeModel) {
        throw new Error('Vehicle information is incomplete');
      }

      if (!documentInfo.vehiclePhotos?.cid || !documentInfo.vehicleRegistration?.cid) {
        throw new Error('Required documents are missing');
      }

      if (!documentInfo.profilePhoto?.cid) {
        throw new Error('Profile photo is required');
      }

      // Map vehicle type safely
      const mappedVehicleType = getVehicleType(vehicleInfo.vehicleType);

      // Prepare rider data for blockchain registration
      const riderData: RiderData = {
        name: `${personalInfo.firstName} ${personalInfo.lastName}`,
        phoneNumber: personalInfo.phoneNumber, // Now string, no conversion needed
        vehicleNumber: vehicleInfo.vehiclePlateNumber,
        homeAddress: personalInfo.homeAddress,
        country: personalInfo.country,
        capacity: parseInt(vehicleInfo.carryingCapacity) || 10,
        vehicleImage: documentInfo.vehiclePhotos.cid,
        vehicleRegistration: documentInfo.vehicleRegistration.cid,
        vehicleType: mappedVehicleType,

        // Profile picture and additional documents
        profilePicture: documentInfo.profilePhoto.cid,
        driversLicense: documentInfo.driversLicense?.cid,
        insuranceCertificate: documentInfo.insuranceCertificate?.cid,

        // Additional vehicle details for Web2
        vehicleMakeModel: vehicleInfo.vehicleMakeModel,
        vehiclePlateNumber: vehicleInfo.vehiclePlateNumber,
        vehicleColor: vehicleInfo.vehicleColor,
      };

      console.log('📋 Rider data prepared:', {
        name: riderData.name,
        phoneNumber: riderData.phoneNumber,
        vehicleNumber: riderData.vehicleNumber,
        vehicleType: riderData.vehicleType,
        vehicleTypeName: VehicleType[riderData.vehicleType],
        capacity: riderData.capacity,
        vehicleImageCID: riderData.vehicleImage,
        vehicleRegistrationCID: riderData.vehicleRegistration,
        profilePictureCID: riderData.profilePicture,
        driversLicenseCID: riderData.driversLicense || 'Not provided',
        insuranceCertificateCID: riderData.insuranceCertificate || 'Not provided',
      });

      // Validate rider data
      const validation = validateRiderData(riderData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      setLoadingMessage('Submitting registration to Hedera DLT...');

      // Register rider on blockchain
      const walletData = createWalletData(accountId, walletInterface);
      const result = await registerRider(walletData, riderData);

      if (result.success) {
        console.log('Rider registration successful!');

        // Update registration result in context
        updateRegistrationResult(result.txHash || '', result.riderId);

        // Update Web2 sync status in context
        updateWeb2Status(result.web2Saved || false, result.web2Error);

        // Check if Web2 backend save was successful
        if (result.web2Saved) {
          console.log('✅ Data saved to backend database');
        } else if (result.web2Error) {
          console.warn('⚠️ Backend save failed:', result.web2Error);
          // Don't fail the entire registration, just warn the user
        }

        // Mark step as completed
        markStepCompleted(4);

        setLoadingMessage('');

        let successMessage = `Registration successful! Your rider ID is: ${result.riderId}. Transaction: ${result.txHash}`;

        if (result.web2Error) {
          successMessage += ` Note: Data was saved to Hedera DLT  but backend sync failed. Please contact support.`;
        }

        setSuccess(successMessage);

        setTimeout(() => {
          router.push('/auth/signup/success');
        }, 4000);
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('💥 Account creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Account creation failed';
      setLoadingMessage('');
      setError(errorMessage);
    } finally {
      if (!success) {
        setIsLoading(false);
      }
    }
  };
  const handleBack = () => {
    router.back();
  };

  const FileUploadField = ({
    label,
    fieldName,
    required = false,
    file,
    progress,
    description,
  }: {
    label: string;
    fieldName: keyof DocumentUploadForm;
    required?: boolean;
    file: File | null;
    progress: UploadProgress[keyof UploadProgress];
    description?: string;
  }) => (
    <div>
      <label className="font-inter mb-2 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="font-inter mb-2 text-xs text-gray-500">{description}</p>}

      <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-gray-400">
        <input
          type="file"
          id={fieldName}
          accept="image/*,.pdf"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null;
            handleFileUpload(fieldName, selectedFile);
          }}
          className="hidden"
          disabled={progress.uploading || isLoading}
        />

        {progress.uploading ? (
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            </div>
            <p className="font-inter text-sm font-medium text-blue-600">Uploading...</p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              ></div>
            </div>
            <p className="font-inter mt-1 text-xs text-gray-500">{progress.progress}%</p>
          </div>
        ) : progress.cid ? (
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Check className="h-4 w-4 text-green-500" />
            </div>
            <p className="font-inter text-sm font-medium text-green-600">{file?.name}</p>
            <p className="font-inter text-xs text-gray-500">
              Uploaded to Hedera File System Succesfully{' '}
            </p>
            <p className="mt-1 font-mono text-xs break-all text-green-500">
              {progress.cid.substring(0, 20)}...
            </p>
            <button
              onClick={() => removeFile(fieldName)}
              className="mx-auto mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
              disabled={isLoading}
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>
        ) : progress.error ? (
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <p className="font-inter text-sm font-medium text-red-600">Upload Failed</p>
            <p className="font-inter text-xs text-red-500">{progress.error}</p>
            <label
              htmlFor={fieldName}
              className="font-inter mt-2 inline-block cursor-pointer rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              Try Again
            </label>
          </div>
        ) : (
          <label htmlFor={fieldName} className="block cursor-pointer">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <Upload className="h-4 w-4 text-gray-400" />
              </div>
              <button className="font-inter rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                Choose File
              </button>
              <p className="font-inter mt-1 text-xs text-gray-500">
                {file ? file.name : 'No file chosen'}
              </p>
              <p className="font-inter mt-1 text-xs text-gray-400">Max 10MB • JPG, PNG, PDF</p>
            </div>
          </label>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout showHeader={true} showFooter={false} showSidebar={false}>
      <div className="body-gradient flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
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
                <span className="font-inter text-sm text-gray-500">Step 4 of 4</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-full rounded-full bg-green-500"></div>
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

            {/* Document Upload Content */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-space-grotesk mb-2 text-lg font-semibold text-black">
                  Upload Documents
                </h3>
                <p className="font-inter text-sm text-gray-600">
                  Provide valid documents to become a verified agent. Files will be securely stored
                  on HFS.
                </p>
              </div>

              <div className="space-y-4">
                <FileUploadField
                  label="Driver's License"
                  fieldName="driversLicense"
                  required={true}
                  file={formData.driversLicense}
                  progress={uploadProgress.driversLicense}
                  description="Clear photo of your valid driver's license"
                />

                <FileUploadField
                  label="Vehicle Registration Certificate"
                  fieldName="vehicleRegistration"
                  required={true}
                  file={formData.vehicleRegistration}
                  progress={uploadProgress.vehicleRegistration}
                  description="Official vehicle registration document"
                />

                <FileUploadField
                  label="Insurance Certificate"
                  fieldName="insuranceCertificate"
                  file={formData.insuranceCertificate}
                  progress={uploadProgress.insuranceCertificate}
                  description="Optional for bikes, required for cars/trucks"
                />

                <FileUploadField
                  label="Vehicle Photos"
                  fieldName="vehiclePhotos"
                  required={true}
                  file={formData.vehiclePhotos}
                  progress={uploadProgress.vehiclePhotos}
                  description="Clear photos showing front, back, and side views"
                />

                <FileUploadField
                  label="Profile Photo"
                  fieldName="profilePhoto"
                  required={true}
                  file={formData.profilePhoto}
                  progress={uploadProgress.profilePhoto}
                  description="Professional headshot for your agent profile"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleCreateAccount}
                disabled={isLoading || !isConnected || !!validateRequiredDocuments()}
                className="font-space-grotesk flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:bg-gray-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {loadingMessage || 'Creating Account...'}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Create Account
                  </>
                )}
              </button>

              <button
                onClick={handleBack}
                disabled={isLoading}
                className="font-space-grotesk w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:bg-gray-100"
              >
                ← Back
              </button>
            </div>

            {/* Upload Status Summary */}
            {Object.values(uploadProgress).some((p) => p.cid || p.error) && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <p className="mb-2 text-sm font-medium text-gray-700">Upload Status:</p>
                <div className="space-y-1 text-xs">
                  {Object.entries(uploadProgress).map(([key, progress]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <span
                        className={
                          progress.cid
                            ? 'text-green-600'
                            : progress.error
                              ? 'text-red-600'
                              : 'text-gray-500'
                        }
                      >
                        {progress.cid ? '✓ Uploaded' : progress.error ? '✗ Failed' : '○ Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
