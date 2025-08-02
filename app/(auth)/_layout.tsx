import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="welcome" 
        options={{
          gestureEnabled: false, // Prevent back swipe gesture
          animation: 'fade', // Smooth transition
        }}
      />
      <Stack.Screen 
        name="login" 
        options={{
          gestureEnabled: true, // Allow back gesture to welcome
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          gestureEnabled: true, // Allow back gesture to welcome  
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}