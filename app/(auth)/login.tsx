import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/Colors';
import { Text, HeadlineText, BodyText, LabelText, ButtonText, TitleText } from '@/components/Text';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import KeyboardAwareContainer from '@/components/KeyboardAwareContainer';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorOverlay, setShowErrorOverlay] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const { login } = useAuth();
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  const showError = (errorMessage: string) => {
    setError(errorMessage);
    setShowErrorOverlay(true);
  };

  const handleLogin = async () => {
    setError('');
    setShowErrorOverlay(false);
    
    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email, password);
      
      // Show success overlay briefly before navigation
      setShowSuccessOverlay(true);
      
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password';
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
            <TitleText style={styles.errorTitle}>Sign In Error</TitleText>
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
            <TitleText style={styles.successTitle}>Welcome Back!</TitleText>
          </View>
          
          <BodyText style={styles.successMessage}>
            Sign in successful. Taking you to your dashboard...
          </BodyText>
          
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#28a745" />
            <LabelText style={styles.loadingText}>Loading your dashboard...</LabelText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <KeyboardAwareContainer
        behavior="padding"
        extraScrollHeight={40}
        style={styles.keyboardContainer}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoading || showErrorOverlay || showSuccessOverlay}
        >
          <ArrowLeft size={24} color="rgba(255, 255, 255, 0.9)" />
        </TouchableOpacity>

        {/* Lottie Animation - Outside card */}
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

        {/* Form Card at Bottom */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <HeadlineText style={styles.title}>Let's get started</HeadlineText>
            <BodyText style={styles.welcomeBack}>Welcome Back</BodyText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Phone, email or username"
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
                placeholder="Password"
                placeholderTextColor="rgba(45, 59, 47, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
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

            {/* Register Link */}
            <View style={styles.registerLink}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/register')}
                disabled={isLoading || showErrorOverlay || showSuccessOverlay}
              >
                <Text style={styles.registerLinkText}>Register</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[
                styles.signInButton, 
                (isLoading || showErrorOverlay || showSuccessOverlay) && styles.buttonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoading || showErrorOverlay || showSuccessOverlay}
            >
              {isLoading ? (
                <View style={styles.loadingButtonContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <ButtonText style={[styles.signInButtonText, { marginLeft: 8 }]}>
                    Signing In...
                  </ButtonText>
                </View>
              ) : (
                <ButtonText style={styles.signInButtonText}>
                  Sign In
                </ButtonText>
              )}
            </TouchableOpacity>
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
  },
  lottieAnimation: {
    width: 200, // Back to original size
    height: 200, // Back to original size
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    backdropFilter: 'blur(10px)',
    maxWidth: 400,
    alignSelf: 'center',
    width: width - 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2D3B2F',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeBack: {
    fontSize: 18,
    color: '#2D3B2F',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7B6D',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(139, 154, 140, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2D3B2F',
    paddingVertical: 0,
    height: 40,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  registerText: {
    fontSize: 14,
    color: '#6B7B6D',
  },
  registerLinkText: {
    fontSize: 14,
    color: '#2D3B2F',
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#2D3B2F',
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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