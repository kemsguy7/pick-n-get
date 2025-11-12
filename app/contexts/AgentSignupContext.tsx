/* eslint-disable react-refresh/only-export-components */
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the form data types
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  homeAddress: string;
  country: string;
  nationalIdNumber: string;
}

export interface VehicleInfo {
  vehicleType: 'bike' | 'car' | 'van' | 'truck';
  vehicleMakeModel: string;
  vehiclePlateNumber: string;
  vehicleColor: string;
  carryingCapacity: string;
}

export interface DocumentInfo {
  driversLicense?: {
    file: File;
    cid: string;
    url: string;
  };
  vehicleRegistration?: {
    file: File;
    cid: string;
    url: string;
  };
  insuranceCertificate?: {
    file: File;
    cid: string;
    url: string;
  };
  vehiclePhotos?: {
    file: File;
    cid: string;
    url: string;
  };
  profilePhoto?: {
    file: File;
    cid: string;
    url: string;
  };
}

export interface AgentSignupData {
  walletConnected: boolean;
  walletAddress?: string;
  walletType?: string;
  personalInfo: PersonalInfo;
  vehicleInfo: VehicleInfo;
  documentInfo: DocumentInfo;
  currentStep: number;
  completedSteps: number[];
  // NEW: Web2 backend sync tracking
  web2Saved?: boolean;
  web2Error?: string;
  blockchainTxHash?: string;
  riderId?: number;
}

// Context type
interface AgentSignupContextType {
  signupData: AgentSignupData;
  updateWalletInfo: (walletAddress: string, walletType: string) => void;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateVehicleInfo: (info: Partial<VehicleInfo>) => void;
  updateDocumentInfo: (info: Partial<DocumentInfo>) => void;
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  resetSignupData: () => void;
  isStepCompleted: (step: number) => boolean;
  canProceedToStep: (step: number) => boolean;
  getFormCompletionPercentage: () => number;
  // NEW: Web2 status tracking
  updateWeb2Status: (saved: boolean, error?: string) => void;
  updateRegistrationResult: (txHash: string, riderId?: number) => void;
  saveRegistrationForSuccessPage: (
    txHash: string,
    riderId?: number,
    web2Saved?: boolean,
    web2Error?: string,
  ) => void;
}

// Default signup data
const defaultSignupData: AgentSignupData = {
  walletConnected: false,
  personalInfo: {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    homeAddress: '',
    country: 'Ghana',
    nationalIdNumber: '',
  },
  vehicleInfo: {
    vehicleType: 'bike',
    vehicleMakeModel: '',
    vehiclePlateNumber: '',
    vehicleColor: '',
    carryingCapacity: '10',
  },
  documentInfo: {},
  currentStep: 1,
  completedSteps: [],
  web2Saved: undefined,
  web2Error: undefined,
  blockchainTxHash: undefined,
  riderId: undefined,
};

// Create context
const AgentSignupContext = createContext<AgentSignupContextType | undefined>(undefined);

// Local storage key
const STORAGE_KEY = 'agent_signup_data';

