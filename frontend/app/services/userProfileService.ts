const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface UserProfile {
  userId: number;
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  country?: string;
  profileImage?: string;
}

export interface UpdateProfileData {
  userId: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  country?: string;
  profileImage?: string;
}

/**
 * Get user profile by user ID
 */
export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  try {
    const response = await fetch(`${baseUrl}/users/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData: UpdateProfileData): Promise<UserProfile> => {
  try {
    const response = await fetch(`${baseUrl}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Save user phone number (for pickup creation)
 */
export const saveUserPhoneNumber = async (userId: number, phoneNumber: string): Promise<void> => {
  try {
    await updateUserProfile({
      userId,
      phoneNumber,
    });
  } catch (error) {
    console.error('Error saving phone number:', error);
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  saveUserPhoneNumber,
};
