import ApiError from './ApiError.js';
import { TEXT_LIKE_TYPES, CHOICE_LIKE_TYPES, IMAGE_LIKE_TYPES } from './customizationTypes.js';

/**
 * Validates and normalizes the customization selections a customer submits
 * (e.g. from the cart) against the `customizationOptions` configured by the
 * admin on the product. Returns the normalized list to persist (with label,
 * type, and additionalPrice resolved server-side, never trusted from the
 * client) plus the total additional price those selections add.
 *
 * Adding a new customization type only requires adding a branch here (or
 * none, if it fits an existing category like TEXT_LIKE_TYPES) — no schema
 * migration is needed.
 */
export const validateCustomizationSelections = (product, rawSelections = []) => {
  const enabledOptions = (product.customizationOptions || []).filter((option) => option.isEnabled);
  const selectionMap = new Map((rawSelections || []).map((selection) => [selection.key, selection]));

  const normalized = [];
  let additionalPrice = 0;

  for (const option of enabledOptions) {
    const selection = selectionMap.get(option.key);
    const value = selection?.value;
    const hasValue =
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0);

    if (option.isRequired && !hasValue) {
      throw new ApiError(400, `"${option.label}" is required`);
    }

    if (!hasValue) continue;

    const rules = option.validation || {};

    if (TEXT_LIKE_TYPES.includes(option.type)) {
      const values = Array.isArray(value) ? value : [value];

      values.forEach((text) => {
        if (typeof text !== 'string') {
          throw new ApiError(400, `Invalid value provided for "${option.label}"`);
        }
        if (rules.minLength && text.length < rules.minLength) {
          throw new ApiError(400, `"${option.label}" must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && text.length > rules.maxLength) {
          throw new ApiError(400, `"${option.label}" cannot exceed ${rules.maxLength} characters`);
        }
      });

      if (option.type === 'multi_text_input') {
        if (rules.minSelections && values.length < rules.minSelections) {
          throw new ApiError(400, `"${option.label}" requires at least ${rules.minSelections} entries`);
        }
        if (rules.maxSelections && values.length > rules.maxSelections) {
          throw new ApiError(400, `"${option.label}" allows at most ${rules.maxSelections} entries`);
        }
      }
    }

    if (CHOICE_LIKE_TYPES.includes(option.type) || option.type === 'text_color') {
      if (option.choices?.length && !option.choices.includes(value)) {
        throw new ApiError(400, `Invalid selection provided for "${option.label}"`);
      }
    }

    if (option.type === 'date_input') {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        throw new ApiError(400, `Invalid date provided for "${option.label}"`);
      }
      if (rules.minDate && date < new Date(rules.minDate)) {
        throw new ApiError(400, `"${option.label}" must be on or after ${rules.minDate}`);
      }
      if (rules.maxDate && date > new Date(rules.maxDate)) {
        throw new ApiError(400, `"${option.label}" must be on or before ${rules.maxDate}`);
      }
    }

    if (IMAGE_LIKE_TYPES.includes(option.type)) {
      const urls = Array.isArray(value) ? value : [value];

      urls.forEach((url) => {
        if (typeof url !== 'string' || !url.startsWith('http')) {
          throw new ApiError(400, `Invalid image reference provided for "${option.label}"`);
        }
      });

      if (option.type === 'multi_image_upload') {
        if (rules.minSelections && urls.length < rules.minSelections) {
          throw new ApiError(400, `"${option.label}" requires at least ${rules.minSelections} images`);
        }
        if (rules.maxSelections && urls.length > rules.maxSelections) {
          throw new ApiError(400, `"${option.label}" allows at most ${rules.maxSelections} images`);
        }
      }
    }

    normalized.push({
      key: option.key,
      label: option.label,
      type: option.type,
      value,
      additionalPrice: option.additionalPrice || 0,
    });

    additionalPrice += option.additionalPrice || 0;
  }

  return { customizations: normalized, additionalPrice };
};
