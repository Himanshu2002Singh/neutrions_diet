// Input validation service
class ValidationService {
  /**
   * Validate health form data
   * @param {Object} formData - Health form data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validateHealthForm(formData) {
    const errors = [];

    // Required field validation
    if (!formData.weight || isNaN(parseFloat(formData.weight))) {
      errors.push("Valid weight is required");
    }
    
    if (!formData.height || isNaN(parseFloat(formData.height))) {
      errors.push("Valid height is required");
    }
    
    if (!formData.age || isNaN(parseInt(formData.age))) {
      errors.push("Valid age is required");
    }
    
    if (!formData.gender || !['male', 'female', 'other'].includes(formData.gender)) {
      errors.push("Valid gender is required");
    }
    
    if (!formData.activityLevel || !['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(formData.activityLevel)) {
      errors.push("Valid activity level is required");
    }

    // Range validation
    if (formData.weight) {
      const weight = parseFloat(formData.weight);
      if (weight < 20 || weight > 500) {
        errors.push("Weight must be between 20 and 500 kg");
      }
    }

    if (formData.height) {
      const height = parseFloat(formData.height);
      if (height < 100 || height > 250) {
        errors.push("Height must be between 100 and 250 cm");
      }
    }

    if (formData.age) {
      const age = parseInt(formData.age);
      if (age < 13 || age > 120) {
        errors.push("Age must be between 13 and 120 years");
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user registration data
   * @param {Object} userData - User registration data
   * @returns {Object} Validation result
   */
  validateUserRegistration(userData) {
    const errors = [];

    if (!userData.email || !userData.email.includes('@')) {
      errors.push("Valid email is required");
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (!userData.firstName || userData.firstName.trim().length === 0) {
      errors.push("First name is required");
    }

    if (!userData.lastName || userData.lastName.trim().length === 0) {
      errors.push("Last name is required");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new ValidationService();

