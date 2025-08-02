# Base URLs - Centralized Configuration
EXPO_PUBLIC_WORDPRESS_BASE_URL=https://iskconlondon.com
EXPO_PUBLIC_MOBILE_API_BASE_URL=https://iskconlondon.com/wp-json/mobile-app/v108


EXPO_PUBLIC_API_BASE_URL=https://iskconlondon.com
EXPO_PUBLIC_API_KEY=mar_PUABmClH1iHlfMTKzNyfS9xalnv0axvz
# App Configuration  
EXPO_PUBLIC_APP_NAME=ISKCON London
EXPO_PUBLIC_APP_VERSION=2.0.0
# Google Drive Configuration
EXPO_PUBLIC_GOOGLE_API_KEY=AIzaSyDyAQWFNthjgxmIgH79roIvLt8N4ends6w
EXPO_PUBLIC_GOOGLE_DRIVE_FOLDER_ID=18bHutKNRBu_PwBg3b4jwumdhpylS4rgJ

EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug