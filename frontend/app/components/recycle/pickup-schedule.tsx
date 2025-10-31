'use client';

import { useState, useEffect } from 'react';
import type { RecycleFormData } from '../../recycle/page';
import { Truck, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { calculateVehicleType } from '../../utils/vehicleCalculator';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
interface PickupScheduleProps {
  formData: RecycleFormData;
  updateFormData: (data: Partial<RecycleFormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

interface RiderOption {
  riderId: number;
  name: string;
  phoneNumber: string;
  vehicleNumber: string;
  vehicleType: string;
  capacity: number;
  profileImage?: string;
  distance?: number;
  duration?: number;
  eta?: string;
}

export default function PickupSchedule({
  formData,
  updateFormData,
  onSubmit,
  onBack,
}: PickupScheduleProps) {
  const [address, setAddress] = useState(formData.address);
  const [date, setDate] = useState(formData.date);
  const [time, setTime] = useState(formData.time);

  // Rider selection state
  const [availableRiders, setAvailableRiders] = useState<RiderOption[]>([]);
  const [selectedRider, setSelectedRider] = useState<number | null>(null);
  const [isLoadingRiders, setIsLoadingRiders] = useState(false);
  const [ridersError, setRidersError] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  console.log(setTime, setDate);

  // Fetch riders when address is entered
  useEffect(() => {
    if (address && address.length > 10) {
      fetchNearestRiders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const fetchNearestRiders = async () => {
    if (!formData.weight || !formData.category) {
      setRidersError('Please complete item details first');
      return;
    }

    setIsLoadingRiders(true);
    setRidersError('');
    setAvailableRiders([]);
    setSelectedRider(null);

    try {
      const weight = parseFloat(formData.weight);
      const calculatedVehicleType = calculateVehicleType(weight);
      setVehicleType(calculatedVehicleType);

      const response = await fetch(`${baseUrl}/pickups/find-riders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupAddress: address,
          itemWeight: weight,
          country: 'Nigeria', // TODO: Get from user profile or form
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to find riders');
      }

      if (data.data.riders.length === 0) {
        setRidersError('No available riders found in your area.');
        setAvailableRiders([]); //Ensure empty
      } else {
        setAvailableRiders(data.data.riders);
        setRidersError(''); //Clear error on success
      }
    } catch (error) {
      console.error('Error fetching riders:', error);
      setAvailableRiders([]); // ✅ Clear riders on error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setRidersError(errorMessage || 'Failed to load available riders');
    } finally {
      setIsLoadingRiders(false);
    }
  };

  // const handleRiderSelect = (riderId: number) => {
  //   setSelectedRider(riderId);
  //   const rider = availableRiders.find((r) => r.riderId === riderId);
  //   if (rider) {
  //     updateFormData({
  //       selectedDriver: rider.name,
  //       selectedVehicle: rider.vehicleType.toLowerCase() as 'bike' | 'car' | 'truck',
  //     });
  //   }
  // };
  const handleRiderSelect = (riderId: number) => {
    setSelectedRider(riderId);
    const rider = availableRiders.find((r) => r.riderId === riderId);
    if (rider) {
      const updateData = {
        selectedDriver: rider.name,
        selectedRiderId: riderId,
        selectedVehicle: rider.vehicleType.toLowerCase() as 'bike' | 'car' | 'truck',
      };
      console.log('🔍 DEBUG: Calling updateFormData with:', updateData);
      updateFormData(updateData);
    }
  };

  // const handleContinue = () => {
  //   if (!address || !selectedRider) {
  //     alert('Please enter pickup address and select a rider');
  //     return;
  //   }

  //   updateFormData({ address, date, time });
  //   onSubmit();
  // };
  const handleContinue = () => {
    if (!address) {
      alert('Please enter pickup address');
      return;
    }

    if (!selectedRider) {
      alert('Please select a rider');
      return;
    }

    const rider = availableRiders.find((r) => r.riderId === selectedRider);

    if (!rider) {
      console.error('❌ Rider not found in availableRiders');
      alert('Selected rider not found');
      return;
    }

    console.log('🔍 DEBUG: handleContinue - rider ID:', rider.riderId);
    console.log('🔍 DEBUG: Current formData:', formData);

    // Update form data with ALL required fields
    updateFormData({
      address,
      date,
      time,
      selectedDriver: rider.name,
      selectedRiderId: rider.riderId, // ✅ Ensure ID is passed
      selectedVehicle: rider.vehicleType.toLowerCase() as 'bike' | 'car' | 'truck',
    });

    console.log('🔍 DEBUG: After updateFormData, calling onSubmit...');
    onSubmit();
  };

  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bike':
        return '🏍️';
      case 'car':
        return '🚗';
      case 'van':
        return '🚐';
      case 'truck':
        return '🚚';

      default:
        return '🚗';
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-2xl border border-slate-700/50 bg-white/10 p-8 backdrop-blur-sm">
        <div className="mb-6 flex items-center">
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
            <span className="font-inter text-sm font-semibold text-white">3</span>
          </div>
          <h2 className="font-inter text-info text-lg font-medium">Schedule Pickup</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Pickup Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Pickup Address */}
            <div>
              <label className="font-inter mb-2 block font-medium text-white">
                Pickup Address *
              </label>
              <div className="relative">
                <MapPin className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your full address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="font-inter secondary-text w-full rounded-lg border border-white py-3 pr-4 pl-10 text-base font-normal transition-colors focus:border-green-500 focus:outline-none"
                />
              </div>
              <p className="font-inter mt-1 text-xs text-gray-400">
                Be as specific as possible for accurate rider matching
              </p>
            </div>

            {/* Required Vehicle Type Display */}
            {vehicleType && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-400" />
                  <p className="font-inter text-sm text-green-400">
                    Required Vehicle: <span className="font-semibold">{vehicleType}</span> (based on{' '}
                    {formData.weight}kg weight)
                  </p>
                </div>
              </div>
            )}

            {/* Rider Selection */}
            <div>
              <h3 className="font-space-grotesk mb-4 font-semibold text-white">
                Select Your Rider
              </h3>

              {/* Loading State */}
              {isLoadingRiders && (
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-8 text-center">
                  <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-green-400" />
                  <p className="font-inter text-gray-300">Finding nearest available riders...</p>
                </div>
              )}

              {/* Error State */}
              {ridersError && !isLoadingRiders && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                    <div>
                      <p className="font-inter font-medium text-red-400">No Riders Available</p>
                      <p className="font-inter text-sm text-red-300">{ridersError}</p>
                    </div>
                  </div>
                  <button
                    onClick={fetchNearestRiders}
                    className="font-inter mt-4 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Riders List */}
              {!isLoadingRiders && availableRiders.length > 0 && (
                <div className="space-y-4">
                  {availableRiders.map((rider, index) => (
                    <div
                      key={rider.riderId}
                      onClick={() => handleRiderSelect(rider.riderId)}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                        selectedRider === rider.riderId
                          ? 'border-green-500 bg-green-500/20'
                          : 'border-slate-600/50 bg-slate-800/50 hover:border-green-500/50 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Rider Avatar */}
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-xl">
                            {rider.profileImage ? (
                              <img
                                src={`https://ipfs.io/ipfs/${rider.profileImage}`}
                                alt={rider.name}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white">{rider.name.charAt(0)}</span>
                            )}
                          </div>

                          {/* Rider Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-space-grotesk font-semibold text-white">
                                {rider.name}
                              </h4>
                              {index === 0 && (
                                <span className="rounded bg-green-500 px-2 py-0.5 text-xs font-medium text-black">
                                  Closest
                                </span>
                              )}
                            </div>
                            <div className="font-inter mt-1 flex items-center gap-3 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                {getVehicleIcon(rider.vehicleType)} {rider.vehicleType}
                              </span>
                              <span>•</span>
                              <span>{rider.capacity}kg capacity</span>
                              <span>•</span>
                              <span>{rider.vehicleNumber}</span>
                            </div>
                          </div>
                        </div>

                        {/* ETA & Distance */}
                        <div className="text-right">
                          <p className="font-space-grotesk text-lg font-bold text-green-400">
                            {rider.eta || 'N/A'}
                          </p>
                          <p className="font-inter text-xs text-gray-400">
                            {rider.distance ? `${(rider.distance / 1000).toFixed(1)}km away` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Selected Indicator */}
                      {selectedRider === rider.riderId && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-500/10 p-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                            <svg
                              className="h-3 w-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="font-inter text-sm text-green-400">
                            Selected - This rider will be assigned to your pickup
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* No Address Entered */}
              {!address && !isLoadingRiders && (
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 text-center">
                  <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="font-inter text-gray-400">
                    Enter your pickup address above to see available riders
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Pickup Summary */}
            <div className="rounded-xl border border-[#1DE9B633] bg-white/20 p-6 backdrop-blur-md">
              <h3 className="font-space-grotesk mb-4 font-semibold text-green-400">
                Pickup Summary
              </h3>
              <div className="font-inter space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Category:</span>
                  <span className="font-medium text-white">{formData.category?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Weight:</span>
                  <span className="font-medium text-white">{formData.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Vehicle Needed:</span>
                  <span className="font-medium text-white">{vehicleType || 'Calculating...'}</span>
                </div>
                {selectedRider && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Selected Rider:</span>
                    <span className="font-medium text-green-400">
                      {availableRiders.find((r) => r.riderId === selectedRider)?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Estimated Earnings */}
            <div className="rounded-xl border border-[#1DE9B633] bg-white/20 p-6 backdrop-blur-md">
              <h3 className="font-space-grotesk mb-4 font-semibold text-green-400">
                Estimated Earnings
              </h3>
              <div className="text-center">
                <p className="font-space-grotesk text-3xl font-bold text-white">
                  ₦
                  {formData.category && formData.weight
                    ? (parseFloat(formData.weight) * formData.category.rate).toFixed(2)
                    : '0.00'}
                </p>
                <p className="font-inter mt-1 text-sm text-gray-400">
                  Based on current market rates
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={onBack}
            className="font-inter rounded-lg bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!address || !selectedRider}
            className="gradient-button font-inter rounded-xl px-6 py-3 font-semibold text-black transition-all hover:from-yellow-500 hover:to-green-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to Confirmation →
          </button>
        </div>
      </div>
    </div>
  );
}
