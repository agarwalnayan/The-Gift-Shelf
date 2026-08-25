import ApiError from './ApiError.js';

/**
 * Validates a submitted customization against the product's customization options configuration.
 * Returns the validated customization object with server-authoritative values.
 * 
 * @param {Object} product - The loaded Product model document.
 * @param {Object} submittedCustomization - The customization object submitted by the client.
 * @returns {Object} Validated customization object.
 */
export const validateCustomization = (product, submittedCustomization) => {
  const option = product.customizationOptions.find(o => o.key === submittedCustomization.key);
  if (!option) {
    throw new ApiError(400, `Customization option not found: ${submittedCustomization.key}`);
  }

  if (!option.isEnabled) {
    throw new ApiError(400, `Customization option is disabled: ${option.label}`);
  }

  // Validate required field
  if (option.isRequired && (!submittedCustomization.value || submittedCustomization.value === '')) {
    throw new ApiError(400, `${option.label} is required`);
  }

  // Validate type
  if (submittedCustomization.type !== option.type) {
    throw new ApiError(400, `Invalid customization type for ${option.label}`);
  }

  // Validate choices
  if (option.choices && option.choices.length > 0) {
    const submittedValue = Array.isArray(submittedCustomization.value) 
      ? submittedCustomization.value 
      : [submittedCustomization.value];
    const invalidChoices = submittedValue.filter(v => v && !option.choices.includes(v));
    if (invalidChoices.length > 0) {
      throw new ApiError(400, `Invalid choice for ${option.label}`);
    }
  }

  // Validate length constraints
  if (option.validation && typeof submittedCustomization.value === 'string') {
    const { minLength, maxLength } = option.validation;
    if (minLength && submittedCustomization.value.length < minLength) {
      throw new ApiError(400, `${option.label} must be at least ${minLength} characters`);
    }
    if (maxLength && submittedCustomization.value.length > maxLength) {
      throw new ApiError(400, `${option.label} must not exceed ${maxLength} characters`);
    }
  }

  // Ensure additionalPrice matches product configuration (customer cannot change price)
  if (submittedCustomization.additionalPrice !== (option.additionalPrice || 0)) {
    throw new ApiError(400, 'Cannot modify customization price');
  }
  
  return {
    ...submittedCustomization,
    additionalPrice: option.additionalPrice || 0 // Explicitly set to server-authoritative value
  };
};
