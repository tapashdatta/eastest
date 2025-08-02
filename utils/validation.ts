// utils/validation.ts - FIXED - Streamlined validation utility
interface ValidationResult {
  isValid: boolean;
  message?: string;
}

class SafeValidation {
  /**
   * Validate donation amount
   */
  amount(amount: number | string): ValidationResult {
    try {
      const numAmount = Number(amount);
      
      if (isNaN(numAmount)) {
        return { isValid: false, message: 'Amount must be a valid number' };
      }
      
      if (numAmount <= 0) {
        return { isValid: false, message: 'Amount must be greater than £0' };
      }
      
      if (numAmount < 0.50) {
        return { isValid: false, message: 'Minimum donation amount is £0.50' };
      }
      
      if (numAmount > 50000) {
        return { isValid: false, message: 'Maximum donation amount is £50,000' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, message: 'Invalid amount format' };
    }
  }

  /**
   * Validate name fields
   */
  name(name: string, fieldName: string = 'Name'): ValidationResult {
    try {
      if (!name || typeof name !== 'string') {
        return { isValid: false, message: `${fieldName} is required` };
      }
      
      const trimmedName = name.trim();
      
      if (trimmedName.length < 2) {
        return { isValid: false, message: `${fieldName} must be at least 2 characters` };
      }
      
      if (trimmedName.length > 50) {
        return { isValid: false, message: `${fieldName} must be 50 characters or less` };
      }
      
      // Basic validation for reasonable name format
      if (!/^[a-zA-Z\s\-'\.]+$/.test(trimmedName)) {
        return { isValid: false, message: `${fieldName} contains invalid characters` };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, message: `${fieldName} is invalid` };
    }
  }

  /**
   * Validate email address
   */
  email(email: string): ValidationResult {
    try {
      if (!email || typeof email !== 'string') {
        return { isValid: false, message: 'Email address is required' };
      }
      
      const trimmedEmail = email.trim().toLowerCase();
      
      if (trimmedEmail.length === 0) {
        return { isValid: false, message: 'Email address is required' };
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return { isValid: false, message: 'Please enter a valid email address' };
      }
      
      if (trimmedEmail.length > 100) {
        return { isValid: false, message: 'Email address is too long' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, message: 'Invalid email format' };
    }
  }

  /**
   * Validate phone number (UK focused)
   */
  phone(phone: string): ValidationResult {
    try {
      if (!phone || typeof phone !== 'string') {
        return { isValid: true }; // Phone is optional
      }
      
      const trimmedPhone = phone.trim();
      
      if (trimmedPhone.length === 0) {
        return { isValid: true }; // Empty phone is valid (optional)
      }
      
      // Remove common phone formatting
      const cleanPhone = trimmedPhone.replace(/[\s\-\(\)\.]/g, '');
      
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        return { isValid: false, message: 'Phone number must be 7-15 digits' };
      }
      
      // Basic check for digits and + sign
      if (!/^[\+]?[0-9]+$/.test(cleanPhone)) {
        return { isValid: false, message: 'Phone number contains invalid characters' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, message: 'Invalid phone number format' };
    }
  }

  /**
   * Validate postal code (UK focused)
   */
  postalCode(postalCode: string): ValidationResult {
    try {
      if (!postalCode || typeof postalCode !== 'string') {
        return { isValid: true }; // Postal code is optional in some contexts
      }
      
      const trimmedCode = postalCode.trim().toUpperCase();
      
      if (trimmedCode.length === 0) {
        return { isValid: true }; // Empty postal code is valid if optional
      }
      
      // Basic UK postcode validation
      const ukPostcodeRegex = /^[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2}$/;
      if (!ukPostcodeRegex.test(trimmedCode)) {
        return { isValid: false, message: 'Please enter a valid UK postal code' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, message: 'Invalid postal code format' };
    }
  }

  /**
   * Validate address fields
   */
  address(address: string, fieldName: string = 'Address'): ValidationResult {
    try {
      if (!address || typeof address !== 'string') {
        return { isValid: true }; // Address is optional in some contexts
      }
      
      const trimmedAddress = address.trim();
      
      if (trimmedAddress.length === 0) {
        return { isValid: true }; // Empty address is valid if optional
      }
      
      if (trimmedAddress.length < 3) {
        return { isValid: false, message: `${fieldName} must be at least 3 characters` };
      }
      
      if (trimmedAddress.length > 100) {
        return { isValid: false, message: `${fieldName} must be 100 characters or less` };
      }
      
      // Basic validation for reasonable address format
      // Allow alphanumeric, spaces, commas, periods, hyphens, apostrophes, and hash
      if (!/^[a-zA-Z0-9\s,\.\-\'#\/]+$/.test(trimmedAddress)) {
        return { isValid: false, message: `${fieldName} contains invalid characters` };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, message: `${fieldName} is invalid` };
    }
  }

  /**
   * Validate message
   */
  message(message: string): ValidationResult {
    try {
      if (!message || typeof message !== 'string') {
        return { isValid: true }; // Message is optional
      }
      
      const trimmedMessage = message.trim();
      
      if (trimmedMessage.length === 0) {
        return { isValid: true }; // Empty message is valid
      }
      
      if (trimmedMessage.length > 500) {
        return { isValid: false, message: 'Message must be 500 characters or less' };
      }
      
      // Basic check for potentially harmful content
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /onload=/i,
        /onerror=/i
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(trimmedMessage)) {
          return { isValid: false, message: 'Message contains invalid content' };
        }
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, message: 'Invalid message format' };
    }
  }

  /**
   * Validate date
   */
  date(dateString: string): ValidationResult {
    try {
      if (!dateString || typeof dateString !== 'string') {
        return { isValid: true }; // Date might be optional
      }
      
      const trimmedDate = dateString.trim();
      
      if (trimmedDate.length === 0) {
        return { isValid: true }; // Empty date is valid if optional
      }
      
      const date = new Date(trimmedDate);
      
      if (isNaN(date.getTime())) {
        return { isValid: false, message: 'Please enter a valid date' };
      }
      
      // Check if date is not too far in the past or future
      const now = new Date();
      const twoYearsAgo = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
      const twoYearsFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      
      if (date < twoYearsAgo) {
        return { isValid: false, message: 'Date cannot be more than 100 years in the past' };
      }
      
      if (date > twoYearsFromNow) {
        return { isValid: false, message: 'Date cannot be more than 1 year in the future' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, message: 'Invalid date format' };
    }
  }

  /**
   * Validate required field
   */
  required(value: string | undefined | null, fieldName: string = 'Field'): ValidationResult {
    try {
      if (!value || typeof value !== 'string') {
        return { isValid: false, message: `${fieldName} is required` };
      }
      
      if (value.trim().length === 0) {
        return { isValid: false, message: `${fieldName} is required` };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, message: `${fieldName} is invalid` };
    }
  }

  /**
   * Sanitize input to prevent XSS
   */
  sanitizeInput(input: string): string {
    try {
      if (!input || typeof input !== 'string') {
        return '';
      }
      
      return input
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript protocol
        .replace(/vbscript:/gi, '') // Remove vbscript protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .substring(0, 500); // Limit length
    } catch (error) {
      return '';
    }
  }
}

// Export singleton instance
const validation = new SafeValidation();
export default validation;