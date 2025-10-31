'use client';

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAgentSignup } from '../../../../contexts/AgentSignupContext';
import AppLayout from '../../../../components/layout/AppLayout';

export default function AgentSignupStep3(): React.JSX.Element {
  const router = useRouter();
  const { signupData, updateVehicleInfo, setCurrentStep, markStepCompleted, canProceedToStep } =
    useAgentSignup();

  const [errors, setErrors] = useState<string[]>([]);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [showCapacityDropdown, setShowCapacityDropdown] = useState(false);

  // Set current step when component mounts
  useEffect(() => {
    setCurrentStep(3);
  });

  // Check if user can access this step
  useEffect(() => {
    if (!canProceedToStep(3)) {
      console.log('Cannot proceed to step 3, redirecting...');
      router.push('/auth/signup/agent/personal-info');
    }
  });

  const vehicleTypes = [
    { value: 'bike', label: 'Bike', selected: signupData.vehicleInfo.vehicleType === 'bike' },
    { value: 'car', label: 'Car', selected: signupData.vehicleInfo.vehicleType === 'car' },
    { value: 'van', label: 'Van', selected: signupData.vehicleInfo.vehicleType === 'van' },
    { value: 'truck', label: 'Truck', selected: signupData.vehicleInfo.vehicleType === 'truck' },
  ];

  const capacityOptions = ['5', '10', '20', '50', '100', '200', '500'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Mark field as touched
    setTouchedFields((prev) => new Set([...prev, name]));

    // Update the context
    updateVehicleInfo({ [name]: value });

    // Clear errors when user starts typing
    if (errors.length > 0) {
      validateForm({ ...signupData.vehicleInfo, [name]: value });
    }
  };

  const handleVehicleTypeSelect = (type: 'bike' | 'car' | 'van' | 'truck') => {
    setTouchedFields((prev) => new Set([...prev, 'vehicleType']));
    updateVehicleInfo({ vehicleType: type });
    setShowVehicleDropdown(false);

    // Auto-adjust default capacity based on vehicle type
    const defaultCapacities: Record<typeof type, string> = {
      bike: '10',
      car: '50',
      van: '200',
      truck: '500',
    };

    if (
      !signupData.vehicleInfo.carryingCapacity ||
      signupData.vehicleInfo.carryingCapacity === 'in kg'
    ) {
      updateVehicleInfo({ carryingCapacity: defaultCapacities[type] });
    }
  };

  const handleCapacitySelect = (capacity: string) => {
    setTouchedFields((prev) => new Set([...prev, 'carryingCapacity']));
    updateVehicleInfo({ carryingCapacity: capacity });
    setShowCapacityDropdown(false);
  };

  const validateForm = (data = signupData.vehicleInfo): string[] => {
    const newErrors: string[] = [];

    if (!data.vehicleMakeModel.trim()) newErrors.push('Vehicle make/model is required');
    if (!data.vehiclePlateNumber.trim()) newErrors.push('Vehicle plate number is required');
    if (!data.vehicleColor.trim()) newErrors.push('Vehicle color is required');

    const capacity = parseInt(data.carryingCapacity);
    if (!data.carryingCapacity || isNaN(capacity) || capacity <= 0) {
      newErrors.push('Valid carrying capacity is required');
    }

    // Validate plate number format (basic validation)
    if (data.vehiclePlateNumber && data.vehiclePlateNumber.length < 3) {
      newErrors.push('Vehicle plate number must be at least 3 characters');
    }

    // Validate make/model length
    if (data.vehicleMakeModel && data.vehicleMakeModel.length < 2) {
      newErrors.push('Vehicle make/model must be at least 2 characters');
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleContinue = () => {
    // Mark all fields as touched for validation display
    const allFields = new Set([
      'vehicleMakeModel',
      'vehiclePlateNumber',
      'vehicleColor',
      'carryingCapacity',
    ]);
    setTouchedFields(allFields);

    const validationErrors = validateForm();
    if (validationErrors.length === 0) {
      markStepCompleted(3);
      router.push('/auth/signup/agent/documents');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getFieldError = (fieldName: string): string | null => {
    if (!touchedFields.has(fieldName)) return null;
    return (
      errors.find((error) =>
        error.toLowerCase().includes(fieldName.toLowerCase().replace(/([A-Z])/g, ' $1')),
      ) || null
    );
  };

  const isFormValid = () => {
    const data = signupData.vehicleInfo;

    // Check if all required fields are filled
    const hasRequiredFields =
      data.vehicleMakeModel.trim() &&
      data.vehiclePlateNumber.trim() &&
      data.vehicleColor.trim() &&
      data.carryingCapacity;

    // Check field lengths without calling validateForm
    const isValidLength = data.vehicleMakeModel.length >= 2 && data.vehiclePlateNumber.length >= 3;

    // Check capacity is valid
    const capacity = parseInt(data.carryingCapacity);
    const isValidCapacity = !isNaN(capacity) && capacity > 0;

    return hasRequiredFields && isValidLength && isValidCapacity;
  };

  const getVehicleTypeEmoji = (type: string): string => {
    const emojis: Record<string, string> = {
      bike: '🏍️',
      car: '🚗',
      van: '🚐',
      truck: '🚛',
    };
    return emojis[type] || '🚗';
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
                <span className="font-inter text-sm text-gray-500">Step 3 of 4</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-3/4 rounded-full bg-green-500"></div>
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

            {/* Vehicle Information Content */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-space-grotesk mb-2 text-lg font-semibold text-black">
                  Vehicle Information
                </h3>
                <p className="font-inter text-sm text-gray-600">
                  Help us match the right rides for recycling pickups.
                </p>
              </div>

              <div className="space-y-4">
                {/* Vehicle Type */}
                <div className="relative">
                  <label className="font-inter mb-1 block text-sm font-medium text-gray-700">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
                    className="font-inter flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-black focus:border-transparent focus:ring-2 focus:ring-green-500"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getVehicleTypeEmoji(signupData.vehicleInfo.vehicleType)}
                      </span>
                      <span className="capitalize">{signupData.vehicleInfo.vehicleType}</span>
                    </div>
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

                  {showVehicleDropdown && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg">
                      {vehicleTypes.map((vehicle) => (
                        <div
                          key={vehicle.value}
                          onClick={() =>
                            handleVehicleTypeSelect(
                              vehicle.value as 'bike' | 'car' | 'van' | 'truck',
                            )
                          }
                          className="font-inter flex cursor-pointer items-center justify-between px-3 py-2.5 text-black hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getVehicleTypeEmoji(vehicle.value)}</span>
                            <span>{vehicle.label}</span>
                          </div>
                          {vehicle.selected && <Check className="h-4 w-4 text-green-500" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vehicle Make/Model */}
                <div>
                  <label className="font-inter mb-1 block text-sm font-medium text-gray-700">
                    Vehicle Make/Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicleMakeModel"
                    value={signupData.vehicleInfo.vehicleMakeModel}
                    onChange={handleInputChange}
                    placeholder="e.g., Toyota Corolla, Honda CBR"
                    className={`font-inter w-full rounded-lg border px-3 py-2.5 text-black focus:border-transparent focus:ring-2 focus:ring-green-500 ${
                      getFieldError('vehicleMakeModel')
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('vehicleMakeModel') && (
                    <p className="mt-1 text-xs text-red-500">{getFieldError('vehicleMakeModel')}</p>
                  )}
                </div>

                {/* Vehicle Plate Number */}
                <div>
                  <label className="font-inter mb-1 block text-sm font-medium text-gray-700">
                    Vehicle Plate Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehiclePlateNumber"
                    value={signupData.vehicleInfo.vehiclePlateNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., ABC-123, GH-1234-20"
                    className={`font-inter w-full rounded-lg border px-3 py-2.5 text-black focus:border-transparent focus:ring-2 focus:ring-green-500 ${
                      getFieldError('vehiclePlateNumber')
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('vehiclePlateNumber') && (
                    <p className="mt-1 text-xs text-red-500">
                      {getFieldError('vehiclePlateNumber')}
                    </p>
                  )}
                </div>

                {/* Vehicle Color */}
                <div>
                  <label className="font-inter mb-1 block text-sm font-medium text-gray-700">
                    Vehicle Color <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicleColor"
                    value={signupData.vehicleInfo.vehicleColor}
                    onChange={handleInputChange}
                    placeholder="e.g., Red, Blue, White"
                    className={`font-inter w-full rounded-lg border px-3 py-2.5 text-black focus:border-transparent focus:ring-2 focus:ring-green-500 ${
                      getFieldError('vehicleColor') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('vehicleColor') && (
                    <p className="mt-1 text-xs text-red-500">{getFieldError('vehicleColor')}</p>
                  )}
                </div>

                {/* Carrying Capacity */}
                <div className="relative">
                  <label className="font-inter mb-1 block text-sm font-medium text-gray-700">
                    Carrying Capacity (kg) <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => setShowCapacityDropdown(!showCapacityDropdown)}
                    className="font-inter flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-black focus:border-transparent focus:ring-2 focus:ring-green-500"
                  >
                    <span>{signupData.vehicleInfo.carryingCapacity} kg</span>
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

                  {showCapacityDropdown && (
                    <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                      {capacityOptions.map((capacity) => (
                        <div
                          key={capacity}
                          onClick={() => handleCapacitySelect(capacity)}
                          className="font-inter flex cursor-pointer items-center justify-between px-3 py-2.5 text-black hover:bg-gray-50"
                        >
                          <span>{capacity} kg</span>
                          {signupData.vehicleInfo.carryingCapacity === capacity && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="mt-1 text-xs text-gray-500">
                    Maximum weight your vehicle can safely carry for recycling pickups
                  </p>
                </div>
              </div>

              {/* Vehicle Type Information */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <h4 className="mb-1 text-sm font-medium text-blue-800">
                  Vehicle Type Information:
                </h4>
                <div className="space-y-1 text-xs text-blue-700">
                  <p>
                    <strong>Bike:</strong> Ideal for small recyclables, documents pickup
                  </p>
                  <p>
                    <strong>Car:</strong> Perfect for medium-sized waste collection
                  </p>
                  <p>
                    <strong>Van:</strong> Great for bulk recyclables and multiple pickups
                  </p>
                  <p>
                    <strong>Truck:</strong> Best for large-scale waste collection
                  </p>
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
                Upload Documents →
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
                <span>Vehicle Info Progress</span>
                <span>
                  {Math.round(
                    (Object.values(signupData.vehicleInfo).filter((val) => val && val.trim())
                      .length /
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
                    width: `${(Object.values(signupData.vehicleInfo).filter((val) => val && val.trim()).length / 5) * 100}%`,
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
