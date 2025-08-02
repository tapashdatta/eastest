import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { Typography, FontFamilies } from '@/constants/Typography';
import { Colors, SemanticColors } from '@/constants/Colors';

interface TextProps extends RNTextProps {
  variant?: keyof typeof Typography;
  weight?: keyof typeof FontFamilies;
  color?: string;
  children: React.ReactNode;
}

export function Text({ 
  variant, 
  weight, 
  color = Colors.text, 
  style, 
  children, 
  ...props 
}: TextProps) {
  const getTextStyle = () => {
    if (variant) {
      return Typography[variant];
    }
    
    if (weight) {
      return { fontFamily: FontFamilies[weight] };
    }
    
    return { fontFamily: FontFamilies.regular };
  };

  const textStyle = [
    getTextStyle(),
    { color },
    style,
  ];

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
}

// Convenience components for common text types
export function DisplayText({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="displayMedium" {...props}>{children}</Text>;
}

export function HeadlineText({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="headlineMedium" {...props}>{children}</Text>;
}

export function TitleText({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="titleMedium" {...props}>{children}</Text>;
}

export function BodyText({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="bodyMedium" {...props}>{children}</Text>;
}

export function LabelText({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="labelMedium" {...props}>{children}</Text>;
}

export function CaptionText({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="caption" {...props}>{children}</Text>;
}

export function ButtonText({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="buttonText" {...props}>{children}</Text>;
}