// Provider component
export function AgentSignupProvider({ children }: { children: ReactNode }) {
  const [signupData, setSignupData] = useState<AgentSignupData>(defaultSignupData);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Loaded signup data from localStorage');
        setSignupData((prev) => ({ ...prev, ...parsedData }));
      }
    } catch (error) {
      console.error('Failed to load signup data from localStorage:', error);
    }
  }, []);

  // Update wallet information
  const updateWalletInfo = (walletAddress: string, walletType: string) => {
    setSignupData((prev) => ({
      ...prev,
      walletConnected: true,
      walletAddress,
      walletType,
    }));
  };

  // Update personal information
  const updatePersonalInfo = (info: Partial<PersonalInfo>) => {
    setSignupData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info },
    }));
  };

  // Update vehicle information
  const updateVehicleInfo = (info: Partial<VehicleInfo>) => {
    setSignupData((prev) => ({
      ...prev,
      vehicleInfo: { ...prev.vehicleInfo, ...info },
    }));
  };

  // Update document information
  const updateDocumentInfo = (info: Partial<DocumentInfo>) => {
    setSignupData((prev) => ({
      ...prev,
      documentInfo: { ...prev.documentInfo, ...info },
    }));
  };

  // Set current step
  const setCurrentStep = (step: number) => {
    if (signupData.currentStep === step) {
      return;
    }

    setSignupData((prev) => ({
      ...prev,
      currentStep: step,
    }));
  };

  // Mark step as completed
  const markStepCompleted = (step: number) => {
    setSignupData((prev) => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, step])],
    }));
  };

  // NEW: Update Web2 backend sync status
  const updateWeb2Status = (saved: boolean, error?: string) => {
    console.log('Updating Web2 sync status:', { saved, error });
    setSignupData((prev) => ({
      ...prev,
      web2Saved: saved,
      web2Error: error,
    }));
  };

  // NEW: Update registration result (txHash and riderId)
  const updateRegistrationResult = (txHash: string, riderId?: number) => {
    console.log('Updating registration result:', { txHash, riderId });
    setSignupData((prev) => ({
      ...prev,
      blockchainTxHash: txHash,
      riderId: riderId,
    }));
  };

  const saveRegistrationForSuccessPage = (
    txHash: string,
    riderId?: number,
    web2Saved?: boolean,
    web2Error?: string,
  ) => {
    console.log('Saving registration result to sessionStorage for success page');

    // Save to sessionStorage so the success page can access it
    if (typeof window !== 'undefined') {
      const successPageData = {
        txHash,
        riderId,
        web2Saved,
        web2Error,
        timestamp: new Date().toISOString(),
      };

      sessionStorage.setItem('registrationResult', JSON.stringify(successPageData));
      console.log('Registration result saved to sessionStorage:', successPageData);
    }

    // Also update the context state
    setSignupData((prev) => ({
      ...prev,
      blockchainTxHash: txHash,
      riderId: riderId,
      web2Saved: web2Saved,
      web2Error: web2Error,
    }));
  };

  // Reset all signup data
  const resetSignupData = () => {
    console.log('Resetting signup data');
    setSignupData(defaultSignupData);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Check if step is completed
  const isStepCompleted = (step: number): boolean => {
    return signupData.completedSteps.includes(step);
  };

  // Check if user can proceed to a specific step
  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return signupData.walletConnected;
      case 3:
        return (
          signupData.walletConnected &&
          signupData.personalInfo.firstName.length > 0 &&
          signupData.personalInfo.lastName.length > 0 &&
          signupData.personalInfo.phoneNumber.length > 4 &&
          signupData.personalInfo.homeAddress.length > 0
        );
      case 4:
        return (
          signupData.walletConnected &&
          signupData.personalInfo.firstName.length > 0 &&
          signupData.vehicleInfo.vehiclePlateNumber.length > 4 &&
          signupData.vehicleInfo.vehicleMakeModel.length > 0
        );
      default:
        return false;
    }
  };

  // Get overall form completion percentage
  const getFormCompletionPercentage = (): number => {
    let completed = 0;
    const total = 4;

    if (signupData.walletConnected) completed++;

    if (
      signupData.personalInfo.firstName &&
      signupData.personalInfo.lastName &&
      signupData.personalInfo.phoneNumber &&
      signupData.personalInfo.homeAddress
    ) {
      completed++;
    }

    if (
      signupData.vehicleInfo.vehiclePlateNumber &&
      signupData.vehicleInfo.vehicleMakeModel &&
      signupData.vehicleInfo.vehicleColor
    ) {
      completed++;
    }

    const requiredDocs = ['driversLicense', 'vehicleRegistration', 'vehiclePhotos', 'profilePhoto'];
    const uploadedDocs = requiredDocs.filter(
      (doc) => signupData.documentInfo[doc as keyof DocumentInfo]?.cid,
    );
    if (uploadedDocs.length === requiredDocs.length) {
      completed++;
    }

    return Math.round((completed / total) * 100);
  };

  const contextValue: AgentSignupContextType = {
    signupData,
    updateWalletInfo,
    updatePersonalInfo,
    updateVehicleInfo,
    updateDocumentInfo,
    setCurrentStep,
    markStepCompleted,
    resetSignupData,
    isStepCompleted,
    canProceedToStep,
    getFormCompletionPercentage,
    updateWeb2Status,
    updateRegistrationResult,
    saveRegistrationForSuccessPage,
  };

  return <AgentSignupContext.Provider value={contextValue}>{children}</AgentSignupContext.Provider>;
}

// Custom hook to use the context
export function useAgentSignup() {
  const context = useContext(AgentSignupContext);
  if (context === undefined) {
    throw new Error('useAgentSignup must be used within an AgentSignupProvider');
  }
  return context;
}

export default AgentSignupContext;
