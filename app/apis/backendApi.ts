const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';

export interface CheckWalletResponse {
  status: string;
  data: {
    walletAddress: string;
    roles: string[];
    primaryRole: string;
    userData?: {
      userId: number;
      name: string;
      profileImage?: string;
    };
    riderData?: {
      riderId: number;
      approvalStatus: string;
      riderStatus: string;
    };
  };
}

export interface SaveUserResponse {
  status: string;
  message: string;
  data: {
    userId: number;
    walletAddress: string;
    roles: string[];
  };
}

/**
 * Check wallet roles from backend
 */
export const checkWalletRoles = async (walletAddress: string): Promise<CheckWalletResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/check-wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      throw new Error('Failed to check wallet roles');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking wallet roles:', error);
    throw error;
  }
};

/**
 * Save user to backend after contract registration
 */
export const saveUserToBackend = async (userData: {
  walletAddress: string;
  name: string;
  phoneNumber: string;
  homeAddress: string;
  profilePicture?: string; // Hedera File ID
}): Promise<SaveUserResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/save-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving user to backend:', error);
    throw error;
  }
};

export default {
  checkWalletRoles,
  saveUserToBackend,
};
