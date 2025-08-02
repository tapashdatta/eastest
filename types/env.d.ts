declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Base URLs - Centralized configuration
      EXPO_PUBLIC_WORDPRESS_BASE_URL: string;
      EXPO_PUBLIC_MOBILE_API_BASE_URL: string;
      EXPO_PUBLIC_JWT_API_BASE_URL: string;
      
      // WordPress API Configuration
      EXPO_PUBLIC_WORDPRESS_URL: string;
      EXPO_PUBLIC_JWT_SECRET: string;
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_WORDPRESS_API_KEY: string;
      
      // CiviCRM Configuration
      EXPO_PUBLIC_CIVICRM_SITE_KEY: string;
      EXPO_PUBLIC_CIVICRM_API_KEY: string;
      
      // Stripe Configuration
      EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
      STRIPE_SECRET_KEY: string;

      // Google Drive Configuration
      EXPO_PUBLIC_GOOGLE_API_KEY: string;
      EXPO_PUBLIC_GOOGLE_DRIVE_FOLDER_ID: string;
    }
  }
}

// Ensure this file is treated as a module
export {};