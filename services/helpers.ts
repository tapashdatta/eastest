import { Alert } from 'react-native';
import { router } from 'expo-router';
import { wordPressAPI, DonationHistoryItem, DonationStats } from '@/services/WordPressAPI';
import Logger from '@/utils/Logger';
import validation from '@/utils/validation';

export interface ProfileData {
  first_name: string;
  last_name: string;
  nickname: string;
  email: string;
  phone_primary: string;
  street_address: string;
  city: string;
  postal_code: string;
  country: string;
  date_of_birth: string;
}

// Navigation helpers
export const navigateToLogin = () => router.push('/(auth)/login');
export const navigateToRegister = () => router.push('/(auth)/register');
export const navigateBack = () => router.back();

// FIXED: Settings navigation helper with proper export
export const navigateToSettings = () => {
  console.log('🔧 Navigating to app settings...');
  try {
    router.push('/settings');
    console.log('✅ Navigation to settings successful');
  } catch (error) {
    console.error('❌ Navigation error:', error);
    
    // Fallback navigation attempts
    try {
      console.log('🔄 Trying fallback navigation...');
      router.navigate('/settings');
      console.log('✅ Fallback navigation successful');
    } catch (fallbackError) {
      console.error('❌ Fallback navigation also failed:', fallbackError);
      
      // Show user-friendly error
      Alert.alert(
        'Navigation Error', 
        'Unable to open settings. Please try again.',
        [
          { 
            text: 'OK', 
            onPress: () => console.log('User acknowledged navigation error') 
          }
        ]
      );
    }
  }
};

// Logout confirmation
export const handleLogoutConfirmation = async (
  isAuthenticated: boolean,
  user: any,
  logout: () => Promise<void>
) => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        onPress: async () => {
          try {
            await logout();
            router.replace('/(auth)/welcome');
          } catch (error) {
            Logger.error('Logout error', error);
            router.replace('/(auth)/welcome');
          }
        }
      },
    ]
  );
};

// Profile validation
export const validateProfile = (profile: ProfileData): string | null => {
  const firstNameResult = validation.name(profile.first_name, 'First name');
  if (!firstNameResult.isValid) {
    return firstNameResult.message || 'First name is invalid';
  }

  if (profile.last_name && profile.last_name.trim()) {
    const lastNameResult = validation.name(profile.last_name, 'Last name');
    if (!lastNameResult.isValid) {
      return lastNameResult.message || 'Last name is invalid';
    }
  }

  const emailResult = validation.email(profile.email);
  if (!emailResult.isValid) {
    return emailResult.message || 'Email is invalid';
  }

  if (profile.phone_primary) {
    const phoneResult = validation.phone(profile.phone_primary);
    if (!phoneResult.isValid) {
      return phoneResult.message || 'Phone number is invalid';
    }
  }

  if (profile.date_of_birth) {
    const dateResult = validation.date(profile.date_of_birth);
    if (!dateResult.isValid) {
      return dateResult.message || 'Date of birth is invalid';
    }
  }

  if (profile.postal_code) {
    const postalCodeResult = validation.postalCode(profile.postal_code);
    if (!postalCodeResult.isValid) {
      return postalCodeResult.message || 'Postal code is invalid';
    }
  }

  return null;
};

// Profile update handler
export const handleProfileUpdate = async (
  profile: ProfileData,
  updateUserProfile: (profile: any) => Promise<boolean>,
  setError: (error: string) => void,
  setSuccess: (success: string) => void,
  setIsSaving: (saving: boolean) => void,
  setIsEditing: (editing: boolean) => void
) => {
  setError('');
  setSuccess('');
  setIsSaving(true);

  try {
    const validationError = validateProfile(profile);
    if (validationError) {
      setError(validationError);
      setIsSaving(false);
      return;
    }

    const sanitizedProfile = {
      first_name: validation.sanitizeInput(profile.first_name),
      last_name: validation.sanitizeInput(profile.last_name),
      nickname: validation.sanitizeInput(profile.nickname),
      email: validation.sanitizeInput(profile.email),
      phone_primary: validation.sanitizeInput(profile.phone_primary),
      street_address: validation.sanitizeInput(profile.street_address),
      city: validation.sanitizeInput(profile.city),
      postal_code: validation.sanitizeInput(profile.postal_code),
      country: validation.sanitizeInput(profile.country),
      date_of_birth: validation.sanitizeInput(profile.date_of_birth),
    };
    
    const updateSuccess = await updateUserProfile(sanitizedProfile);

    if (updateSuccess) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      throw new Error('Profile update failed');
    }
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Profile update failed');
  } finally {
    setIsSaving(false);
  }
};

