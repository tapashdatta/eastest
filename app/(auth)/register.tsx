import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/Colors';
import { Text, HeadlineText, BodyText, LabelText, ButtonText, CaptionText, TitleText } from '@/components/Text';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import KeyboardAwareContainer from '@/components/KeyboardAwareContainer';
import { deviceManager } from '@/services/DeviceManager';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorOverlay, setShowErrorOverlay] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const { register } = useAuth();
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  // Get device info on component mount
  useEffect(() => {
    const getDeviceInfo = async () => {
      try {
        const info = await deviceManager.getDeviceInfo();
        setDeviceInfo(info);
      } catch (err) {
        // Handle error silently in production
      }
    };
    
    getDeviceInfo();
  }, []);

  const showError = (errorMessage: string) => {
    setError(errorMessage);
    setShowErrorOverlay(true);
  };

  const handleRegister = async () => {
    setError('');
    setShowErrorOverlay(false);
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    const registrationData = {
      email,
      password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      ...deviceInfo
    };
    
    try {
      await register(registrationData);
      
      // Show success overlay
      setShowSuccessOverlay(true);
      
      // Navigate after delay to show the overlay
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderErrorOverlay = () => {
    if (!showErrorOverlay || !error) return null;

    return (
      <View style={styles.errorOverlay}>
        <View style={styles.errorContent}>
          <View style={styles.errorHeader}>
            <AlertTriangle size={48} color="#dc3545" />
            <TitleText style={styles.errorTitle}>Registration Error</TitleText>
          </View>
          
          <BodyText style={styles.errorMessage}>
            {error}
          </BodyText>
          
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => {
              setShowErrorOverlay(false);
              setError('');
            }}
            accessible={true}
            accessibilityLabel="Close error message"
            accessibilityRole="button"
          >
            <ButtonText style={styles.errorButtonText}>Try Again</ButtonText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSuccessOverlay = () => {
    if (!showSuccessOverlay) return null;

    return (
      <View style={styles.successOverlay}>
        <View style={styles.successContent}>
          <View style={styles.successHeader}>
            <CheckCircle size={48} color="#28a745" />
            <TitleText style={styles.successTitle}>Welcome Aboard!</TitleText>
          </View>
          
          <BodyText style={styles.successMessage}>
            Your account has been created successfully. You're now part of our spiritual community.
          </BodyText>
          
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#28a745" />
            <LabelText style={styles.loadingText}>Taking you to your dashboard...</LabelText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <KeyboardAwareContainer
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        extraScrollHeight={60}
        style={styles.keyboardContainer}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoading || showErrorOverlay || showSuccessOverlay}
        >
          <ArrowLeft size={24} color="rgba(255, 255, 255, 0.9)" />
        </TouchableOpacity>

        {/* Top Animation Area */}
        <View style={styles.animationArea}>
          <LottieView
            ref={animationRef}
            source={require('@/assets/animation/signin.json')}
            autoPlay={true}
            loop={true}
            speed={0.8}
            style={styles.lottieAnimation}
            resizeMode="contain"
          />
        </View>

        {/* Bottom Form Card */}
        <View style={styles.formCard}>
          {/* Header */}
          <View style={styles.header}>
            <HeadlineText style={styles.title}>Create Account</HeadlineText>
            <BodyText style={styles.subtitle}>Begin your spiritual journey with us</BodyText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <TextInput
                  style={styles.input}
                  placeholder="First name *"
                  placeholderTextColor="rgba(45, 59, 47, 0.5)"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  editable={!isLoading && !showErrorOverlay && !showSuccessOverlay}
                />
              </View>
              
              <View style={[styles.inputContainer, styles.halfInput]}>
                <TextInput
                  style={styles.input}
                  placeholder="Last name *"
                  placeholderTextColor="rgba(45, 59, 47, 0.5)"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  editable={!isLoading && !showErrorOverlay && !showSuccessOverlay}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email address *"
                placeholderTextColor="rgba(45, 59, 47, 0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                editable={!isLoading && !showErrorOverlay && !showSuccessOverlay}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password *"
                placeholderTextColor="rgba(45, 59, 47, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                editable={!isLoading && !showErrorOverlay && !showSuccessOverlay}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading || showErrorOverlay || showSuccessOverlay}
              >
                {showPassword ? (
                  <EyeOff size={20} color="rgba(45, 59, 47, 0.6)" />
                ) : (
                  <Eye size={20} color="rgba(45, 59, 47, 0.6)" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirm password *"
                placeholderTextColor="rgba(45, 59, 47, 0.5)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                editable={!isLoading && !showErrorOverlay && !showSuccessOverlay}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading || showErrorOverlay || showSuccessOverlay}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="rgba(45, 59, 47, 0.6)" />
                ) : (
                  <Eye size={20} color="rgba(45, 59, 47, 0.6)" />
                )}
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.loginLink}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/login')}
                disabled={isLoading || showErrorOverlay || showSuccessOverlay}
              >
                <Text style={styles.loginLinkText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              style={[
                styles.createButton, 
                (isLoading || showErrorOverlay || showSuccessOverlay) && styles.buttonDisabled
              ]}
              onPress={handleRegister}
              disabled={isLoading || showErrorOverlay || showSuccessOverlay}
            >
              {isLoading ? (
                <View style={styles.loadingButtonContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <ButtonText style={[styles.createButtonText, { marginLeft: 8 }]}>
                    Creating Account...
                  </ButtonText>
                </View>
              ) : (
                <ButtonText style={styles.createButtonText}>
                  Create Account
                </ButtonText>
              )}
            </TouchableOpacity>

            {/* Required Fields Note */}
            <View style={styles.requiredNote}>
              <CaptionText style={styles.requiredText}>* Required fields</CaptionText>
            </View>
          </View>
        </View>
      </KeyboardAwareContainer>

      {/* Error Overlay */}
      {renderErrorOverlay()}

      {/* Success Overlay */}
      {renderSuccessOverlay()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B9A8C', // Sage green background
  },
  keyboardContainer: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 20,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 50,
  },
  animationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 0, // Reduced from 100 to match login screen
    paddingBottom: 0,
    minHeight: height * 0.05,
  },
  lottieAnimation: {
    width: 200, // Fixed size like login screen
    height: 200, // Fixed size like login screen
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 32,
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    minHeight: height * 0.6,
    margin: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#2D3B2F',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7B6D',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 20,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(139, 154, 140, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2D3B2F',
    paddingVertical: 0,
    height: 36,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  loginText: {
    fontSize: 14,
    color: '#6B7B6D',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#2D3B2F',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#2D3B2F',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requiredNote: {
    alignItems: 'center',
  },
  requiredText: {
    fontSize: 12,
    color: '#6B7B6D',
    opacity: 0.8,
  },
  // Error Overlay Styles
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  errorContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: width * 0.85,
    minWidth: width * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  errorHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#dc3545',
    marginTop: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7B6D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#2D3B2F',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Success Overlay Styles
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: width * 0.85,
    minWidth: width * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  successHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2D3B2F',
    marginTop: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7B6D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#28a745',
    marginLeft: 12,
    fontWeight: '500',
  },
});