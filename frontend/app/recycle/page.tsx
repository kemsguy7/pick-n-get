'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import StepIndicator from '../components/recycle/step-indicator';
import SelectCategory from '../components/recycle/select-category';
import ItemDetails from '../components/recycle/item-details';
import PickupSchedule from '../components/recycle/pickup-schedule';
import Confirmation from '../components/recycle/confirmation';
// import { MetamaskContext } from "../contexts/MetamaskContext"
// import { WalletConnectContext } from "../contexts/WalletConnectContext"
import { useWalletInterface } from '../services/wallets/useWalletInterface';

export interface RecycleFormData {
  category: { id: string; name: string; rate: number; icon: string; description: string } | null;
  weight: string;
  description: string;
  photos: File[];
  address: string;
  date: string;
  time: string;
  requestId?: string;
  selectedDriver?: string;
  selectedRiderId?: number;
  selectedVehicle?: 'bike' | 'car' | 'truck';
  pickupCoordinates?: { lat: number; lng: number };
}
export default function RecyclePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RecycleFormData>({
    category: null,
    weight: '',
    description: '',
    photos: [],
    address: '',
    date: '',
    time: '',
  });

  // Get wallet connection status
  // const metamaskCtx = useContext(MetamaskContext)
  // const walletConnectCtx = useContext(WalletConnectContext)
  const { accountId, walletInterface } = useWalletInterface();
  const isConnected = !!(accountId && walletInterface);

  const updateFormData = (data: Partial<RecycleFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitForm = () => {
    // Generate a mock request ID (in real app, this might come from backend)
    const requestId = `#REC${Math.floor(Math.random() * 1000000)}`;
    updateFormData({ requestId });
    nextStep();
  };

  // Wallet connection warning
  if (!isConnected) {
    return (
      <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="max-w-md rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 text-center backdrop-blur-sm">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
            <h2 className="font-space-grotesk mb-4 text-2xl font-bold text-white">
              Wallet Connection Required
            </h2>
            <p className="font-inter mb-6 text-gray-300">
              You need to connect your wallet to submit recycling items to the blockchain.
            </p>
            <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <p className="font-inter text-sm text-blue-400">
                Connect your wallet using the header menu to access blockchain recycling features.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="font-inter rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-primary font-space-grotesk mb-4 text-4xl font-bold md:text-5xl">
              Submit Recycling Items ♻️
            </h1>
            <p className="font-inter secondary-text text-lg text-gray-300">
              Turn your waste into rewards while helping the environment
            </p>

            {/* Wallet Status Indicator */}
            <div className="mx-auto mt-4 max-w-md rounded-lg border border-green-500/30 bg-green-500/10 p-3">
              <p className="font-inter text-sm text-green-400">
                ✅ Wallet Connected - Ready to submit to blockchain
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} />

          {/* Step Content */}
          <div className="mt-12 pb-16 md:pb-24">
            {currentStep === 1 && (
              <SelectCategory
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
              />
            )}
            {currentStep === 2 && (
              <ItemDetails
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStep === 3 && (
              <PickupSchedule
                formData={formData}
                updateFormData={updateFormData}
                onSubmit={submitForm}
                onBack={prevStep}
              />
            )}
            {currentStep === 4 && (
              <Confirmation
                formData={formData}
                onReset={() => {
                  setCurrentStep(1);
                  setFormData({
                    category: null,
                    weight: '',
                    description: '',
                    photos: [],
                    address: '',
                    date: '',
                    time: '',
                  });
                }}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