// Fetch recent donations (5 items for profile screen)
export const fetchRecentDonations = async (limit: number = 5): Promise<DonationHistoryItem[]> => {
  try {
    const result = await wordPressAPI.getUserDonations({ limit, offset: 0 });
    
    if (result.donations) {
      return result.donations.map(donation => ({
        id: donation.id,
        date: donation.date,
        amount: donation.amount,
        purpose: donation.purpose,
        currency: donation.currency || 'GBP',
        status: donation.status || 'Completed',
        receipt_id: `ISKLDN-${donation.id}`,
        financial_type: donation.financial_type,
        financial_type_id: donation.financial_type_id,
        source: donation.source
      }));
    }
    
    return [];
  } catch (error) {
    Logger.error('Failed to fetch recent donations', error);
    return [];
  }
};

// Fetch donation stats
export const fetchDonationStats = async (): Promise<DonationStats> => {
  try {
    const stats = await wordPressAPI.getDonationStats();
    
    return {
      success: stats.success || true,
      total_donations: stats.total_donations || 0,
      total_amount: stats.total_amount || 0,
      average_donation: stats.average_donation || 0,
      last_donation_date: stats.last_donation_date,
      recurring_donations: stats.recurring_donations || 0,
    };
  } catch (error) {
    Logger.error('Failed to fetch donation stats', error);
    return {
      success: false,
      total_donations: 0,
      total_amount: 0,
      average_donation: 0,
      recurring_donations: 0,
    };
  }
};

// Fetch all donations (for full history screen)
export const fetchAllDonations = async (): Promise<DonationHistoryItem[]> => {
  try {
    const result = await wordPressAPI.getUserDonations({ limit: 100, offset: 0 });
    
    if (result.donations) {
      return result.donations.map(donation => ({
        id: donation.id,
        date: donation.date,
        amount: donation.amount,
        purpose: donation.purpose,
        currency: donation.currency || 'GBP',
        status: donation.status || 'Completed',
        receipt_id: `ISKLDN-${donation.id}`,
        financial_type: donation.financial_type,
        financial_type_id: donation.financial_type_id,
        source: donation.source
      }));
    }
    
    return [];
  } catch (error) {
    Logger.error('Failed to fetch all donations', error);
    return [];
  }
};

// Send receipt
export const sendReceipt = async (contributionId: number, donorName: string): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await wordPressAPI.sendReceipt(contributionId, donorName);
    
    return {
      success: true,
      message: `Receipt ${result.receipt_id} sent successfully to ${result.sent_to || 'your email'}`
    };
  } catch (error) {
    Logger.error('Failed to send receipt', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send receipt. Please try again.'
    };
  }
};

// Get CiviCRM contact ID for Member ID display
export const fetchContactId = async (): Promise<number | null> => {
  try {
    const mapping = await wordPressAPI.getContactMapping();
    
    if (mapping.has_mapping && mapping.mapping?.contact_id) {
      return mapping.mapping.contact_id;
    }
    
    return null;
  } catch (error) {
    Logger.error('Failed to fetch contact ID', error);
    return null;
  }
};

// Initialize profile data
export const initializeProfileData = (user: any): ProfileData => {
  return {
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    nickname: user?.nickname || '',
    email: user?.email || '',
    phone_primary: user?.phone_primary || '',
    street_address: user?.street_address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
    country: user?.country || 'United Kingdom',
    date_of_birth: user?.date_of_birth || '',
  };
};

// FIXED: Menu items - Settings removed to prevent duplication
export const getMenuItems = () => [
  { 
    id: 'notifications', 
    title: 'Notifications', 
    action: () => {
      Alert.alert('Feature Coming Soon', 'Notification settings will be available in a future update.');
    }
  },
  { 
    id: 'privacy', 
    title: 'Privacy & Security', 
    action: () => {
      Alert.alert('Feature Coming Soon', 'Privacy settings will be available in a future update.');
    }
  },
  { 
    id: 'help', 
    title: 'Help & Support', 
    action: () => {
      Alert.alert(
        'Help & Support',
        'For assistance, please contact us at info@iskcon.london or visit our website.',
        [{ text: 'OK' }]
      );
    }
  },
  // Settings item removed to prevent duplication
];