import { VehicleType, RiderStatus, ApprovalStatus } from '../interface/deliveryInterface';
export const validateRiderRegistrationData = (data: any) => {
  const errors: string[] = [];

  // Required fields validation
  if (!data.id || typeof data.id !== 'number') {
    errors.push('Valid rider ID is required');
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Valid name is required (minimum 2 characters)');
  }

  if (!data.phoneNumber || typeof data.phoneNumber !== 'string') {
    errors.push('Valid phone number is required');
  }

  if (!data.vehicleNumber || typeof data.vehicleNumber !== 'string') {
    errors.push('Valid vehicle number is required');
  }

  if (
    !data.homeAddress ||
    typeof data.homeAddress !== 'string' ||
    data.homeAddress.trim().length < 10
  ) {
    errors.push('Valid home address is required (minimum 10 characters)');
  }

  if (!data.vehicleType || !Object.values(VehicleType).includes(data.vehicleType)) {
    errors.push('Valid vehicle type is required (Bike, Car, Truck, Van)');
  }

  if (!data.country || typeof data.country !== 'string') {
    errors.push('Valid country is required');
  }

  if (!data.capacity || typeof data.capacity !== 'number' || data.capacity <= 0) {
    errors.push('Valid capacity is required (positive number)');
  }

  // Document validation
  if (!data.vehicleRegistration || typeof data.vehicleRegistration !== 'string') {
    errors.push('Vehicle registration document (IPFS CID) is required');
  }

  if (!data.vehiclePhotos || typeof data.vehiclePhotos !== 'string') {
    errors.push('Vehicle photos (IPFS CID) are required');
  }

  // Optional wallet address validation
  if (data.walletAddress && typeof data.walletAddress !== 'string') {
    errors.push('Invalid wallet address format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateIPFSCID = (cid: string): boolean => {
  // Basic IPFS CID validation (CIDv0 or CIDv1)
  const cidV0Pattern = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidV1Pattern = /^b[A-Za-z2-7]{58}$/;

  return cidV0Pattern.test(cid) || cidV1Pattern.test(cid);
};

export const sanitizeRiderData = (data: any) => {
  return {
    id: Number(data.id),
    name: String(data.name).trim(),
    phoneNumber: String(data.phoneNumber).trim(),
    vehicleNumber: String(data.vehicleNumber).trim().toUpperCase(),
    homeAddress: String(data.homeAddress).trim(),
    walletAddress: data.walletAddress ? String(data.walletAddress).trim() : undefined,
    vehicleType: data.vehicleType,
    country: String(data.country).trim(),
    capacity: Number(data.capacity),

    vehicleMakeModel: data.vehicleMakeModel ? String(data.vehicleMakeModel).trim() : undefined,
    vehiclePlateNumber: data.vehiclePlateNumber
      ? String(data.vehiclePlateNumber).trim().toUpperCase()
      : undefined,
    vehicleColor: data.vehicleColor ? String(data.vehicleColor).trim() : undefined,

    profileImage: data.profileImage ? String(data.profileImage).trim() : undefined,
    driversLicense: data.driversLicense ? String(data.driversLicense).trim() : undefined,
    vehicleRegistration: String(data.vehicleRegistration).trim(),
    insuranceCertificate: data.insuranceCertificate
      ? String(data.insuranceCertificate).trim()
      : undefined,
    vehiclePhotos: String(data.vehiclePhotos).trim(),

    riderStatus: data.riderStatus || RiderStatus.Available,
    approvalStatus: data.approvalStatus || ApprovalStatus.Pending,
  };
};
