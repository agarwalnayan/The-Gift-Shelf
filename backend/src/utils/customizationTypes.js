/**
 * Central registry of supported product customization types.
 *
 * To add a new customization type in the future, add an entry here and (if it
 * needs type-specific validation) a case in validateCustomizations.js. The
 * Product schema stores `type` as a plain string (not a Mongoose enum), so
 * new types never require a database migration.
 */
export const CUSTOMIZATION_TYPES = [
  { value: 'image_upload', label: 'Image Upload', category: 'media' },
  { value: 'multi_image_upload', label: 'Multiple Image Upload', category: 'media' },
  { value: 'text_input', label: 'Single Text Input', category: 'text' },
  { value: 'multi_text_input', label: 'Multiple Text Inputs', category: 'text' },
  { value: 'date_input', label: 'Date Input', category: 'date' },
  { value: 'dropdown', label: 'Dropdown Selection', category: 'choice' },
  { value: 'font_selection', label: 'Font Selection', category: 'choice' },
  { value: 'text_color', label: 'Text Color', category: 'choice' },
  { value: 'gift_message', label: 'Gift Message', category: 'text' },
  { value: 'greeting_card', label: 'Greeting Card', category: 'choice' },
  { value: 'gift_wrapping', label: 'Gift Wrapping', category: 'choice' },
  { value: 'special_instructions', label: 'Special Instructions', category: 'text' },
];

export const CUSTOMIZATION_TYPE_VALUES = CUSTOMIZATION_TYPES.map((type) => type.value);

export const isValidCustomizationType = (type) => CUSTOMIZATION_TYPE_VALUES.includes(type);

// Types whose validation revolves around a text value (length limits, pattern, etc.)
export const TEXT_LIKE_TYPES = ['text_input', 'multi_text_input', 'gift_message', 'special_instructions'];

// Types where the admin defines a fixed list of choices the customer picks from.
export const CHOICE_LIKE_TYPES = ['dropdown', 'font_selection', 'greeting_card', 'gift_wrapping'];

// Types that require the customer to upload one or more images.
export const IMAGE_LIKE_TYPES = ['image_upload', 'multi_image_upload'];
