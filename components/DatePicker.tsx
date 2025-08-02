import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import type { DateType } from 'react-native-ui-datepicker';
import { Calendar } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows, Layout } from '@/constants/CommonStyles';
import { LabelText, BodyText } from '@/components/Text';

interface SimpleDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  disabled = false,
  label,
  description,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const defaultStyles = useDefaultStyles();

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fixed: Use local date formatting to avoid timezone issues
  const formatDateForValue = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fixed: Create date from string parts to avoid timezone conversion
  const parseValueDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Fixed: Properly typed onChange handler for react-native-ui-datepicker
  const handleDateSelect = (params: { date: DateType }) => {
    // DateType can be Date | undefined, so we need to check
    if (params.date && params.date instanceof Date) {
      onChange(formatDateForValue(params.date));
      setShowPicker(false);
    }
  };

  const handleClear = (e: any) => {
    e.stopPropagation();
    onChange('');
  };

  // Convert string value to Date or undefined for the picker
  const getDateValue = (): DateType => {
    return value ? parseValueDate(value) : undefined;
  };

  return (
    <View>
      {/* Input Field */}
      <TouchableOpacity
        style={[
          styles.input,
          disabled && styles.inputDisabled,
          value && styles.inputWithValue,
        ]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Calendar 
          size={18} 
          color={disabled ? Colors.disabled : (value ? Colors.primary : Colors.textMuted)} 
        />
        <BodyText style={[
          styles.text,
          disabled && styles.textDisabled,
          value && styles.textWithValue,
        ]}>
          {value ? formatDateForDisplay(parseValueDate(value)) : placeholder}
        </BodyText>
        
        {value && !disabled && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <BodyText style={styles.clearText}>✕</BodyText>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {description && (
        <BodyText style={styles.description}>{description}</BodyText>
      )}

      {/* Date Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                {/* Header */}
                <View style={styles.header}>
                  <TouchableOpacity 
                    onPress={() => setShowPicker(false)}
                    style={styles.headerButton}
                  >
                    <BodyText style={styles.cancelText}>Cancel</BodyText>
                  </TouchableOpacity>
                  <View style={styles.headerTitleContainer}>
                    <LabelText style={styles.title}>
                      {label || 'Select Date'}
                    </LabelText>
                  </View>
                  <View style={styles.headerButton} />
                </View>

                {/* Date Picker - Fixed with type assertion for styles */}
                <View style={styles.calendarContainer}>
                  <DateTimePicker
                    mode="single"
                    date={getDateValue()}
                    onChange={handleDateSelect}
                    minDate={minimumDate}
                    maxDate={maximumDate}
                    styles={{
                      ...defaultStyles,
                      // Use type assertion to fix TypeScript errors
                      headerText: { 
                        color: Colors.text, 
                      } as any,
                      dayText: {
                        color: Colors.text, 
                      } as any,
                      dayNameText: {
                        color: Colors.text, 
                      } as any,
                      yearText: {
                        color: Colors.text, 
                      } as any,
                      monthText: {
                        color: Colors.text, 
                      } as any,
                      weekendDayText: {
                        color: Colors.text, 
                      } as any,
                      disabledDayText: {
                        color: Colors.textMuted, 
                      } as any,
                      selected: { 
                        backgroundColor: Colors.primary,
                      },
                      selectedText: { 
                        color: Colors.textLight, 
                        fontWeight: '600' 
                      },
                      today: { 
                        borderColor: Colors.primary,
                        borderWidth: 1,
                      },
                      todayText: {
                        color: Colors.primary,
                      },
                    } as any}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 50,
    ...Shadows.xs,
    gap: Spacing.md,
  },
  inputDisabled: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray200,
    opacity: 0.6,
  },
  inputWithValue: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadows.sm,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: Colors.textMuted,
  },
  textDisabled: {
    color: Colors.disabled,
  },
  textWithValue: {
    color: Colors.text,
    fontWeight: '500',
  },
  clearButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.error}1A`,
  },
  clearText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.text,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
    ...Shadows.lg,
  },
  header: {
    ...Layout.flexRow,
    ...Layout.spaceBetween,
    ...Layout.centerVertical,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerButton: {
    minWidth: 60,
    height: 44,
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '400',
  },
  title: {
    fontWeight: '600',
    fontSize: 17,
    color: Colors.text,
    textAlign: 'center',
  },
  calendarContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});

export default SimpleDatePicker;