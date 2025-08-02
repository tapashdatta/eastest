// app/index.tsx
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function IndexScreen() {
  useEffect(() => {
    // Immediately redirect to splash screen
    router.replace('/splash');
  }, []);

  return null; // This screen just redirects
}